import { prisma } from '../database';
import { Prisma, GirviLoanStatus, GirviInterestPeriod } from '../generated/prisma';

export interface CreateGirviCollateralInput {
  inventoryItemId?: string | null;
  itemName: string;
  metalType?: string;
  purity?: string;
  grossWeight: Prisma.Decimal | number | string;
  stoneWeight?: Prisma.Decimal | number | string;
  netWeight: Prisma.Decimal | number | string;
  valuedAmount?: Prisma.Decimal | number | string;
  barcode?: string | null;
  rfidEpc?: string | null;
  imageUrl?: string | null;
  remarks?: string | null;
}

export interface CreateGirviLoanInput {
  loanNumber: string;
  companyId: string;
  branchId: string;
  customerId: string;
  dueDate: Date | string;
  principalAmount: Prisma.Decimal | number | string;
  valuationAmount?: Prisma.Decimal | number | string;
  interestRate?: Prisma.Decimal | number | string;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
  createdBy?: string | null;
  status?: GirviLoanStatus;
  collaterals?: CreateGirviCollateralInput[];
}

export interface UpdateGirviLoanInput {
  dueDate?: Date | string;
  principalAmount?: Prisma.Decimal | number | string;
  valuationAmount?: Prisma.Decimal | number | string;
  interestRate?: Prisma.Decimal | number | string;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
  updatedBy?: string | null;
  status?: GirviLoanStatus;
}

export interface GirviLoanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  status?: GirviLoanStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class GirviLoanRepository {
  async create(data: CreateGirviLoanInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const { collaterals, ...loanData } = data;

    return client.girviLoan.create({
      data: {
        ...loanData,
        dueDate: new Date(data.dueDate),
        collaterals: collaterals && collaterals.length > 0 ? {
          create: collaterals.map((c) => ({
            ...c,
            grossWeight: c.grossWeight,
            stoneWeight: c.stoneWeight ?? 0,
            netWeight: c.netWeight,
            valuedAmount: c.valuedAmount ?? 0,
          })),
        } : undefined,
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviLoan.findUnique({
      where: { id },
      include: {
        company: true,
        branch: true,
        customer: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async findByLoanNumber(loanNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviLoan.findUnique({
      where: { loanNumber },
      include: {
        company: true,
        branch: true,
        customer: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateGirviLoanInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const updateData: Prisma.GirviLoanUpdateInput = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    return client.girviLoan.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        branch: true,
        customer: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async findMany(params: GirviLoanQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      companyId,
      branchId,
      customerId,
      status,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.GirviLoanWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    if (fromDate || toDate) {
      where.loanDate = {};
      if (fromDate) where.loanDate.gte = new Date(fromDate);
      if (toDate) where.loanDate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { loanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search, mode: 'insensitive' } } },
        { collaterals: { some: { itemName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.girviLoan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: true,
          branch: true,
          customer: true,
          collaterals: {
            include: {
              inventoryItem: true,
            },
          },
        },
      }),
      prisma.girviLoan.count({ where }),
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

  async addCollateral(girviLoanId: string, data: CreateGirviCollateralInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.girviCollateral.create({
      data: {
        girviLoanId,
        ...data,
        stoneWeight: data.stoneWeight ?? 0,
        valuedAmount: data.valuedAmount ?? 0,
      },
      include: {
        inventoryItem: true,
      },
    });
  }
}

export const girviLoanRepository = new GirviLoanRepository();
