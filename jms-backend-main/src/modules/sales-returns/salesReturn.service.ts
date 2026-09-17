import { prisma } from '../../database';
import { Prisma, SalesReturnStatus, SalesInvoiceStatus } from '../../generated/prisma';
import { SalesReturnRepository } from '../../repositories/salesReturn.repository';
import { BadRequestError, NotFoundError, ConflictError } from '../../errors';
import {
  CreateSalesReturnDTO,
  ApproveSalesReturnDTO,
  ProcessSalesReturnDTO,
  CancelSalesReturnDTO,
  SalesReturnFilters,
} from './salesReturn.types';

export class SalesReturnService {
  private salesReturnRepo: SalesReturnRepository;

  constructor() {
    this.salesReturnRepo = new SalesReturnRepository();
  }

  private async generateReturnNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.salesReturnRepo.countByYear(year, tx);
    const sequence = String(count + 1).padStart(5, '0');
    return `RET-${year}-${sequence}`;
  }

  async createReturn(dto: CreateSalesReturnDTO, userId?: string) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: dto.salesInvoiceId },
      include: {
        items: true,
        customer: true,
        branch: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError(`Sales Invoice not found with ID: ${dto.salesInvoiceId}`);
    }

    if (invoice.status !== SalesInvoiceStatus.CONFIRMED) {
      throw new BadRequestError(
        `Cannot create sales return for invoice with status '${invoice.status}'. Only CONFIRMED invoices can be returned.`
      );
    }

    // Gold Exchange compatibility check
    if (new Prisma.Decimal(invoice.exchangeCredit).greaterThan(0)) {
      throw new BadRequestError(
        `Cannot process sales return for an invoice with applied customer gold exchange credit (${invoice.exchangeCredit}). Gold exchange reversal is not permitted in Sprint 4.7 to preserve historical valuation integrity.`
      );
    }

    // Check duplicate item submissions in the same request
    const itemIds = dto.items.map((i) => i.inventoryItemId);
    const uniqueItemIds = new Set(itemIds);
    if (itemIds.length !== uniqueItemIds.size) {
      throw new BadRequestError('Duplicate inventory items detected in the return request.');
    }

    let totalSubtotal = new Prisma.Decimal(0);
    let totalTaxAmount = new Prisma.Decimal(0);
    let totalDeductionAmount = new Prisma.Decimal(0);
    let totalRefundAmount = new Prisma.Decimal(0);

    const validatedItems: {
      salesInvoiceItemId: string;
      inventoryItemId: string;
      quantity: number;
      originalAmount: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      deductionAmount: Prisma.Decimal;
      refundAmount: Prisma.Decimal;
      reason?: string;
      remarks?: string;
    }[] = [];

    for (const itemInput of dto.items) {
      const invoiceItem = invoice.items.find((i) => i.id === itemInput.salesInvoiceItemId);
      if (!invoiceItem) {
        throw new BadRequestError(
          `Sales Invoice Item ${itemInput.salesInvoiceItemId} does not belong to Invoice #${invoice.invoiceNumber}`
        );
      }

      if (invoiceItem.inventoryItemId !== itemInput.inventoryItemId) {
        throw new BadRequestError(
          `Inventory Item ${itemInput.inventoryItemId} does not match Invoice Item ${itemInput.salesInvoiceItemId}`
        );
      }

      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: itemInput.inventoryItemId },
      });

      if (!inventoryItem) {
        throw new NotFoundError(`Physical Inventory Item not found: ${itemInput.inventoryItemId}`);
      }

      if (inventoryItem.status !== 'SOLD') {
        throw new BadRequestError(
          `Inventory item ${inventoryItem.itemCode} cannot be returned because its status is '${inventoryItem.status}' (must be 'SOLD').`
        );
      }

      if (inventoryItem.branchId !== invoice.branchId) {
        throw new BadRequestError(
          `Inventory item ${inventoryItem.itemCode} belongs to a different branch than the invoice branch.`
        );
      }

      // Check if this item is already in an active or processed return
      const activeReturn = await this.salesReturnRepo.findActiveReturnForItem(itemInput.inventoryItemId);
      if (activeReturn) {
        throw new ConflictError(
          `Inventory item ${inventoryItem.itemCode} is already part of an active or processed Sales Return #${activeReturn.salesReturn.returnNumber}`
        );
      }

      const quantity = itemInput.quantity || 1;
      if (quantity !== 1) {
        throw new BadRequestError('Physical serialized jewellery items can only be returned with quantity = 1');
      }

      // Financial Calculation using original invoice item snapshot
      const originalAmount = new Prisma.Decimal(invoiceItem.taxableAmount);
      const itemTaxAmount = new Prisma.Decimal(invoiceItem.taxAmount);
      const itemDeduction = new Prisma.Decimal(itemInput.deductionAmount || 0);

      if (itemDeduction.isNegative()) {
        throw new BadRequestError('Deduction amount cannot be negative');
      }

      const itemLineTotal = new Prisma.Decimal(invoiceItem.lineTotal);
      if (itemDeduction.greaterThan(itemLineTotal)) {
        throw new BadRequestError(
          `Deduction amount (${itemDeduction}) cannot exceed original item total (${itemLineTotal})`
        );
      }

      const itemRefundAmount = itemLineTotal.minus(itemDeduction);

      totalSubtotal = totalSubtotal.plus(originalAmount);
      totalTaxAmount = totalTaxAmount.plus(itemTaxAmount);
      totalDeductionAmount = totalDeductionAmount.plus(itemDeduction);
      totalRefundAmount = totalRefundAmount.plus(itemRefundAmount);

      validatedItems.push({
        salesInvoiceItemId: invoiceItem.id,
        inventoryItemId: inventoryItem.id,
        quantity: 1,
        originalAmount,
        taxAmount: itemTaxAmount,
        deductionAmount: itemDeduction,
        refundAmount: itemRefundAmount,
        reason: itemInput.reason || dto.reason,
        remarks: itemInput.remarks,
      });
    }

    return prisma.$transaction(async (tx) => {
      const returnNumber = await this.generateReturnNumber(tx);
      return this.salesReturnRepo.create(
        {
          salesInvoiceId: invoice.id,
          customerId: invoice.customerId,
          branchId: invoice.branchId,
          subtotal: totalSubtotal,
          taxAmount: totalTaxAmount,
          deductionAmount: totalDeductionAmount,
          refundAmount: totalRefundAmount,
          reason: dto.reason,
          remarks: dto.remarks,
          requestedBy: userId,
          items: validatedItems,
        },
        returnNumber,
        tx
      );
    });
  }

  async approveReturn(id: string, dto: ApproveSalesReturnDTO, userId?: string) {
    const existing = await this.salesReturnRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Sales Return not found with ID: ${id}`);
    }

    if (existing.status !== SalesReturnStatus.REQUESTED) {
      throw new BadRequestError(
        `Cannot approve Sales Return with status '${existing.status}'. Only 'REQUESTED' returns can be approved.`
      );
    }

    return this.salesReturnRepo.updateStatus(id, {
      status: SalesReturnStatus.APPROVED,
      approvedBy: userId,
      approvedAt: new Date(),
      remarks: dto.remarks ? `${existing.remarks ? existing.remarks + ' | ' : ''}${dto.remarks}` : existing.remarks || undefined,
    });
  }

  async processReturn(id: string, dto: ProcessSalesReturnDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await this.salesReturnRepo.findById(id, tx);
      if (!existing) {
        throw new NotFoundError(`Sales Return not found with ID: ${id}`);
      }

      if (existing.status !== SalesReturnStatus.APPROVED) {
        throw new BadRequestError(
          `Cannot process Sales Return with status '${existing.status}'. Return must be in 'APPROVED' status before processing.`
        );
      }

      // Atomic inventory reversal with concurrency protection
      for (const item of existing.items) {
        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: item.inventoryItemId,
            status: 'SOLD',
            branchId: existing.branchId,
          },
          data: {
            status: 'AVAILABLE',
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictError(
            `Concurrency conflict: Inventory item ${item.inventoryItemId} is no longer in 'SOLD' status at branch ${existing.branchId}. Cannot process return.`
          );
        }

        // Create immutable SALE_RETURN stock movement audit log
        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            movementType: 'SALE_RETURN',
            referenceType: 'POS_SALES_RETURN',
            referenceId: existing.id,
            fromBranchId: null,
            toBranchId: existing.branchId,
            remarks: `Sales Return processed for Return #${existing.returnNumber}`,
            performedBy: userId,
          },
        });
      }

      return this.salesReturnRepo.updateStatus(
        id,
        {
          status: SalesReturnStatus.PROCESSED,
          processedBy: userId,
          processedAt: new Date(),
          remarks: dto.remarks ? `${existing.remarks ? existing.remarks + ' | ' : ''}${dto.remarks}` : existing.remarks || undefined,
        },
        tx
      );
    });
  }

  async cancelReturn(id: string, dto: CancelSalesReturnDTO, userId?: string) {
    const existing = await this.salesReturnRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Sales Return not found with ID: ${id}`);
    }

    if (existing.status === SalesReturnStatus.PROCESSED) {
      throw new BadRequestError(
        `Cannot cancel Sales Return #${existing.returnNumber} because it has already been PROCESSED and inventory has been restored.`
      );
    }

    if (existing.status === SalesReturnStatus.CANCELLED) {
      throw new BadRequestError(`Sales Return #${existing.returnNumber} is already CANCELLED.`);
    }

    return this.salesReturnRepo.updateStatus(id, {
      status: SalesReturnStatus.CANCELLED,
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancellationReason: dto.cancellationReason,
      remarks: dto.remarks ? `${existing.remarks ? existing.remarks + ' | ' : ''}${dto.remarks}` : existing.remarks || undefined,
    });
  }

  async getReturnById(id: string) {
    const returnRecord = await this.salesReturnRepo.findById(id);
    if (!returnRecord) {
      throw new NotFoundError(`Sales Return not found with ID: ${id}`);
    }
    return returnRecord;
  }

  async getReturns(query: SalesReturnFilters) {
    const filters = {
      ...query,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };
    return this.salesReturnRepo.findAll(filters);
  }

  async getReturnsByInvoiceId(salesInvoiceId: string) {
    const invoice = await prisma.salesInvoice.findUnique({ where: { id: salesInvoiceId } });
    if (!invoice) {
      throw new NotFoundError(`Sales Invoice not found with ID: ${salesInvoiceId}`);
    }
    return this.salesReturnRepo.findByInvoiceId(salesInvoiceId);
  }
}
