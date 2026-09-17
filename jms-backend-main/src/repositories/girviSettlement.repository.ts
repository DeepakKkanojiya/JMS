import { prisma } from '../database';
import { Prisma, GirviPaymentMethod } from '../generated/prisma';

export interface CreateGirviSettlementInput {
  settlementNumber: string;
  girviLoanId: string;
  paymentMethod: GirviPaymentMethod;
  totalSettlementAmount: Prisma.Decimal | number | string;
  principalSettled: Prisma.Decimal | number | string;
  interestSettled: Prisma.Decimal | number | string;
  transactionReference?: string | null;
  settlementDate?: Date | string;
  remarks?: string | null;
  settledBy?: string | null;
}

export interface GirviSettlementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  girviLoanId?: string;
  paymentMethod?: GirviPaymentMethod;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class GirviSettlementRepository {
  async create(data: CreateGirviSettlementInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviSettlement.create({
      data: {
        settlementNumber: data.settlementNumber,
        girviLoanId: data.girviLoanId,
        paymentMethod: data.paymentMethod,
        totalSettlementAmount: data.totalSettlementAmount,
        principalSettled: data.principalSettled,
        interestSettled: data.interestSettled,
        transactionReference: data.transactionReference || null,
        settlementDate: data.settlementDate ? new Date(data.settlementDate) : new Date(),
        remarks: data.remarks || null,
        settledBy: data.settledBy || null,
      },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
            collaterals: true,
          },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviSettlement.findUnique({
      where: { id },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
            collaterals: true,
            collections: true,
            renewals: true,
          },
        },
      },
    });
  }

  async findByLoanId(girviLoanId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviSettlement.findUnique({
      where: { girviLoanId },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
            collaterals: true,
            collections: true,
            renewals: true,
          },
        },
      },
    });
  }

  async findMany(params: GirviSettlementQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      girviLoanId,
      paymentMethod,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.GirviSettlementWhereInput = {};

    if (girviLoanId) where.girviLoanId = girviLoanId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (fromDate || toDate) {
      where.settlementDate = {};
      if (fromDate) where.settlementDate.gte = new Date(fromDate);
      if (toDate) where.settlementDate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { settlementNumber: { contains: search, mode: 'insensitive' } },
        { transactionReference: { contains: search, mode: 'insensitive' } },
        { girviLoan: { loanNumber: { contains: search, mode: 'insensitive' } } },
        { girviLoan: { customer: { firstName: { contains: search, mode: 'insensitive' } } } },
        { girviLoan: { customer: { mobile: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.girviSettlement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          girviLoan: {
            include: {
              customer: true,
              branch: true,
              collaterals: true,
            },
          },
        },
      }),
      prisma.girviSettlement.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}

export const girviSettlementRepository = new GirviSettlementRepository();
