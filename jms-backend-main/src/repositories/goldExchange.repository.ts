import { prisma } from '../database';
import { Prisma, ExchangeStatus, MetalType } from '../generated/prisma';

export interface CreateExchangeInput {
  salesInvoiceId: string;
  customerId: string;
  branchId: string;
  remarks?: string;
  createdBy?: string;
  items: {
    metalType: MetalType;
    purity: string;
    grossWeight: Prisma.Decimal;
    stoneWeight: Prisma.Decimal;
    netWeight: Prisma.Decimal;
    deductionPercent: Prisma.Decimal;
    remarks?: string;
  }[];
}

export interface FindExchangesQuery {
  search?: string;
  exchangeNumber?: string;
  customerId?: string;
  salesInvoiceId?: string;
  branchId?: string;
  status?: ExchangeStatus;
  metalType?: MetalType;
  purity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class GoldExchangeRepository {
  async create(data: CreateExchangeInput, exchangeNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchange.create({
      data: {
        exchangeNumber,
        salesInvoiceId: data.salesInvoiceId,
        customerId: data.customerId,
        branchId: data.branchId,
        remarks: data.remarks,
        createdBy: data.createdBy,
        status: ExchangeStatus.REQUESTED,
        items: {
          create: data.items.map((item) => ({
            metalType: item.metalType,
            purity: item.purity,
            grossWeight: item.grossWeight,
            stoneWeight: item.stoneWeight,
            netWeight: item.netWeight,
            deductionPercent: item.deductionPercent,
            remarks: item.remarks,
          })),
        },
      },
      include: {
        items: {
          include: {
            metalRate: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchange.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            metalRate: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
      },
    });
  }

  async findByExchangeNumber(exchangeNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchange.findUnique({
      where: { exchangeNumber },
      include: {
        items: true,
      },
    });
  }

  async findByInvoiceId(salesInvoiceId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchange.findMany({
      where: { salesInvoiceId },
      include: {
        items: {
          include: {
            metalRate: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveExchangeForInvoice(salesInvoiceId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchange.findFirst({
      where: {
        salesInvoiceId,
        status: {
          in: [ExchangeStatus.REQUESTED, ExchangeStatus.VALUED, ExchangeStatus.APPLIED],
        },
      },
    });
  }

  async findAll(query: FindExchangesQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerGoldExchangeWhereInput = {};

    if (query.exchangeNumber) {
      where.exchangeNumber = { contains: query.exchangeNumber, mode: 'insensitive' };
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.salesInvoiceId) {
      where.salesInvoiceId = query.salesInvoiceId;
    }
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.metalType || query.purity) {
      where.items = {
        some: {
          ...(query.metalType && { metalType: query.metalType }),
          ...(query.purity && { purity: { equals: query.purity, mode: 'insensitive' } }),
        },
      };
    }
    if (query.search) {
      where.OR = [
        { exchangeNumber: { contains: query.search, mode: 'insensitive' } },
        { remarks: { contains: query.search, mode: 'insensitive' } },
        { customer: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { salesInvoice: { invoiceNumber: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = query.dateFrom;
      if (query.dateTo) where.createdAt.lte = query.dateTo;
    }

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'exchangeNumber',
      'totalNetWeight',
      'totalExchangeValue',
      'status',
    ];
    const sortBy = allowedSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      prisma.customerGoldExchange.count({ where }),
      prisma.customerGoldExchange.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              metalRate: true,
            },
          },
          salesInvoice: true,
          customer: true,
          branch: true,
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

  async update(id: string, data: Prisma.CustomerGoldExchangeUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchange.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            metalRate: true,
          },
        },
        salesInvoice: true,
        customer: true,
        branch: true,
      },
    });
  }

  async updateItem(itemId: string, data: Prisma.CustomerGoldExchangeItemUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.customerGoldExchangeItem.update({
      where: { id: itemId },
      data,
    });
  }
}

export const goldExchangeRepository = new GoldExchangeRepository();
