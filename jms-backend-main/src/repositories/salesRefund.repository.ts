import { prisma } from '../database';
import { Prisma, RefundStatus, PaymentMethod } from '../generated/prisma';

export interface CreateRefundInput {
  salesReturnId: string;
  refundMethod: PaymentMethod;
  amount: Prisma.Decimal;
  transactionReference?: string;
  remarks?: string;
  processedBy?: string;
}

export interface FindSalesRefundsQuery {
  search?: string;
  refundNumber?: string;
  salesReturnId?: string;
  refundMethod?: PaymentMethod;
  status?: RefundStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SalesRefundRepository {
  async create(data: CreateRefundInput, refundNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesRefund.create({
      data: {
        refundNumber,
        salesReturnId: data.salesReturnId,
        refundMethod: data.refundMethod,
        amount: data.amount,
        status: RefundStatus.COMPLETED,
        transactionReference: data.transactionReference,
        remarks: data.remarks,
        processedBy: data.processedBy,
      },
      include: {
        salesReturn: {
          include: {
            salesInvoice: true,
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesRefund.findUnique({
      where: { id },
      include: {
        salesReturn: {
          include: {
            salesInvoice: true,
            customer: true,
            branch: true,
            items: true,
          },
        },
      },
    });
  }

  async findByRefundNumber(refundNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesRefund.findUnique({
      where: { refundNumber },
      include: {
        salesReturn: {
          include: {
            salesInvoice: true,
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async findByReturnId(salesReturnId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesRefund.findMany({
      where: { salesReturnId },
      orderBy: { createdAt: 'desc' },
      include: {
        salesReturn: true,
      },
    });
  }

  async findAll(query: FindSalesRefundsQuery, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const {
      search,
      refundNumber,
      salesReturnId,
      refundMethod,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.SalesRefundWhereInput = {};

    if (refundNumber) {
      where.refundNumber = { contains: refundNumber, mode: 'insensitive' };
    }

    if (salesReturnId) {
      where.salesReturnId = salesReturnId;
    }

    if (refundMethod) {
      where.refundMethod = refundMethod;
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
        { refundNumber: { contains: search, mode: 'insensitive' } },
        { transactionReference: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, refunds] = await Promise.all([
      client.salesRefund.count({ where }),
      client.salesRefund.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          salesReturn: {
            include: {
              salesInvoice: true,
              customer: true,
              branch: true,
            },
          },
        },
      }),
    ]);

    return {
      refunds,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async reverse(
    id: string,
    data: {
      reversedBy: string;
      reversalReason: string;
      reversedAt: Date;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.salesRefund.update({
      where: { id },
      data: {
        status: RefundStatus.REVERSED,
        reversedBy: data.reversedBy,
        reversalReason: data.reversalReason,
        reversedAt: data.reversedAt,
      },
      include: {
        salesReturn: {
          include: {
            salesInvoice: true,
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async countByYear(year: number, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx || prisma;
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    return client.salesRefund.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }
}
