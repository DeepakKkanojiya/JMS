import { prisma } from '../../database';
import { Prisma, PurchaseOrderStatus } from '../../generated/prisma';
import { purchaseRepository, vendorRepository, branchRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  PurchaseOrderQueryOptions,
  ReceivePurchaseInput,
  PurchaseReceiptQueryOptions,
} from './purchase.types';

export class PurchaseService {
  /**
   * Generates a concurrency-safe sequential PO number: PO-YYYYMMDD-XXXX
   */
  private async generatePurchaseOrderNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `PO-${yyyy}${mm}${dd}-`;

    const latest = await client.purchaseOrder.findFirst({
      where: { purchaseOrderNumber: { startsWith: prefix } },
      orderBy: { purchaseOrderNumber: 'desc' },
    });

    let seq = 1;
    if (latest && latest.purchaseOrderNumber) {
      const parts = latest.purchaseOrderNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  /**
   * Server-side authoritative calculation of line items and totals using Decimal precision
   */
  private calculateLineItems(items: Array<any>) {
    let subtotalDec = new Prisma.Decimal(0);
    let taxAmountDec = new Prisma.Decimal(0);

    const calculatedItems = items.map((item) => {
      const qty = item.orderedQuantity ? Number(item.orderedQuantity) : 1;
      const grossWeightDec = new Prisma.Decimal(item.grossWeight);
      const netWeightDec = new Prisma.Decimal(item.netWeight);
      const stoneWeightDec = new Prisma.Decimal(item.stoneWeight || 0);
      const expectedRateDec = new Prisma.Decimal(item.expectedRate);
      const makingChargesDec = new Prisma.Decimal(item.makingCharges || 0);
      const taxRateDec = new Prisma.Decimal(item.taxRate || 0);

      // Value of metal = netWeight * expectedRate
      const metalCostDec = netWeightDec.mul(expectedRateDec);
      // Base line total before tax = metalCost + makingCharges
      const lineBaseDec = metalCostDec.add(makingChargesDec);
      // Tax amount = lineBase * (taxRate / 100)
      const lineTaxDec = lineBaseDec.mul(taxRateDec).div(100);
      // Item total = lineBase + lineTax
      const itemTotalDec = lineBaseDec.add(lineTaxDec);

      subtotalDec = subtotalDec.add(lineBaseDec);
      taxAmountDec = taxAmountDec.add(lineTaxDec);

      return {
        productId: item.productId || null,
        metalType: item.metalType,
        purity: item.purity,
        itemName: item.itemName,
        description: item.description || null,
        orderedQuantity: qty,
        grossWeight: grossWeightDec,
        netWeight: netWeightDec,
        stoneWeight: stoneWeightDec,
        expectedRate: expectedRateDec,
        makingCharges: makingChargesDec,
        taxRate: taxRateDec,
        taxAmount: lineTaxDec.toDecimalPlaces(2),
        itemTotal: itemTotalDec.toDecimalPlaces(2),
      };
    });

    const grandTotalDec = subtotalDec.add(taxAmountDec);

    return {
      items: calculatedItems,
      subtotal: subtotalDec.toDecimalPlaces(2),
      taxAmount: taxAmountDec.toDecimalPlaces(2),
      grandTotal: grandTotalDec.toDecimalPlaces(2),
    };
  }

  /**
   * Create a new draft purchase order
   */
  async createPurchaseOrder(dto: CreatePurchaseOrderInput, userId?: string) {
    // 1. Validate Branch exists & is active
    const branch = await branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundError('Branch showroom not found');
    }
    if (!branch.isActive) {
      throw new BadRequestError('Cannot create purchase order for an inactive branch');
    }

    // 2. Validate Vendor exists & is active
    const vendor = await vendorRepository.findById(dto.vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor supplier not found');
    }
    if (!vendor.isActive) {
      throw new BadRequestError('Cannot create purchase order for an inactive vendor');
    }

    // 3. Calculate authoritative server-side totals
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError('At least one line item is required to create a purchase order');
    }
    const { items, subtotal, taxAmount, grandTotal } = this.calculateLineItems(dto.items);

    // 4. Create in atomic transaction with generated PO Number
    return prisma.$transaction(async (tx) => {
      const poNumber = await this.generatePurchaseOrderNumber(tx);

      return purchaseRepository.create(
        {
          purchaseOrderNumber: poNumber,
          vendorId: dto.vendorId,
          branchId: dto.branchId,
          status: PurchaseOrderStatus.DRAFT,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
          subtotal,
          taxAmount,
          grandTotal,
          notes: dto.notes || null,
          termsConditions: dto.termsConditions || null,
          createdBy: userId,
          items,
        },
        tx
      );
    });
  }

  /**
   * Update draft purchase order
   */
  async updatePurchaseOrder(id: string, dto: UpdatePurchaseOrderInput, userId?: string) {
    const existing = await purchaseRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase order not found');
    }

    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestError(`Purchase order in ${existing.status} status cannot be edited`);
    }

    if (dto.branchId) {
      const branch = await branchRepository.findById(dto.branchId);
      if (!branch || !branch.isActive) {
        throw new NotFoundError('Valid active branch not found');
      }
    }

    if (dto.vendorId) {
      const vendor = await vendorRepository.findById(dto.vendorId);
      if (!vendor || !vendor.isActive) {
        throw new NotFoundError('Valid active vendor not found');
      }
    }

    return prisma.$transaction(async (tx) => {
      let subtotal = existing.subtotal;
      let taxAmount = existing.taxAmount;
      let grandTotal = existing.grandTotal;

      if (dto.items && dto.items.length > 0) {
        const calculated = this.calculateLineItems(dto.items);
        subtotal = calculated.subtotal;
        taxAmount = calculated.taxAmount;
        grandTotal = calculated.grandTotal;

        await purchaseRepository.replaceItems(id, calculated.items, tx);
      }

      return purchaseRepository.update(
        id,
        {
          vendorId: dto.vendorId,
          branchId: dto.branchId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          expectedDeliveryDate: dto.expectedDeliveryDate !== undefined
            ? (dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null)
            : undefined,
          subtotal,
          taxAmount,
          grandTotal,
          notes: dto.notes !== undefined ? dto.notes : undefined,
          termsConditions: dto.termsConditions !== undefined ? dto.termsConditions : undefined,
          updatedBy: userId,
        },
        tx
      );
    });
  }

  /**
   * Retrieve single purchase order by ID
   */
  async getPurchaseOrderById(id: string, userCompanyId?: string) {
    const po = await purchaseRepository.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    if (userCompanyId && po.branch.companyId !== userCompanyId) {
      throw new ForbiddenError('Access denied: Purchase order belongs to a different enterprise company');
    }

    return po;
  }

  /**
   * List purchase orders with filtering & pagination
   */
  async listPurchaseOrders(options: PurchaseOrderQueryOptions, userCompanyId?: string) {
    if (userCompanyId) {
      options.companyId = userCompanyId;
    }
    return purchaseRepository.findAll(options);
  }

  /**
   * Submit purchase order for managerial approval (DRAFT -> SUBMITTED)
   */
  async submitPurchaseOrder(id: string, userId?: string) {
    const existing = await purchaseRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase order not found');
    }

    if (existing.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestError(`Cannot submit purchase order: Current status is ${existing.status}`);
    }

    if (!existing.items || existing.items.length === 0) {
      throw new BadRequestError('Purchase order must have at least one line item to submit');
    }

    return purchaseRepository.updateStatus(id, {
      status: PurchaseOrderStatus.SUBMITTED,
      submittedBy: userId,
      submittedAt: new Date(),
      updatedBy: userId,
    });
  }

  /**
   * Approve submitted purchase order (SUBMITTED -> APPROVED)
   */
  async approvePurchaseOrder(id: string, userId?: string) {
    const existing = await purchaseRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase order not found');
    }

    if (existing.status !== PurchaseOrderStatus.SUBMITTED) {
      throw new BadRequestError(`Cannot approve purchase order: Only SUBMITTED orders can be approved (current: ${existing.status})`);
    }

    return purchaseRepository.updateStatus(id, {
      status: PurchaseOrderStatus.APPROVED,
      approvedBy: userId,
      approvedAt: new Date(),
      updatedBy: userId,
    });
  }

  /**
   * Cancel purchase order (DRAFT / SUBMITTED / APPROVED -> CANCELLED)
   */
  async cancelPurchaseOrder(id: string, cancellationReason: string, userId?: string) {
    if (!cancellationReason || !cancellationReason.trim()) {
      throw new BadRequestError('Cancellation reason is required to cancel a purchase order');
    }

    const existing = await purchaseRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Purchase order not found');
    }

    if (existing.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestError('Purchase order is already cancelled');
    }

    if (
      existing.status === PurchaseOrderStatus.RECEIVING ||
      existing.status === PurchaseOrderStatus.COMPLETED
    ) {
      throw new BadRequestError(`Cannot cancel purchase order with status ${existing.status}`);
    }

    return purchaseRepository.updateStatus(id, {
      status: PurchaseOrderStatus.CANCELLED,
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancellationReason: cancellationReason.trim(),
      updatedBy: userId,
    });
  }

  /**
   * Collision-safe sequential PR number: PR-YYYYMMDD-XXXX
   */
  private async generatePurchaseReceiptNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `PR-${yyyy}${mm}${dd}-`;

    const latest = await client.purchaseReceipt.findFirst({
      where: { purchaseReceiptNumber: { startsWith: prefix } },
      orderBy: { purchaseReceiptNumber: 'desc' },
    });

    let seq = 1;
    if (latest && latest.purchaseReceiptNumber) {
      const parts = latest.purchaseReceiptNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }

  /**
   * Helper to calculate fine weight based on purity string
   */
  private calculateFineWeight(netWeight: Prisma.Decimal | number, purity: string): Prisma.Decimal {
    let purityVal = 0.916;
    const purityStr = String(purity).toUpperCase();
    if (purityStr.includes('24') || purityStr.includes('999')) {
      purityVal = 0.999;
    } else if (purityStr.includes('22') || purityStr.includes('916')) {
      purityVal = 0.916;
    } else if (purityStr.includes('18') || purityStr.includes('750')) {
      purityVal = 0.750;
    } else if (purityStr.includes('14') || purityStr.includes('585')) {
      purityVal = 0.585;
    }
    return new Prisma.Decimal(netWeight).mul(purityVal).toDecimalPlaces(3);
  }

  /**
   * Collision-safe sequential itemCode: INV-[SUBCATEGORY_CODE]-[SEQUENCE]
   */
  private async generateUniqueItemCode(productId: string | null, tx: Prisma.TransactionClient): Promise<string> {
    let subCatCode = 'GEN';
    if (productId) {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { subCategory: true }
      });
      if (product?.subCategory?.code) {
        subCatCode = product.subCategory.code;
      }
    }
    const prefix = `INV-${subCatCode.toUpperCase()}-`;

    const latest = await tx.inventoryItem.findFirst({
      where: { itemCode: { startsWith: prefix } },
      orderBy: { itemCode: 'desc' }
    });

    let seq = 1;
    if (latest && latest.itemCode) {
      const parts = latest.itemCode.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }

  /**
   * Collision-safe barcode generator for inventory tags
   */
  private async generateUniqueBarcode(itemCode: string, tx: Prisma.TransactionClient): Promise<string> {
    let candidate = `BC-${itemCode}`;
    let existing = await tx.inventoryTag.findUnique({
      where: { barcode: candidate }
    });
    let counter = 1;
    while (existing) {
      candidate = `BC-${itemCode}-${counter}`;
      existing = await tx.inventoryTag.findUnique({
        where: { barcode: candidate }
      });
      counter++;
    }
    return candidate;
  }

  /**
   * Receive inventory items against an APPROVED or RECEIVING PO
   */
  async receivePurchaseOrder(id: string, dto: ReceivePurchaseInput, userId?: string) {
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { branch: true }
    });

    if (!existingPO) {
      throw new NotFoundError('Purchase order not found');
    }

    if (
      existingPO.status !== PurchaseOrderStatus.APPROVED &&
      existingPO.status !== PurchaseOrderStatus.RECEIVING
    ) {
      throw new BadRequestError(`Cannot receive items: Only APPROVED or RECEIVING purchase orders can receive stock (current: ${existingPO.status})`);
    }

    return prisma.$transaction(async (tx) => {
      // Concurrency protection: re-check status and item quantities
      const po = await tx.purchaseOrder.findUnique({
        where: { id },
        include: {
          items: true,
          branch: true,
        },
      });

      if (!po) {
        throw new NotFoundError('Purchase order not found inside transaction');
      }

      if (
        po.status !== PurchaseOrderStatus.APPROVED &&
        po.status !== PurchaseOrderStatus.RECEIVING
      ) {
        throw new BadRequestError(`Purchase order status changed to ${po.status}`);
      }

      const receiptItemsData = [];
      let subtotalDec = new Prisma.Decimal(0);
      let taxAmountDec = new Prisma.Decimal(0);

      // Loop over incoming items
      for (const itemInput of dto.items) {
        const poItem = po.items.find((i) => i.id === itemInput.purchaseOrderItemId);
        if (!poItem) {
          throw new BadRequestError(`Purchase order item with ID ${itemInput.purchaseOrderItemId} not found on this PO`);
        }

        // Remaining ordered qty = orderedQuantity - receivedQuantity
        const remainingQty = poItem.orderedQuantity - poItem.receivedQuantity;
        if (itemInput.receivedQuantity > remainingQty) {
          throw new BadRequestError(
            `Cannot receive ${itemInput.receivedQuantity} units for item '${poItem.itemName}': remaining quantity is ${remainingQty}`
          );
        }

        const qty = itemInput.receivedQuantity;
        const grossWeightDec = new Prisma.Decimal(itemInput.grossWeight);
        const netWeightDec = new Prisma.Decimal(itemInput.netWeight);
        const stoneWeightDec = new Prisma.Decimal(itemInput.stoneWeight || 0);
        const purchaseRateDec = new Prisma.Decimal(itemInput.purchaseRate);
        const makingChargesDec = new Prisma.Decimal(itemInput.makingCharges || 0);
        const taxRateDec = new Prisma.Decimal(itemInput.taxRate || 0);

        // Base line total before tax = (netWeight * purchaseRate) + makingCharges
        const lineBaseDec = netWeightDec.mul(purchaseRateDec).add(makingChargesDec);
        const lineTaxDec = lineBaseDec.mul(taxRateDec).div(100);
        const itemTotalDec = lineBaseDec.add(lineTaxDec);

        subtotalDec = subtotalDec.add(lineBaseDec);
        taxAmountDec = taxAmountDec.add(lineTaxDec);

        const fineWeightDec = this.calculateFineWeight(itemInput.netWeight, poItem.purity);

        receiptItemsData.push({
          poItem,
          productId: poItem.productId || null,
          receivedQuantity: qty,
          grossWeight: grossWeightDec,
          netWeight: netWeightDec,
          stoneWeight: stoneWeightDec,
          fineWeight: fineWeightDec,
          purchaseRate: purchaseRateDec,
          makingCharges: makingChargesDec,
          taxRate: taxRateDec,
          taxAmount: lineTaxDec.toDecimalPlaces(2),
          itemTotal: itemTotalDec.toDecimalPlaces(2),
        });
      }

      const grandTotalDec = subtotalDec.add(taxAmountDec);
      const receiptNumber = await this.generatePurchaseReceiptNumber(tx);

      // Create PurchaseReceipt
      const receipt = await tx.purchaseReceipt.create({
        data: {
          purchaseReceiptNumber: receiptNumber,
          purchaseOrderId: po.id,
          status: 'RECEIVED',
          receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : new Date(),
          subtotal: subtotalDec.toDecimalPlaces(2),
          taxAmount: taxAmountDec.toDecimalPlaces(2),
          grandTotal: grandTotalDec.toDecimalPlaces(2),
          remarks: dto.remarks || null,
        },
      });

      // Process items
      for (const rItem of receiptItemsData) {
        if (!rItem.productId) {
          throw new BadRequestError(`Cannot receive item '${rItem.poItem.itemName}' because it is not associated with a Product ID`);
        }

        // Create PurchaseReceiptItem
        const receiptItem = await tx.purchaseReceiptItem.create({
          data: {
            purchaseReceiptId: receipt.id,
            productId: rItem.productId,
            receivedQuantity: rItem.receivedQuantity,
            grossWeight: rItem.grossWeight,
            netWeight: rItem.netWeight,
            stoneWeight: rItem.stoneWeight,
            fineWeight: rItem.fineWeight,
            purchaseRate: rItem.purchaseRate,
            makingCharges: rItem.makingCharges,
            taxRate: rItem.taxRate,
            taxAmount: rItem.taxAmount,
            itemTotal: rItem.itemTotal,
          },
        });

        // Update PurchaseOrderItem received quantity
        await tx.purchaseOrderItem.update({
          where: { id: rItem.poItem.id },
          data: {
            receivedQuantity: {
              increment: rItem.receivedQuantity,
            },
          },
        });

        // Create individual InventoryItems & StockMovements for each unit received
        for (let q = 0; q < rItem.receivedQuantity; q++) {
          const itemCode = await this.generateUniqueItemCode(rItem.productId, tx);
          const barcode = await this.generateUniqueBarcode(itemCode, tx);

          const invItem = await tx.inventoryItem.create({
            data: {
              companyId: po.branch.companyId,
              productId: rItem.productId,
              branchId: po.branchId,
              purchaseReceiptItemId: receiptItem.id,
              itemCode,
              grossWeight: rItem.grossWeight,
              netWeight: rItem.netWeight,
              stoneWeight: rItem.stoneWeight,
              fineWeight: rItem.fineWeight,
              purity: rItem.poItem.purity,
              status: 'AVAILABLE',
              createdBy: userId || null,
              tags: {
                create: {
                  barcode,
                  isActive: true,
                },
              },
            },
          });

          // Create StockMovement
          await tx.stockMovement.create({
            data: {
              inventoryItemId: invItem.id,
              toBranchId: po.branchId,
              movementType: 'STOCK_IN',
              referenceType: 'PURCHASE_ORDER',
              referenceId: po.id,
              remarks: `Received against Purchase Order ${po.purchaseOrderNumber}`,
              performedBy: userId || null,
            },
          });
        }
      }

      // Recalculate PurchaseOrder Status
      const updatedItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
      });

      const totalOrdered = updatedItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
      const totalReceived = updatedItems.reduce((sum, item) => sum + item.receivedQuantity, 0);

      const newStatus = totalReceived >= totalOrdered ? PurchaseOrderStatus.COMPLETED : PurchaseOrderStatus.RECEIVING;

      const updatedPO = await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: newStatus,
          updatedBy: userId,
        },
      });

      return {
        receipt,
        purchaseOrderStatus: updatedPO.status,
      };
    });
  }

  async getPurchaseOrderReceipts(purchaseOrderId: string) {
    return prisma.purchaseReceipt.findMany({
      where: { purchaseOrderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPurchaseOrderReceiptById(purchaseOrderId: string, receiptId: string) {
    const receipt = await prisma.purchaseReceipt.findFirst({
      where: { id: receiptId, purchaseOrderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!receipt) {
      throw new NotFoundError('Purchase receipt not found');
    }
    return receipt;
  }

  async listPurchaseReceipts(options: PurchaseReceiptQueryOptions) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseReceiptWhereInput = {};

    if (options.purchaseOrderId) {
      where.purchaseOrderId = options.purchaseOrderId;
    }

    if (options.companyId || options.branchId) {
      where.purchaseOrder = {};
      if (options.companyId) {
        where.purchaseOrder.branch = {
          companyId: options.companyId,
        };
      }
      if (options.branchId) {
        where.purchaseOrder.branchId = options.branchId;
      }
    }

    if (options.search) {
      where.purchaseReceiptNumber = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.purchaseReceipt.count({ where }),
      prisma.purchaseReceipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          purchaseOrder: {
            include: {
              vendor: true,
              branch: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPurchaseReceiptById(id: string) {
    const receipt = await prisma.purchaseReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            branch: true,
          },
        },
        items: {
          include: {
            product: true,
            inventoryItems: {
              include: {
                tags: true
              }
            }
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundError('Purchase receipt not found');
    }

    return receipt;
  }
}

export const purchaseService = new PurchaseService();
