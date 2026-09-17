import { prisma } from '../../database';
import { PaymentStatus, Prisma } from '../../generated/prisma';
import { salesPaymentRepository, salesInvoiceRepository, documentSeriesRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import { CreateSalesPaymentDTO, ReverseSalesPaymentDTO, SalesPaymentQueryDTO } from './salesPayment.types';

export class SalesPaymentService {
  /**
   * Record a new sales payment for a CONFIRMED invoice atomically.
   */
  async createPayment(dto: CreateSalesPaymentDTO, receivedByUserId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch sales invoice inside transaction
      const invoice = await tx.salesInvoice.findUnique({
        where: { id: dto.salesInvoiceId },
        include: { branch: true },
      });

      if (!invoice) {
        throw new NotFoundError(`Sales invoice with ID '${dto.salesInvoiceId}' not found.`);
      }

      // 2. Status Guard: Invoice MUST be in CONFIRMED status
      if (invoice.status !== 'CONFIRMED') {
        throw new BadRequestError(
          `Payments can only be recorded for CONFIRMED sales invoices. Current status of invoice '${invoice.invoiceNumber}' is '${invoice.status}'.`
        );
      }

      // 3. Amount Guard: Amount must be > 0
      const paymentAmount = new Prisma.Decimal(dto.amount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (paymentAmount.lte(0)) {
        throw new BadRequestError('Payment amount must be greater than 0.');
      }

      // 4. Overpayment Protection: Calculate current completed total, exchange credit & outstanding amount
      const completedTotal = await salesPaymentRepository.getCompletedPaymentTotal(dto.salesInvoiceId, tx);
      const grandTotal = new Prisma.Decimal(invoice.grandTotal);
      const exchangeCredit = new Prisma.Decimal(invoice.exchangeCredit || 0);
      const netPayable = grandTotal.sub(exchangeCredit);
      const currentOutstanding = netPayable.sub(completedTotal).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      if (paymentAmount.gt(currentOutstanding)) {
        throw new ConflictError(
          `Payment amount ₹${paymentAmount.toFixed(2)} exceeds remaining outstanding amount ₹${currentOutstanding.toFixed(2)} for sales invoice '${invoice.invoiceNumber}'.`
        );
      }

      // 5. Collision-safe Payment Number Generation
      const year = new Date().getFullYear();
      const count = await tx.salesPayment.count();
      const paymentNumber = `PAY-${year}-${(count + 1).toString().padStart(5, '0')}`;

      // 6. Create SalesPayment record inside transaction
      const payment = await tx.salesPayment.create({
        data: {
          salesInvoiceId: dto.salesInvoiceId,
          paymentNumber,
          paymentMethod: dto.paymentMethod,
          amount: paymentAmount,
          status: PaymentStatus.COMPLETED,
          transactionReference: dto.transactionReference || null,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          remarks: dto.remarks || null,
          receivedBy: receivedByUserId || null,
        },
        include: {
          salesInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              grandTotal: true,
            },
          },
        },
      });

      // 7. Recalculate Invoice Settlement Totals & Status
      const newTotalPaid = completedTotal.add(paymentAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      let newOutstanding = netPayable.sub(newTotalPaid).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      if (newOutstanding.lt(0)) {
        newOutstanding = new Prisma.Decimal(0);
      }

      let newPaymentStatus = 'UNPAID';
      if (newOutstanding.equals(0) || newTotalPaid.gte(netPayable)) {
        newPaymentStatus = 'PAID';
        newOutstanding = new Prisma.Decimal(0);
      } else if (newTotalPaid.gt(0)) {
        newPaymentStatus = 'PARTIALLY_PAID';
      }

      await tx.salesInvoice.update({
        where: { id: dto.salesInvoiceId },
        data: {
          totalPaid: newTotalPaid,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
        },
      });

      return {
        ...payment,
        invoiceSettlement: {
          grandTotal: grandTotal.toFixed(2),
          exchangeCredit: exchangeCredit.toFixed(2),
          netPayable: netPayable.toFixed(2),
          totalPaid: newTotalPaid.toFixed(2),
          outstandingAmount: newOutstanding.toFixed(2),
          paymentStatus: newPaymentStatus,
        },
      };
    });
  }

  /**
   * Reverse a COMPLETED sales payment atomically with mandatory audit reason.
   */
  async reversePayment(paymentId: string, dto: ReverseSalesPaymentDTO, reversedByUserId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.salesPayment.findUnique({
        where: { id: paymentId },
        include: { salesInvoice: true },
      });

      if (!payment) {
        throw new NotFoundError(`Sales payment with ID '${paymentId}' not found.`);
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestError(
          `Payment cannot be reversed because its current status is '${payment.status}'. Only COMPLETED payments can be reversed.`
        );
      }

      // Mark payment status REVERSED
      const reversedPayment = await tx.salesPayment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REVERSED,
          reversedAt: new Date(),
          reversedBy: reversedByUserId,
          reversalReason: dto.reversalReason,
        },
      });

      // Recalculate invoice completed payment totals
      const salesInvoiceId = payment.salesInvoiceId;
      const invoice = payment.salesInvoice;
      const grandTotal = new Prisma.Decimal(invoice.grandTotal);
      const exchangeCredit = new Prisma.Decimal(invoice.exchangeCredit || 0);
      const netPayable = grandTotal.sub(exchangeCredit);

      const completedTotal = await salesPaymentRepository.getCompletedPaymentTotal(salesInvoiceId, tx);
      let newOutstanding = netPayable.sub(completedTotal).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

      if (newOutstanding.lt(0)) {
        newOutstanding = new Prisma.Decimal(0);
      }

      let newPaymentStatus = 'UNPAID';
      if (completedTotal.gte(netPayable)) {
        newPaymentStatus = 'PAID';
        newOutstanding = new Prisma.Decimal(0);
      } else if (completedTotal.gt(0)) {
        newPaymentStatus = 'PARTIALLY_PAID';
      }

      await tx.salesInvoice.update({
        where: { id: salesInvoiceId },
        data: {
          totalPaid: completedTotal,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
        },
      });

      return {
        ...reversedPayment,
        invoiceSettlement: {
          grandTotal: grandTotal.toFixed(2),
          exchangeCredit: exchangeCredit.toFixed(2),
          netPayable: netPayable.toFixed(2),
          totalPaid: completedTotal.toFixed(2),
          outstandingAmount: newOutstanding.toFixed(2),
          paymentStatus: newPaymentStatus,
        },
      };
    });
  }

  /**
   * Get single payment details by ID.
   */
  async getPaymentById(id: string) {
    const payment = await salesPaymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError(`Sales payment with ID '${id}' not found.`);
    }
    return payment;
  }

  /**
   * Get all sales payments with search, pagination, and filter options.
   */
  async getAllPayments(query: SalesPaymentQueryDTO) {
    return salesPaymentRepository.findAll(query);
  }

  /**
   * Get payment history for a specific sales invoice.
   */
  async getInvoicePaymentHistory(salesInvoiceId: string, query: SalesPaymentQueryDTO) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: salesInvoiceId },
    });

    if (!invoice) {
      throw new NotFoundError(`Sales invoice with ID '${salesInvoiceId}' not found.`);
    }

    return salesPaymentRepository.findByInvoiceId(salesInvoiceId, query);
  }

  /**
   * Get payment summary for a specific sales invoice.
   */
  async getInvoicePaymentSummary(salesInvoiceId: string) {
    const summary = await salesPaymentRepository.getPaymentSummary(salesInvoiceId);
    if (!summary) {
      throw new NotFoundError(`Sales invoice with ID '${salesInvoiceId}' not found.`);
    }
    return summary;
  }
}

export const salesPaymentService = new SalesPaymentService();
