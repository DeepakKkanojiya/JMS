import { prisma } from '../database';
import { Prisma, GirviCollectionStatus, GirviPaymentMethod } from '../generated/prisma';

export interface CreateGirviCollectionInput {
  collectionNumber: string;
  girviLoanId: string;
  paymentMethod: GirviPaymentMethod;
  amount: Prisma.Decimal | number | string;
  principalAmount: Prisma.Decimal | number | string;
  interestAmount: Prisma.Decimal | number | string;
  transactionReference?: string | null;
  collectionDate?: Date | string;
  receivedBy?: string | null;
  remarks?: string | null;
}

export interface GirviCollectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  girviLoanId?: string;
  paymentMethod?: GirviPaymentMethod;
  status?: GirviCollectionStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class GirviCollectionRepository {
  async create(data: CreateGirviCollectionInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviCollection.create({
      data: {
        collectionNumber: data.collectionNumber,
        girviLoanId: data.girviLoanId,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        principalAmount: data.principalAmount,
        interestAmount: data.interestAmount,
        transactionReference: data.transactionReference || null,
        collectionDate: data.collectionDate ? new Date(data.collectionDate) : new Date(),
        status: GirviCollectionStatus.COMPLETED,
        receivedBy: data.receivedBy || null,
        remarks: data.remarks || null,
      },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviCollection.findUnique({
      where: { id },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async findByCollectionNumber(collectionNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviCollection.findUnique({
      where: { collectionNumber },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async getCompletedCollectionsByLoanId(girviLoanId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviCollection.findMany({
      where: {
        girviLoanId,
        status: GirviCollectionStatus.COMPLETED,
      },
      orderBy: { collectionDate: 'asc' },
    });
  }

  async reverseCollection(id: string, reversalReason: string, reversedBy?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviCollection.update({
      where: { id },
      data: {
        status: GirviCollectionStatus.REVERSED,
        reversalReason,
        reversedAt: new Date(),
        reversedBy: reversedBy || null,
      },
      include: {
        girviLoan: {
          include: {
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async findMany(params: GirviCollectionQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      girviLoanId,
      paymentMethod,
      status,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.GirviCollectionWhereInput = {};

    if (girviLoanId) where.girviLoanId = girviLoanId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (status) where.status = status;

    if (fromDate || toDate) {
      where.collectionDate = {};
      if (fromDate) where.collectionDate.gte = new Date(fromDate);
      if (toDate) where.collectionDate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { collectionNumber: { contains: search, mode: 'insensitive' } },
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
      prisma.girviCollection.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          girviLoan: {
            include: {
              customer: true,
              branch: true,
            },
          },
        },
      }),
      prisma.girviCollection.count({ where }),
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

export const girviCollectionRepository = new GirviCollectionRepository();
