import { prisma } from '../../database';
import { Prisma, PurchaseBillStatus } from '../../generated/prisma';
import { purchaseBillRepository, purchaseRepository, vendorRepository, branchRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreatePurchaseBillInput,
  UpdatePurchaseBillInput,
  PurchaseBillQueryOptions,
} from './purchaseBill.types';

export class PurchaseBillService {
  /**
   * Generates a concurrency-safe sequential Bill number: PB-YYYYMMDD-XXXX
   */
  private async generateBillNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `PB-${yyyy}${mm}${dd}-`;

    const latest = await client.purchaseBill.findFirst({
      where: { billNumber: { startsWith: prefix } },
      orderBy: { billNumber: 'desc' },
    });

    let seq = 1;
    if (latest && latest.billNumber) {
      const parts = latest.billNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  /**
   * Authoritative calculation of Purchase Bill line items and totals using Prisma.Decimal
   */
  private calculateBillTotals(items: Array<any>, headerDiscount: number = 0) {
    let subtotalDec = new Prisma.Decimal(0);
    let taxAmountDec = new Prisma.Decimal(0);
    const headerDiscountDec = new Prisma.Decimal(headerDiscount || 0);

    const calculatedItems = items.map((item) => {
      const qty = item.quantity ? Number(item.quantity) : 1;
      const grossWeightDec = new Prisma.Decimal(item.grossWeight || 0);
      const netWeightDec = new Prisma.Decimal(item.netWeight || 0);
      const stoneWeightDec = new Prisma.Decimal(item.stoneWeight || 0);
      const purchaseRateDec = new Prisma.Decimal(item.purchaseRate || 0);
      const makingChargesDec = new Prisma.Decimal(item.makingCharges || 0);
      const itemDiscountDec = new Prisma.Decimal(item.discountAmount || 0);
      const taxRateDec = new Prisma.Decimal(item.taxRate || 0);

      // Metal Value = Net Weight * Purchase Rate
      const metalValueDec = netWeightDec.mul(purchaseRateDec);
      // Taxable Amount = Metal Value + Making Charges - Discount
      const baseLineDec = metalValueDec.add(makingChargesDec).sub(itemDiscountDec);
      const taxableAmountDec = baseLineDec.greaterThan(0) ? baseLineDec : new Prisma.Decimal(0);

      // Tax Amount = Taxable Amount * (Tax Rate / 100)
      const lineTaxDec = taxableAmountDec.mul(taxRateDec).div(100);
      // Line Total = Taxable Amount + Tax Amount
      const lineTotalDec = taxableAmountDec.add(lineTaxDec);

      subtotalDec = subtotalDec.add(taxableAmountDec);
      taxAmountDec = taxAmountDec.add(lineTaxDec);

      return {
        purchaseOrderItemId: item.purchaseOrderItemId || null,
        purchaseReceiptItemId: item.purchaseReceiptItemId || null,
        inventoryItemId: item.inventoryItemId || null,
        itemName: item.itemName,
        description: item.description || null,
        quantity: qty,
        grossWeight: grossWeightDec.toDecimalPlaces(3),
        stoneWeight: stoneWeightDec.toDecimalPlaces(3),
        netWeight: netWeightDec.toDecimalPlaces(3),
        purchaseRate: purchaseRateDec.toDecimalPlaces(2),
        metalValue: metalValueDec.toDecimalPlaces(2),
        makingCharges: makingChargesDec.toDecimalPlaces(2),
        discountAmount: itemDiscountDec.toDecimalPlaces(2),
        taxableAmount: taxableAmountDec.toDecimalPlaces(2),
        taxRate: taxRateDec.toDecimalPlaces(2),
        taxAmount: lineTaxDec.toDecimalPlaces(2),
        lineTotal: lineTotalDec.toDecimalPlaces(2),
      };
    });

    const subtotalFinal = subtotalDec.toDecimalPlaces(2);
    const taxAmountFinal = taxAmountDec.toDecimalPlaces(2);
    let grandTotalDec = subtotalFinal.add(taxAmountFinal).sub(headerDiscountDec);
    if (grandTotalDec.lessThan(0)) {
      grandTotalDec = new Prisma.Decimal(0);
    }
    const grandTotalFinal = grandTotalDec.toDecimalPlaces(2);

    return {
      items: calculatedItems,
      subtotal: subtotalFinal,
      discountAmount: headerDiscountDec.toDecimalPlaces(2),
      taxAmount: taxAmountFinal,
      grandTotal: grandTotalFinal,
      outstandingAmount: grandTotalFinal,
    };
  }

  /**
   * Validate billable quantity limits and inventory item uniqueness inside transaction
   */
  private async validateBillableItems(
    purchaseOrderId: string,
    items: Array<any>,
    excludeBillId?: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    // Fetch PO with items
    const po = await client.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: true,
      },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    // Fetch all existing non-cancelled bills for this PO
    const existingBills = await client.purchaseBill.findMany({
      where: {
        purchaseOrderId,
        status: { not: PurchaseBillStatus.CANCELLED },
        ...(excludeBillId ? { id: { not: excludeBillId } } : {}),
      },
      include: {
        items: true,
      },
    });

    // Calculate previously billed quantities per PO item
    const billedQtyMap = new Map<string, number>();
    for (const b of existingBills) {
      for (const bItem of b.items) {
        if (bItem.purchaseOrderItemId) {
          const prev = billedQtyMap.get(bItem.purchaseOrderItemId) || 0;
          billedQtyMap.set(bItem.purchaseOrderItemId, prev + bItem.quantity);
        }
      }
    }

    // Map of requested quantities per PO item in current payload
    const currentPayloadQtyMap = new Map<string, number>();

    for (const item of items) {
      if (item.purchaseOrderItemId) {
        const poItem = po.items.find((i) => i.id === item.purchaseOrderItemId);
        if (!poItem) {
          throw new BadRequestError(`Purchase Order Item ${item.purchaseOrderItemId} does not belong to Purchase Order ${po.purchaseOrderNumber}`);
        }

        const prevBilled = billedQtyMap.get(poItem.id) || 0;
        const currentPayload = currentPayloadQtyMap.get(poItem.id) || 0;
        const totalRequested = currentPayload + (item.quantity || 1);
        const remainingBillable = Math.max(0, poItem.receivedQuantity - prevBilled);

        if (totalRequested > remainingBillable) {
          throw new ConflictError(
            `Requested billing quantity (${totalRequested}) exceeds remaining billable received quantity (${remainingBillable}) for item '${poItem.itemName}'`
          );
        }

        currentPayloadQtyMap.set(poItem.id, totalRequested);
      }

      // Check inventory item uniqueness if referenced
      if (item.inventoryItemId) {
        const invItem = await client.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
        });

        if (!invItem) {
          throw new NotFoundError(`Inventory item ${item.inventoryItemId} not found`);
        }

        const existingItemBill = await client.purchaseBillItem.findFirst({
          where: {
            inventoryItemId: item.inventoryItemId,
            purchaseBill: {
              status: { not: PurchaseBillStatus.CANCELLED },
              ...(excludeBillId ? { id: { not: excludeBillId } } : {}),
            },
          },
        });

        if (existingItemBill) {
          throw new ConflictError(
            `Inventory item '${invItem.itemCode}' is already referenced in an active purchase bill`
          );
        }
      }
    }
  }

  /**
   * Create a new draft Purchase Bill
   */
  async createPurchaseBill(dto: CreatePurchaseBillInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify PO exists
      const po = await tx.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
      });

      if (!po) {
        throw new NotFoundError('Purchase Order not found');
      }

      if (po.status === 'DRAFT') {
        throw new BadRequestError('Cannot create a purchase bill for a DRAFT purchase order. Order must be submitted/approved/received first');
      }

      if (po.status === 'CANCELLED') {
        throw new BadRequestError('Cannot create a purchase bill for a CANCELLED purchase order');
      }

      // 2. Validate Vendor matching
      if (po.vendorId !== dto.vendorId) {
        throw new BadRequestError('Vendor ID does not match the vendor on the Purchase Order');
      }

      const vendor = await tx.vendor.findUnique({ where: { id: dto.vendorId } });
      if (!vendor) {
        throw new NotFoundError('Vendor not found');
      }
      if (!vendor.isActive) {
        throw new BadRequestError('Cannot create purchase bill for an inactive vendor');
      }

      // 3. Validate Branch matching
      if (po.branchId !== dto.branchId) {
        throw new BadRequestError('Branch ID does not match the branch on the Purchase Order');
      }

      const branch = await tx.branch.findUnique({ where: { id: dto.branchId } });
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }
      if (!branch.isActive) {
        throw new BadRequestError('Cannot create purchase bill for an inactive branch');
      }

      // 4. Validate billable quantities & inventory item uniqueness
      await this.validateBillableItems(dto.purchaseOrderId, dto.items, undefined, tx);

      // 5. Calculate totals
      const totals = this.calculateBillTotals(dto.items, dto.discountAmount);

      // 6. Generate Bill Number
      const billNumber = await this.generateBillNumber(tx);

      // 7. Create Purchase Bill
      const bill = await purchaseBillRepository.create(
        {
          billNumber,
          purchaseOrderId: dto.purchaseOrderId,
          vendorId: dto.vendorId,
          branchId: dto.branchId,
          status: PurchaseBillStatus.DRAFT,
          billDate: dto.billDate ? new Date(dto.billDate) : new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          grandTotal: totals.grandTotal,
          totalPaid: new Prisma.Decimal(0),
          outstandingAmount: totals.outstandingAmount,
          notes: dto.notes || null,
          createdBy: userId || undefined,
          items: totals.items,
        },
        tx
      );

      return bill;
    });
  }

  /**
   * List Purchase Bills with filters & pagination
   */
  async listPurchaseBills(options: PurchaseBillQueryOptions) {
    return purchaseBillRepository.findAll(options);
  }

  /**
   * Get single Purchase Bill by ID
   */
  async getPurchaseBillById(id: string) {
    const bill = await purchaseBillRepository.findById(id);
    if (!bill) {
      throw new NotFoundError('Purchase Bill not found');
    }
    return bill;
  }

  /**
   * Update DRAFT Purchase Bill
   */
  async updatePurchaseBill(id: string, dto: UpdatePurchaseBillInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await purchaseBillRepository.findById(id, tx);
      if (!existing) {
        throw new NotFoundError('Purchase Bill not found');
      }

      if (existing.status !== PurchaseBillStatus.DRAFT) {
        throw new BadRequestError(`Cannot update Purchase Bill in ${existing.status} status. Only DRAFT bills can be updated`);
      }

      const itemsToValidate = dto.items || existing.items.map((i) => ({
        purchaseOrderItemId: i.purchaseOrderItemId,
        purchaseReceiptItemId: i.purchaseReceiptItemId,
        inventoryItemId: i.inventoryItemId,
        itemName: i.itemName,
        description: i.description,
        quantity: i.quantity,
        grossWeight: Number(i.grossWeight),
        stoneWeight: Number(i.stoneWeight),
        netWeight: Number(i.netWeight),
        purchaseRate: Number(i.purchaseRate),
        makingCharges: Number(i.makingCharges),
        discountAmount: Number(i.discountAmount),
        taxRate: Number(i.taxRate),
      }));

      await this.validateBillableItems(existing.purchaseOrderId, itemsToValidate, id, tx);

      const headerDiscount = dto.discountAmount !== undefined ? dto.discountAmount : Number(existing.discountAmount);
      const totals = this.calculateBillTotals(itemsToValidate, headerDiscount);

      const updated = await purchaseBillRepository.updateDraft(
        id,
        {
          dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : existing.dueDate,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          grandTotal: totals.grandTotal,
          outstandingAmount: totals.outstandingAmount,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          updatedBy: userId || undefined,
          items: dto.items ? totals.items : undefined,
        },
        tx
      );

      return updated;
    });
  }

  /**
   * Submit DRAFT Purchase Bill (DRAFT -> SUBMITTED)
   */
  async submitPurchaseBill(id: string, userId?: string) {
    const existing = await purchaseBillRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase Bill not found');
    }

    if (existing.status !== PurchaseBillStatus.DRAFT) {
      throw new BadRequestError(`Cannot submit Purchase Bill in ${existing.status} status. Only DRAFT bills can be submitted`);
    }

    return purchaseBillRepository.submit(id, userId);
  }

  /**
   * Approve SUBMITTED Purchase Bill (SUBMITTED -> APPROVED)
   */
  async approvePurchaseBill(id: string, userId?: string) {
    const existing = await purchaseBillRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase Bill not found');
    }

    if (existing.status !== PurchaseBillStatus.SUBMITTED) {
      throw new BadRequestError(`Cannot approve Purchase Bill in ${existing.status} status. Only SUBMITTED bills can be approved`);
    }

    return purchaseBillRepository.approve(id, userId);
  }

  /**
   * Cancel Purchase Bill (DRAFT/SUBMITTED -> CANCELLED)
   */
  async cancelPurchaseBill(id: string, cancellationReason: string, userId?: string) {
    const existing = await purchaseBillRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase Bill not found');
    }

    if (existing.status === PurchaseBillStatus.APPROVED || existing.status === PurchaseBillStatus.PAID || existing.status === PurchaseBillStatus.PARTIALLY_PAID) {
      throw new BadRequestError(`Cannot cancel an ${existing.status} purchase bill. Approved/Paid bills are immutable`);
    }

    if (existing.status === PurchaseBillStatus.CANCELLED) {
      throw new BadRequestError('Purchase Bill is already cancelled');
    }

    return purchaseBillRepository.cancel(id, cancellationReason, userId);
  }

  /**
   * Get purchase bills associated with a purchase order
   */
  async getPurchaseBillsByPO(purchaseOrderId: string) {
    const po = await purchaseRepository.findById(purchaseOrderId);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }
    return purchaseBillRepository.findByPurchaseOrderId(purchaseOrderId);
  }

  /**
   * Get purchase bills for a vendor
   */
  async getPurchaseBillsByVendor(vendorId: string) {
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return purchaseBillRepository.findByVendorId(vendorId);
  }

  /**
   * Get bill summary
   */
  async getPurchaseBillSummary(id: string) {
    const summary = await purchaseBillRepository.getSummary(id);
    if (!summary) {
      throw new NotFoundError('Purchase Bill not found');
    }
    return summary;
  }
}

export const purchaseBillService = new PurchaseBillService();
