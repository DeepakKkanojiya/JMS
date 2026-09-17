import { prisma } from '../database';
import { Prisma, SalesReturnStatus } from '../generated/prisma';

export interface CreateReturnInput {
  salesInvoiceId: string;
  customerId: string;
  branchId: string;
  reason?: string;
  remarks?: string;
  requestedBy?: string;
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  deductionAmount: Prisma.Decimal;
  refundAmount: Prisma.Decimal;
  items: {
    salesInvoiceItemId: string;
    inventoryItemId: string;
    quantity: number;
    originalAmount: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    deductionAmount: Prisma.Decimal;
    refundAmount: Prisma.Decimal;
    reason?: string;
    remarks?: string;
  }[];
}

export interface FindSalesReturnsQuery {
  search?: string;
  returnNumber?: string;
  customerId?: string;
  salesInvoiceId?: string;
  branchId?: string;
  status?: SalesReturnStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SalesReturnRepository {
  async create(data: CreateReturnInput, returnNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesReturn.create({
      data: {
        returnNumber,
        salesInvoiceId: data.salesInvoiceId,
        customerId: data.customerId,
        branchId: data.branchId,
        status: SalesReturnStatus.REQUESTED,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        deductionAmount: data.deductionAmount,
        refundAmount: data.refundAmount,
        reason: data.reason,
        remarks: data.remarks,
        requestedBy: data.requestedBy,
        items: {
          create: data.items.map((item) => ({
            salesInvoiceItemId: item.salesInvoiceItemId,
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            originalAmount: item.originalAmount,
            taxAmount: item.taxAmount,
            deductionAmount: item.deductionAmount,
            refundAmount: item.refundAmount,
            reason: item.reason,
            remarks: item.remarks,
          })),
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            salesInvoiceItem: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
        refunds: true,
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesReturn.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            inventoryItem: true,
            salesInvoiceItem: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
        refunds: true,
      },
    });
  }

  async findByReturnNumber(returnNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesReturn.findUnique({
      where: { returnNumber },
      include: {
        items: {
          include: {
            inventoryItem: true,
            salesInvoiceItem: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
        refunds: true,
      },
    });
  }

  async findByInvoiceId(salesInvoiceId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesReturn.findMany({
      where: { salesInvoiceId },
      include: {
        items: {
          include: {
            inventoryItem: true,
            salesInvoiceItem: true,
          },
        },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveReturnForItem(inventoryItemId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesReturnItem.findFirst({
      where: {
        inventoryItemId,
        salesReturn: {
          status: {
            in: [SalesReturnStatus.REQUESTED, SalesReturnStatus.APPROVED, SalesReturnStatus.PROCESSED],
          },
        },
      },
      include: {
        salesReturn: true,
      },
    });
  }

  async findAll(query: FindSalesReturnsQuery, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const {
      search,
      returnNumber,
      customerId,
      salesInvoiceId,
      branchId,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.SalesReturnWhereInput = {};

    if (returnNumber) {
      where.returnNumber = { contains: returnNumber, mode: 'insensitive' };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (salesInvoiceId) {
      where.salesInvoiceId = salesInvoiceId;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (search) {
      where.OR = [
        { returnNumber: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, returns] = await Promise.all([
      client.salesReturn.count({ where }),
      client.salesReturn.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              inventoryItem: true,
              salesInvoiceItem: true,
            },
          },
          salesInvoice: true,
          customer: true,
          branch: true,
          refunds: true,
        },
      }),
    ]);

    return {
      returns,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async updateStatus(
    id: string,
    data: {
      status: SalesReturnStatus;
      approvedBy?: string;
      approvedAt?: Date;
      processedBy?: string;
      processedAt?: Date;
      cancelledBy?: string;
      cancelledAt?: Date;
      cancellationReason?: string;
      remarks?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.salesReturn.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            inventoryItem: true,
            salesInvoiceItem: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
        refunds: true,
      },
    });
  }

  async countByYear(year: number, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx || prisma;
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    return client.salesReturn.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }
}
