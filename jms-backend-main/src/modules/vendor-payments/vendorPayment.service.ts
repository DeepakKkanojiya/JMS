import { prisma } from '../../database';
import { Prisma, VendorPaymentStatus, PurchaseBillStatus } from '../../generated/prisma';
import { vendorPaymentRepository, purchaseBillRepository, vendorRepository, branchRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreateVendorPaymentInput,
  VendorPaymentQueryOptions,
} from './vendorPayment.types';

export class VendorPaymentService {
  /**
   * Generates a collision-safe sequential payment number inside transaction: VPAY-YYYY-XXXXX
   */
  private async generatePaymentNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `VPAY-${year}-`;

    const count = await client.vendorPayment.count({
      where: { paymentNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let paymentNumber = `${prefix}${seq.toString().padStart(5, '0')}`;

    // Ensure uniqueness
    let existing = await client.vendorPayment.findUnique({ where: { paymentNumber } });
    while (existing) {
      seq++;
      paymentNumber = `${prefix}${seq.toString().padStart(5, '0')}`;
      existing = await client.vendorPayment.findUnique({ where: { paymentNumber } });
    }

    return paymentNumber;
  }

  /**
   * Create a new Vendor Payment atomically inside a transaction
   */
  async createVendorPayment(dto: CreateVendorPaymentInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch PurchaseBill inside transaction
      const bill = await tx.purchaseBill.findUnique({
        where: { id: dto.purchaseBillId },
      });

      if (!bill) {
        throw new NotFoundError('Purchase Bill not found');
      }

      // 2. Status Guard: Payment allowed ONLY for APPROVED or PARTIALLY_PAID bills
      if (bill.status === PurchaseBillStatus.DRAFT || bill.status === PurchaseBillStatus.SUBMITTED) {
        throw new BadRequestError(`Cannot record payment for a Purchase Bill in ${bill.status} status. Bill must be APPROVED or PARTIALLY_PAID`);
      }

      if (bill.status === PurchaseBillStatus.CANCELLED) {
        throw new BadRequestError('Cannot record payment for a CANCELLED purchase bill');
      }

      if (bill.status === PurchaseBillStatus.PAID) {
        throw new ConflictError('Purchase Bill is already fully PAID');
      }

      if (bill.status !== PurchaseBillStatus.APPROVED && bill.status !== PurchaseBillStatus.PARTIALLY_PAID) {
        throw new BadRequestError(`Cannot record payment for Purchase Bill in ${bill.status} status`);
      }

      // 3. Amount Guard: amount > 0
      const paymentAmount = new Prisma.Decimal(dto.amount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (paymentAmount.lte(0)) {
        throw new BadRequestError('Payment amount must be greater than 0');
      }

      // 4. Vendor & Branch Matching Guards
      if (bill.vendorId !== dto.vendorId) {
        throw new BadRequestError('Vendor ID does not match the Purchase Bill vendor');
      }

      const vendor = await tx.vendor.findUnique({ where: { id: dto.vendorId } });
      if (!vendor) {
        throw new NotFoundError('Vendor not found');
      }
      if (!vendor.isActive) {
        throw new BadRequestError('Cannot process payment for an inactive vendor');
      }

      if (bill.branchId !== dto.branchId) {
        throw new BadRequestError('Branch ID does not match the Purchase Bill branch');
      }

      const branch = await tx.branch.findUnique({ where: { id: dto.branchId } });
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }
      if (!branch.isActive) {
        throw new BadRequestError('Cannot process payment for an inactive branch');
      }

      // 5. Overpayment Protection (Calculate current completed payments)
      const completedTotal = await vendorPaymentRepository.getCompletedPaymentTotal(dto.purchaseBillId, tx);
      const grandTotal = new Prisma.Decimal(bill.grandTotal);
      const currentOutstanding = grandTotal.sub(completedTotal).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      if (paymentAmount.gt(currentOutstanding)) {
        throw new ConflictError(
          `Payment amount ₹${paymentAmount.toFixed(2)} exceeds remaining outstanding amount ₹${currentOutstanding.toFixed(2)} for purchase bill '${bill.billNumber}'`
        );
      }

      // 6. Generate Payment Number
      const paymentNumber = await this.generatePaymentNumber(tx);

      // 7. Create VendorPayment
      const payment = await vendorPaymentRepository.create(
        {
          purchaseBillId: dto.purchaseBillId,
          vendorId: dto.vendorId,
          branchId: dto.branchId,
          paymentNumber,
          paymentMethod: dto.paymentMethod,
          amount: paymentAmount,
          status: VendorPaymentStatus.COMPLETED,
          transactionReference: dto.transactionReference || null,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          remarks: dto.remarks || null,
          receivedBy: userId || null,
          processedBy: userId || null,
        },
        tx
      );

      // 8. Update PurchaseBill totals and status
      const newTotalPaid = completedTotal.add(paymentAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      let newOutstanding = grandTotal.sub(newTotalPaid).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (newOutstanding.lt(0)) {
        newOutstanding = new Prisma.Decimal(0);
      }

      let newStatus: PurchaseBillStatus = PurchaseBillStatus.PARTIALLY_PAID;
      if (newOutstanding.equals(0) || newTotalPaid.gte(grandTotal)) {
        newStatus = PurchaseBillStatus.PAID;
        newOutstanding = new Prisma.Decimal(0);
      }

      await tx.purchaseBill.update({
        where: { id: dto.purchaseBillId },
        data: {
          totalPaid: newTotalPaid,
          outstandingAmount: newOutstanding,
          status: newStatus,
          updatedBy: userId || undefined,
        },
      });

      return payment;
    });
  }

  /**
   * Reverse a completed vendor payment atomically
   */
  async reverseVendorPayment(id: string, reversalReason: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await vendorPaymentRepository.findById(id, tx);
      if (!payment) {
        throw new NotFoundError('Vendor Payment not found');
      }

      if (payment.status !== VendorPaymentStatus.COMPLETED) {
        throw new BadRequestError(`Only COMPLETED vendor payments can be reversed. Current status is ${payment.status}`);
      }

      if (!reversalReason || reversalReason.trim().length < 3) {
        throw new BadRequestError('Mandatory reversal reason must be provided (at least 3 characters)');
      }

      // 1. Mark payment as REVERSED
      const reversedPayment = await vendorPaymentRepository.reverse(
        id,
        {
          reversedBy: userId || 'SYSTEM',
          reversalReason: reversalReason.trim(),
          reversedAt: new Date(),
        },
        tx
      );

      // 2. Recalculate PurchaseBill totals based on COMPLETED payments only
      const purchaseBillId = payment.purchaseBillId;
      const bill = await tx.purchaseBill.findUnique({
        where: { id: purchaseBillId },
      });

      if (!bill) {
        throw new NotFoundError('Purchase Bill not found for payment');
      }

      const completedTotal = await vendorPaymentRepository.getCompletedPaymentTotal(purchaseBillId, tx);
      const grandTotal = new Prisma.Decimal(bill.grandTotal);
      let newOutstanding = grandTotal.sub(completedTotal).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (newOutstanding.lt(0)) {
        newOutstanding = new Prisma.Decimal(0);
      }

      let newStatus: PurchaseBillStatus = PurchaseBillStatus.APPROVED;
      if (completedTotal.equals(0)) {
        newStatus = PurchaseBillStatus.APPROVED;
      } else if (completedTotal.gte(grandTotal)) {
        newStatus = PurchaseBillStatus.PAID;
        newOutstanding = new Prisma.Decimal(0);
      } else {
        newStatus = PurchaseBillStatus.PARTIALLY_PAID;
      }

      await tx.purchaseBill.update({
        where: { id: purchaseBillId },
        data: {
          totalPaid: completedTotal.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
          outstandingAmount: newOutstanding,
          status: newStatus,
          updatedBy: userId || undefined,
        },
      });

      return reversedPayment;
    });
  }

  async getVendorPaymentById(id: string) {
    const payment = await vendorPaymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Vendor Payment not found');
    }
    return payment;
  }

  async getAllVendorPayments(options: VendorPaymentQueryOptions) {
    return vendorPaymentRepository.findAll(options);
  }

  async getPurchaseBillPaymentHistory(purchaseBillId: string) {
    const bill = await purchaseBillRepository.findById(purchaseBillId);
    if (!bill) {
      throw new NotFoundError('Purchase Bill not found');
    }
    return vendorPaymentRepository.findByPurchaseBillId(purchaseBillId);
  }

  async getPurchaseBillPaymentSummary(purchaseBillId: string) {
    const summary = await vendorPaymentRepository.getPaymentSummary(purchaseBillId);
    if (!summary) {
      throw new NotFoundError('Purchase Bill not found');
    }
    return summary;
  }

  async getVendorPaymentHistory(vendorId: string) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return vendorPaymentRepository.findByVendorId(vendorId);
  }

  async getVendorPayableSummary(vendorId: string) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return vendorPaymentRepository.getVendorPayableSummary(vendorId);
  }
}

export const vendorPaymentService = new VendorPaymentService();
