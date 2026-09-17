import { prisma } from '../database';
import { Prisma, ThirdPartyGirviStatus, GirviInterestPeriod } from '../generated/prisma';

export interface CreateThirdPartyLenderInput {
  lenderCode: string;
  name: string;
  companyId: string;
  branchId?: string | null;
  contactPerson?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface CreateThirdPartyCollateralInput {
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

export interface CreateThirdPartyGirviInput {
  referenceNumber: string;
  externalLoanNumber: string;
  companyId: string;
  branchId: string;
  customerId: string;
  thirdPartyLenderId: string;
  dueDate: Date | string;
  principalAmount: Prisma.Decimal | number | string;
  valuationAmount?: Prisma.Decimal | number | string;
  interestRate?: Prisma.Decimal | number | string;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
  createdBy?: string | null;
  collaterals?: CreateThirdPartyCollateralInput[];
}

export interface ThirdPartyGirviQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  thirdPartyLenderId?: string;
  status?: ThirdPartyGirviStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ThirdPartyGirviRepository {
  async createLender(data: CreateThirdPartyLenderInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyLender.create({
      data: {
        lenderCode: data.lenderCode,
        name: data.name,
        companyId: data.companyId,
        branchId: data.branchId || null,
        contactPerson: data.contactPerson || null,
        mobile: data.mobile || null,
        email: data.email || null,
        address: data.address || null,
      },
    });
  }

  async findLenderById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyLender.findUnique({
      where: { id },
      include: { company: true, branch: true },
    });
  }

  async findLenderByCode(companyId: string, lenderCode: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyLender.findUnique({
      where: { companyId_lenderCode: { companyId, lenderCode } },
    });
  }

  async findLenders(companyId: string, search?: string) {
    const where: Prisma.ThirdPartyLenderWhereInput = { companyId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lenderCode: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.thirdPartyLender.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createGirvi(data: CreateThirdPartyGirviInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyGirvi.create({
      data: {
        referenceNumber: data.referenceNumber,
        externalLoanNumber: data.externalLoanNumber,
        companyId: data.companyId,
        branchId: data.branchId,
        customerId: data.customerId,
        thirdPartyLenderId: data.thirdPartyLenderId,
        dueDate: new Date(data.dueDate),
        principalAmount: data.principalAmount,
        valuationAmount: data.valuationAmount ?? 0,
        interestRate: data.interestRate ?? 0,
        interestPeriod: data.interestPeriod || GirviInterestPeriod.MONTHLY,
        notes: data.notes || null,
        documentRef: data.documentRef || null,
        createdBy: data.createdBy || null,
        status: ThirdPartyGirviStatus.DRAFT,
        collaterals: data.collaterals
          ? {
              create: data.collaterals.map((c) => ({
                inventoryItemId: c.inventoryItemId || null,
                itemName: c.itemName,
                metalType: c.metalType || 'GOLD',
                purity: c.purity || '22K',
                grossWeight: c.grossWeight,
                stoneWeight: c.stoneWeight ?? 0,
                netWeight: c.netWeight,
                valuedAmount: c.valuedAmount ?? 0,
                barcode: c.barcode || null,
                rfidEpc: c.rfidEpc || null,
                imageUrl: c.imageUrl || null,
                remarks: c.remarks || null,
              })),
            }
          : undefined,
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        lender: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async findGirviById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyGirvi.findUnique({
      where: { id },
      include: {
        company: true,
        branch: true,
        customer: true,
        lender: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async findGirviByRefNumber(referenceNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyGirvi.findUnique({
      where: { referenceNumber },
      include: {
        company: true,
        branch: true,
        customer: true,
        lender: true,
        collaterals: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });
  }

  async findGirvis(params: ThirdPartyGirviQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      companyId,
      branchId,
      customerId,
      thirdPartyLenderId,
      status,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.ThirdPartyGirviWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (thirdPartyLenderId) where.thirdPartyLenderId = thirdPartyLenderId;
    if (status) where.status = status;

    if (fromDate || toDate) {
      where.loanDate = {};
      if (fromDate) where.loanDate.gte = new Date(fromDate);
      if (toDate) where.loanDate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { externalLoanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search, mode: 'insensitive' } } },
        { lender: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.thirdPartyGirvi.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: true,
          branch: true,
          customer: true,
          lender: true,
          collaterals: {
            include: {
              inventoryItem: true,
            },
          },
        },
      }),
      prisma.thirdPartyGirvi.count({ where }),
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

  async addCollateral(thirdPartyGirviId: string, collateral: CreateThirdPartyCollateralInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.thirdPartyGirviCollateral.create({
      data: {
        thirdPartyGirviId,
        inventoryItemId: collateral.inventoryItemId || null,
        itemName: collateral.itemName,
        metalType: collateral.metalType || 'GOLD',
        purity: collateral.purity || '22K',
        grossWeight: collateral.grossWeight,
        stoneWeight: collateral.stoneWeight ?? 0,
        netWeight: collateral.netWeight,
        valuedAmount: collateral.valuedAmount ?? 0,
        barcode: collateral.barcode || null,
        rfidEpc: collateral.rfidEpc || null,
        imageUrl: collateral.imageUrl || null,
        remarks: collateral.remarks || null,
      },
      include: {
        inventoryItem: true,
      },
    });
  }
}

export const thirdPartyGirviRepository = new ThirdPartyGirviRepository();
