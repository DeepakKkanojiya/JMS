import { prisma } from '../database';
import { Prisma, PurchaseOrderStatus } from '../generated/prisma';

export class PurchaseRepository {
  async create(
    data: {
      purchaseOrderNumber: string;
      vendorId: string;
      branchId: string;
      status?: PurchaseOrderStatus;
      orderDate?: Date;
      expectedDeliveryDate?: Date | null;
      subtotal: Prisma.Decimal | number;
      taxAmount: Prisma.Decimal | number;
      grandTotal: Prisma.Decimal | number;
      notes?: string | null;
      termsConditions?: string | null;
      createdBy?: string;
      items: Array<{
        productId?: string | null;
        metalType: any;
        purity: string;
        itemName: string;
        description?: string | null;
        orderedQuantity?: number;
        grossWeight: Prisma.Decimal | number;
        netWeight: Prisma.Decimal | number;
        stoneWeight?: Prisma.Decimal | number;
        expectedRate: Prisma.Decimal | number;
        makingCharges?: Prisma.Decimal | number;
        taxRate?: Prisma.Decimal | number;
        taxAmount: Prisma.Decimal | number;
        itemTotal: Prisma.Decimal | number;
      }>;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.purchaseOrder.create({
      data: {
        purchaseOrderNumber: data.purchaseOrderNumber,
        vendorId: data.vendorId,
        branchId: data.branchId,
        status: data.status || PurchaseOrderStatus.DRAFT,
        orderDate: data.orderDate || new Date(),
        expectedDeliveryDate: data.expectedDeliveryDate,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        grandTotal: data.grandTotal,
        notes: data.notes,
        termsConditions: data.termsConditions,
        createdBy: data.createdBy,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            metalType: item.metalType,
            purity: item.purity,
            itemName: item.itemName,
            description: item.description,
            orderedQuantity: item.orderedQuantity ?? 1,
            receivedQuantity: 0,
            grossWeight: item.grossWeight,
            netWeight: item.netWeight,
            stoneWeight: item.stoneWeight ?? 0.0,
            expectedRate: item.expectedRate,
            makingCharges: item.makingCharges ?? 0.0,
            taxRate: item.taxRate ?? 0.0,
            taxAmount: item.taxAmount,
            itemTotal: item.itemTotal,
          })),
        },
      },
      include: {
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: { product: true },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByPurchaseOrderNumber(purchaseOrderNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseOrder.findUnique({
      where: { purchaseOrderNumber },
      include: {
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: { product: true },
        },
      },
    });
  }

  async countPurchaseOrders(where: Prisma.PurchaseOrderWhereInput = {}, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseOrder.count({ where });
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      vendorId?: string;
      branchId?: string;
      companyId?: string;
      status?: PurchaseOrderStatus | string;
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

    const where: Prisma.PurchaseOrderWhereInput = {};

    if (options.vendorId) {
      where.vendorId = options.vendorId;
    }

    if (options.branchId) {
      where.branchId = options.branchId;
    }

    if (options.companyId) {
      where.branch = { companyId: options.companyId };
    }

    if (options.status) {
      where.status = options.status as PurchaseOrderStatus;
    }

    if (options.fromDate || options.toDate) {
      where.orderDate = {};
      if (options.fromDate) {
        where.orderDate.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        where.orderDate.lte = new Date(options.toDate);
      }
    }

    if (options.search) {
      where.OR = [
        { purchaseOrderNumber: { contains: options.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: options.search, mode: 'insensitive' } } },
        { vendor: { vendorCode: { contains: options.search, mode: 'insensitive' } } },
        { notes: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'purchaseOrderNumber', 'orderDate', 'grandTotal'];
    const sortBy = options.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vendor: true,
          branch: { include: { company: true } },
          items: {
            include: { product: true },
          },
        },
      }),
      client.purchaseOrder.count({ where }),
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

  async update(
    id: string,
    data: {
      vendorId?: string;
      branchId?: string;
      orderDate?: Date;
      expectedDeliveryDate?: Date | null;
      subtotal?: Prisma.Decimal | number;
      taxAmount?: Prisma.Decimal | number;
      grandTotal?: Prisma.Decimal | number;
      notes?: string | null;
      termsConditions?: string | null;
      updatedBy?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.purchaseOrder.update({
      where: { id },
      data,
      include: {
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: { product: true },
        },
      },
    });
  }

  async replaceItems(
    purchaseOrderId: string,
    items: Array<{
      productId?: string | null;
      metalType: any;
      purity: string;
      itemName: string;
      description?: string | null;
      orderedQuantity?: number;
      grossWeight: Prisma.Decimal | number;
      netWeight: Prisma.Decimal | number;
      stoneWeight?: Prisma.Decimal | number;
      expectedRate: Prisma.Decimal | number;
      makingCharges?: Prisma.Decimal | number;
      taxRate?: Prisma.Decimal | number;
      taxAmount: Prisma.Decimal | number;
      itemTotal: Prisma.Decimal | number;
    }>,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    // Delete existing items and recreate
    await client.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId },
    });

    await client.purchaseOrderItem.createMany({
      data: items.map((item) => ({
        purchaseOrderId,
        productId: item.productId,
        metalType: item.metalType,
        purity: item.purity,
        itemName: item.itemName,
        description: item.description,
        orderedQuantity: item.orderedQuantity ?? 1,
        receivedQuantity: 0,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        stoneWeight: item.stoneWeight ?? 0.0,
        expectedRate: item.expectedRate,
        makingCharges: item.makingCharges ?? 0.0,
        taxRate: item.taxRate ?? 0.0,
        taxAmount: item.taxAmount,
        itemTotal: item.itemTotal,
      })),
    });
  }

  async updateStatus(
    id: string,
    data: {
      status: PurchaseOrderStatus;
      submittedBy?: string;
      submittedAt?: Date | null;
      approvedBy?: string;
      approvedAt?: Date | null;
      cancelledBy?: string;
      cancelledAt?: Date | null;
      cancellationReason?: string | null;
      updatedBy?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.purchaseOrder.update({
      where: { id },
      data,
      include: {
        vendor: true,
        branch: { include: { company: true } },
        items: {
          include: { product: true },
        },
      },
    });
  }
}

export const purchaseRepository = new PurchaseRepository();
