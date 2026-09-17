import { prisma } from '../../database';
import { Prisma, PurchaseReturnStatus, DebitNoteStatus } from '../../generated/prisma';
import { purchaseReturnRepository, vendorRepository, branchRepository, purchaseBillRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreatePurchaseReturnDTO,
  UpdatePurchaseReturnDTO,
  PurchaseReturnQueryDTO,
  DebitNoteQueryDTO,
} from './purchaseReturn.types';

export class PurchaseReturnService {
  private async generateReturnNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `PR-${dateStr}-`;

    const count = await client.purchaseReturn.count({
      where: { returnNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let returnNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.purchaseReturn.findUnique({ where: { returnNumber } });
    while (existing) {
      seq++;
      returnNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.purchaseReturn.findUnique({ where: { returnNumber } });
    }

    return returnNumber;
  }

  private async generateDebitNoteNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const year = new Date().getFullYear();
    const prefix = `DN-${year}-`;

    const count = await client.vendorDebitNote.count({
      where: { debitNoteNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let debitNoteNumber = `${prefix}${seq.toString().padStart(5, '0')}`;

    let existing = await client.vendorDebitNote.findUnique({ where: { debitNoteNumber } });
    while (existing) {
      seq++;
      debitNoteNumber = `${prefix}${seq.toString().padStart(5, '0')}`;
      existing = await client.vendorDebitNote.findUnique({ where: { debitNoteNumber } });
    }

    return debitNoteNumber;
  }

  async createPurchaseReturn(dto: CreatePurchaseReturnDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({ where: { id: dto.vendorId } });
      if (!vendor) throw new NotFoundError('Vendor not found');
      if (!vendor.isActive) throw new BadRequestError('Cannot create purchase return for an inactive vendor');

      const branch = await tx.branch.findUnique({ where: { id: dto.branchId } });
      if (!branch) throw new NotFoundError('Branch not found');
      if (!branch.isActive) throw new BadRequestError('Cannot create purchase return for an inactive branch');

      if (dto.purchaseBillId) {
        const bill = await tx.purchaseBill.findUnique({ where: { id: dto.purchaseBillId } });
        if (!bill) throw new NotFoundError('Purchase Bill not found');
        if (bill.vendorId !== dto.vendorId) throw new BadRequestError('Vendor ID does not match Purchase Bill vendor');
        if (bill.branchId !== dto.branchId) throw new BadRequestError('Branch ID does not match Purchase Bill branch');
      }

      let subtotal = new Prisma.Decimal(0);
      let totalTax = new Prisma.Decimal(0);

      const processedItems = dto.items.map((item) => {
        const grossWeight = new Prisma.Decimal(item.grossWeight);
        const stoneWeight = new Prisma.Decimal(item.stoneWeight || 0);
        const netWeight = new Prisma.Decimal(item.netWeight);
        const purchaseRate = new Prisma.Decimal(item.purchaseRate);
        const makingCharges = new Prisma.Decimal(item.makingCharges || 0);
        const taxRate = new Prisma.Decimal(item.taxRate || 0);

        const metalValue = netWeight.mul(purchaseRate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const taxableAmount = metalValue.add(makingCharges).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const taxAmount = taxableAmount.mul(taxRate).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        const lineTotal = taxableAmount.add(taxAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

        subtotal = subtotal.add(taxableAmount);
        totalTax = totalTax.add(taxAmount);

        return {
          purchaseBillItemId: item.purchaseBillItemId || null,
          inventoryItemId: item.inventoryItemId || null,
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity,
          grossWeight,
          stoneWeight,
          netWeight,
          purchaseRate,
          metalValue,
          makingCharges,
          taxRate,
          taxAmount,
          lineTotal,
        };
      });

      const totalReturnAmount = subtotal.add(totalTax).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      const returnNumber = await this.generateReturnNumber(tx);

      const purchaseReturn = await purchaseReturnRepository.create(
        {
          returnNumber,
          purchaseBillId: dto.purchaseBillId || null,
          purchaseOrderId: dto.purchaseOrderId || null,
          vendorId: dto.vendorId,
          branchId: dto.branchId,
          reason: dto.reason || 'DEFECTIVE',
          notes: dto.notes || null,
          subtotal: subtotal.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
          taxAmount: totalTax.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
          totalReturnAmount,
          createdBy: userId || null,
          items: processedItems,
        },
        tx
      );

      return purchaseReturn;
    });
  }

  async getPurchaseReturnById(id: string) {
    const purchaseReturn = await purchaseReturnRepository.findById(id);
    if (!purchaseReturn) throw new NotFoundError('Purchase Return not found');
    return purchaseReturn;
  }

  async getAllPurchaseReturns(options: PurchaseReturnQueryDTO) {
    return purchaseReturnRepository.findAll(options);
  }

  async updatePurchaseReturn(id: string, dto: UpdatePurchaseReturnDTO, userId?: string) {
    const ret = await purchaseReturnRepository.findById(id);
    if (!ret) throw new NotFoundError('Purchase Return not found');
    if (ret.status !== PurchaseReturnStatus.DRAFT) {
      throw new BadRequestError(`Cannot update Purchase Return in ${ret.status} status. Only DRAFT returns can be updated`);
    }

    return purchaseReturnRepository.update(id, { ...dto, updatedBy: userId });
  }

  async submitPurchaseReturn(id: string, userId?: string) {
    const ret = await purchaseReturnRepository.findById(id);
    if (!ret) throw new NotFoundError('Purchase Return not found');
    if (ret.status !== PurchaseReturnStatus.DRAFT) {
      throw new BadRequestError(`Cannot submit Purchase Return in ${ret.status} status. Expected DRAFT`);
    }

    return purchaseReturnRepository.submit(id, userId || 'SYSTEM');
  }

  async approvePurchaseReturn(id: string, userId?: string) {
    const ret = await purchaseReturnRepository.findById(id);
    if (!ret) throw new NotFoundError('Purchase Return not found');
    if (ret.status !== PurchaseReturnStatus.SUBMITTED) {
      throw new BadRequestError(`Cannot approve Purchase Return in ${ret.status} status. Expected SUBMITTED`);
    }

    return purchaseReturnRepository.approve(id, userId || 'SYSTEM');
  }

  async processPurchaseReturn(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const ret = await purchaseReturnRepository.findById(id, tx);
      if (!ret) throw new NotFoundError('Purchase Return not found');
      if (ret.status !== PurchaseReturnStatus.APPROVED) {
        throw new BadRequestError(`Cannot process Purchase Return in ${ret.status} status. Expected APPROVED`);
      }

      // 1. Process Inventory Items & Stock Movements
      for (const item of ret.items) {
        if (item.inventoryItemId) {
          const invItem = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
          if (!invItem) {
            throw new NotFoundError(`Inventory item '${item.inventoryItemId}' not found`);
          }
          if (invItem.status !== 'AVAILABLE') {
            throw new ConflictError(`Inventory item '${invItem.itemCode}' cannot be returned. Current status is ${invItem.status}`);
          }

          // Update inventory status
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { status: 'RETURNED_TO_VENDOR', updatedBy: userId || undefined },
          });

          // Record Stock Movement Audit Log
          await tx.stockMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              fromBranchId: ret.branchId,
              toBranchId: null,
              movementType: 'PURCHASE_RETURN',
              referenceType: 'PURCHASE_RETURN',
              referenceId: ret.id,
              remarks: `Returned to vendor '${ret.vendor.companyName}' under return '${ret.returnNumber}'`,
              performedBy: userId || null,
            },
          });
        }
      }

      // 2. Generate Vendor Debit Note
      const debitNoteNumber = await this.generateDebitNoteNumber(tx);
      const debitNote = await purchaseReturnRepository.createDebitNote(
        {
          debitNoteNumber,
          purchaseReturnId: ret.id,
          vendorId: ret.vendorId,
          branchId: ret.branchId,
          purchaseBillId: ret.purchaseBillId || null,
          amount: ret.totalReturnAmount,
          status: DebitNoteStatus.ISSUED,
          remarks: `Debit Note issued for Purchase Return '${ret.returnNumber}'`,
          createdBy: userId || null,
        },
        tx
      );

      // 3. Financial Adjustment on Purchase Bill (if linked)
      if (ret.purchaseBillId) {
        const bill = await tx.purchaseBill.findUnique({ where: { id: ret.purchaseBillId } });
        if (bill) {
          const currentOutstanding = new Prisma.Decimal(bill.outstandingAmount);
          const debitAmount = new Prisma.Decimal(ret.totalReturnAmount);
          let newOutstanding = currentOutstanding.sub(debitAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
          if (newOutstanding.lt(0)) newOutstanding = new Prisma.Decimal(0);

          await tx.purchaseBill.update({
            where: { id: ret.purchaseBillId },
            data: {
              outstandingAmount: newOutstanding,
              updatedBy: userId || undefined,
            },
          });
        }
      }

      // 4. Mark Return as PROCESSED
      const processedReturn = await purchaseReturnRepository.process(id, userId || 'SYSTEM', tx);
      return {
        purchaseReturn: processedReturn,
        debitNote,
      };
    });
  }

  async cancelPurchaseReturn(id: string, cancellationReason: string, userId?: string) {
    const ret = await purchaseReturnRepository.findById(id);
    if (!ret) throw new NotFoundError('Purchase Return not found');
    if (ret.status === PurchaseReturnStatus.APPROVED || ret.status === PurchaseReturnStatus.PROCESSED) {
      throw new BadRequestError(`Cannot cancel Purchase Return in ${ret.status} status. Only DRAFT or SUBMITTED returns can be cancelled`);
    }

    if (!cancellationReason || cancellationReason.trim().length < 3) {
      throw new BadRequestError('Mandatory cancellation reason must be provided (at least 3 characters)');
    }

    return purchaseReturnRepository.cancel(id, userId || 'SYSTEM', cancellationReason.trim());
  }

  // --- DEBIT NOTE SERVICE METHODS ---

  async getAllDebitNotes(options: DebitNoteQueryDTO) {
    return purchaseReturnRepository.findAllDebitNotes(options);
  }

  async getDebitNoteById(id: string) {
    const debitNote = await purchaseReturnRepository.findDebitNoteById(id);
    if (!debitNote) throw new NotFoundError('Vendor Debit Note not found');
    return debitNote;
  }

  async getDebitNotesByVendor(vendorId: string) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundError('Vendor not found');
    return purchaseReturnRepository.findDebitNotesByVendorId(vendorId);
  }
}

export const purchaseReturnService = new PurchaseReturnService();
