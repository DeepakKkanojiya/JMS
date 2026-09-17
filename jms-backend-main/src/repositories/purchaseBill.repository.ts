import { prisma } from '../database';
import { Prisma, PurchaseBillStatus } from '../generated/prisma';

export class PurchaseBillRepository {
  async create(
    data: {
      billNumber: string;
      purchaseOrderId: string;
      vendorId: string;
      branchId: string;
      status?: PurchaseBillStatus;
      billDate?: Date;
      dueDate?: Date | null;
      subtotal: Prisma.Decimal | number;
      discountAmount?: Prisma.Decimal | number;
      taxAmount: Prisma.Decimal | number;
      grandTotal: Prisma.Decimal | number;
      totalPaid?: Prisma.Decimal | number;
      outstandingAmount: Prisma.Decimal | number;
      notes?: string | null;
      createdBy?: string;
      items: Array<{
        purchaseOrderItemId?: string | null;
        purchaseReceiptItemId?: string | null;
        inventoryItemId?: string | null;
        itemName: string;
        description?: string | null;
        quantity?: number;
        grossWeight?: Prisma.Decimal | number;
        stoneWeight?: Prisma.Decimal | number;
        netWeight?: Prisma.Decimal | number;
        purchaseRate?: Prisma.Decimal | number;
        metalValue?: Prisma.Decimal | number;
        makingCharges?: Prisma.Decimal | number;
        discountAmount?: Prisma.Decimal | number;
        taxableAmount?: Prisma.Decimal | number;
        taxRate?: Prisma.Decimal | number;
        taxAmount?: Prisma.Decimal | number;
        lineTotal?: Prisma.Decimal | number;
      }>;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.purchaseBill.create({
      data: {
        billNumber: data.billNumber,
        purchaseOrderId: data.purchaseOrderId,
        vendorId: data.vendorId,
        branchId: data.branchId,
        status: data.status || PurchaseBillStatus.DRAFT,
        billDate: data.billDate || new Date(),
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount ?? 0,
        taxAmount: data.taxAmount,
        grandTotal: data.grandTotal,
        totalPaid: data.totalPaid ?? 0,
        outstandingAmount: data.outstandingAmount,
        notes: data.notes,
        createdBy: data.createdBy,
        items: {
          create: data.items.map((item) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            purchaseReceiptItemId: item.purchaseReceiptItemId,
            inventoryItemId: item.inventoryItemId,
            itemName: item.itemName,
            description: item.description,
            quantity: item.quantity ?? 1,
            grossWeight: item.grossWeight ?? 0,
            stoneWeight: item.stoneWeight ?? 0,
            netWeight: item.netWeight ?? 0,
            purchaseRate: item.purchaseRate ?? 0,
            metalValue: item.metalValue ?? 0,
            makingCharges: item.makingCharges ?? 0,
            discountAmount: item.discountAmount ?? 0,
            taxableAmount: item.taxableAmount ?? 0,
            taxRate: item.taxRate ?? 0,
            taxAmount: item.taxAmount ?? 0,
            lineTotal: item.lineTotal ?? 0,
          })),
        },
      },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: {
            purchaseOrderItem: true,
            purchaseReceiptItem: true,
            inventoryItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.findUnique({
      where: { id },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: {
            purchaseOrderItem: true,
            purchaseReceiptItem: true,
            inventoryItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByBillNumber(billNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.findUnique({
      where: { billNumber },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: {
            purchaseOrderItem: true,
            purchaseReceiptItem: true,
            inventoryItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByPurchaseOrderId(purchaseOrderId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.findMany({
      where: { purchaseOrderId },
      include: {
        vendor: true,
        branch: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVendorId(vendorId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.findMany({
      where: { vendorId },
      include: {
        purchaseOrder: true,
        branch: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      vendorId?: string;
      branchId?: string;
      companyId?: string;
      purchaseOrderId?: string;
      status?: PurchaseBillStatus | string;
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const rawPage = options.page ? Number(options.page) : 1;
    const rawLimit = options.limit ? Number(options.limit) : 10;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseBillWhereInput = {};

    if (options.vendorId) {
      where.vendorId = options.vendorId;
    }

    if (options.branchId) {
      where.branchId = options.branchId;
    }

    if (options.companyId) {
      where.branch = { companyId: options.companyId };
    }

    if (options.purchaseOrderId) {
      where.purchaseOrderId = options.purchaseOrderId;
    }

    if (options.status) {
      where.status = options.status as PurchaseBillStatus;
    }

    if (options.fromDate || options.toDate) {
      where.billDate = {};
      if (options.fromDate) {
        where.billDate.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        where.billDate.lte = new Date(options.toDate);
      }
    }

    if (options.search) {
      where.OR = [
        { billNumber: { contains: options.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: options.search, mode: 'insensitive' } } },
        { vendor: { vendorCode: { contains: options.search, mode: 'insensitive' } } },
        { purchaseOrder: { purchaseOrderNumber: { contains: options.search, mode: 'insensitive' } } },
        { notes: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'billNumber', 'billDate', 'grandTotal', 'outstandingAmount'];
    const sortBy = options.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.purchaseBill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          purchaseOrder: { include: { vendor: true, branch: true } },
          vendor: true,
          branch: { include: { company: true } },
          items: {
            include: {
              purchaseOrderItem: true,
              purchaseReceiptItem: true,
              inventoryItem: true,
            },
          },
        },
      }),
      client.purchaseBill.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async updateDraft(
    id: string,
    data: {
      dueDate?: Date | null;
      subtotal?: Prisma.Decimal | number;
      discountAmount?: Prisma.Decimal | number;
      taxAmount?: Prisma.Decimal | number;
      grandTotal?: Prisma.Decimal | number;
      outstandingAmount?: Prisma.Decimal | number;
      notes?: string | null;
      updatedBy?: string;
      items?: Array<{
        purchaseOrderItemId?: string | null;
        purchaseReceiptItemId?: string | null;
        inventoryItemId?: string | null;
        itemName: string;
        description?: string | null;
        quantity?: number;
        grossWeight?: Prisma.Decimal | number;
        stoneWeight?: Prisma.Decimal | number;
        netWeight?: Prisma.Decimal | number;
        purchaseRate?: Prisma.Decimal | number;
        metalValue?: Prisma.Decimal | number;
        makingCharges?: Prisma.Decimal | number;
        discountAmount?: Prisma.Decimal | number;
        taxableAmount?: Prisma.Decimal | number;
        taxRate?: Prisma.Decimal | number;
        taxAmount?: Prisma.Decimal | number;
        lineTotal?: Prisma.Decimal | number;
      }>;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    if (data.items) {
      await client.purchaseBillItem.deleteMany({
        where: { purchaseBillId: id },
      });
    }

    return client.purchaseBill.update({
      where: { id },
      data: {
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        taxAmount: data.taxAmount,
        grandTotal: data.grandTotal,
        outstandingAmount: data.outstandingAmount,
        notes: data.notes,
        updatedBy: data.updatedBy,
        ...(data.items
          ? {
              items: {
                create: data.items.map((item) => ({
                  purchaseOrderItemId: item.purchaseOrderItemId,
                  purchaseReceiptItemId: item.purchaseReceiptItemId,
                  inventoryItemId: item.inventoryItemId,
                  itemName: item.itemName,
                  description: item.description,
                  quantity: item.quantity ?? 1,
                  grossWeight: item.grossWeight ?? 0,
                  stoneWeight: item.stoneWeight ?? 0,
                  netWeight: item.netWeight ?? 0,
                  purchaseRate: item.purchaseRate ?? 0,
                  metalValue: item.metalValue ?? 0,
                  makingCharges: item.makingCharges ?? 0,
                  discountAmount: item.discountAmount ?? 0,
                  taxableAmount: item.taxableAmount ?? 0,
                  taxRate: item.taxRate ?? 0,
                  taxAmount: item.taxAmount ?? 0,
                  lineTotal: item.lineTotal ?? 0,
                })),
              },
            }
          : {}),
      },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: {
            purchaseOrderItem: true,
            purchaseReceiptItem: true,
            inventoryItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async submit(id: string, userId?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.update({
      where: { id },
      data: {
        status: PurchaseBillStatus.SUBMITTED,
        submittedBy: userId || null,
        submittedAt: new Date(),
        updatedBy: userId || null,
      },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: true,
      },
    });
  }

  async approve(id: string, userId?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.update({
      where: { id },
      data: {
        status: PurchaseBillStatus.APPROVED,
        approvedBy: userId || null,
        approvedAt: new Date(),
        updatedBy: userId || null,
      },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: true,
      },
    });
  }

  async cancel(id: string, cancellationReason: string, userId?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseBill.update({
      where: { id },
      data: {
        status: PurchaseBillStatus.CANCELLED,
        cancelledBy: userId || null,
        cancelledAt: new Date(),
        cancellationReason,
        updatedBy: userId || null,
      },
      include: {
        purchaseOrder: { include: { vendor: true, branch: true } },
        vendor: true,
        branch: { include: { company: true } },
        items: true,
      },
    });
  }

  async getBillableQuantities(purchaseOrderId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const po = await client.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: true,
        purchaseReceipts: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!po) return null;

    // Get all existing active/approved/draft purchase bills for this PO (excluding CANCELLED)
    const existingBills = await client.purchaseBill.findMany({
      where: {
        purchaseOrderId,
        status: { not: PurchaseBillStatus.CANCELLED },
      },
      include: {
        items: true,
      },
    });

    const billedQtyMap = new Map<string, number>();
    for (const bill of existingBills) {
      for (const bItem of bill.items) {
        if (bItem.purchaseOrderItemId) {
          const curr = billedQtyMap.get(bItem.purchaseOrderItemId) || 0;
          billedQtyMap.set(bItem.purchaseOrderItemId, curr + bItem.quantity);
        }
      }
    }

    return po.items.map((item) => {
      const received = item.receivedQuantity;
      const billed = billedQtyMap.get(item.id) || 0;
      const remaining = Math.max(0, received - billed);
      return {
        purchaseOrderItemId: item.id,
        itemName: item.itemName,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: received,
        previouslyBilledQuantity: billed,
        remainingBillableQuantity: remaining,
      };
    });
  }

  async getSummary(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const bill = await client.purchaseBill.findUnique({
      where: { id },
      select: {
        id: true,
        billNumber: true,
        subtotal: true,
        discountAmount: true,
        taxAmount: true,
        grandTotal: true,
        totalPaid: true,
        outstandingAmount: true,
        status: true,
      },
    });

    return bill;
  }
}

export const purchaseBillRepository = new PurchaseBillRepository();
