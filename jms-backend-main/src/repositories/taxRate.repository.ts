import { prisma } from '../database';
import { Prisma } from '../generated/prisma';

export interface CreateTaxRateData {
  companyId: string;
  taxName: string;
  taxCode: string;
  rate: number | Prisma.Decimal;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateTaxRateData {
  taxName?: string;
  rate?: number | Prisma.Decimal;
  effectiveTo?: Date | null;
  isActive?: boolean;
  updatedBy?: string | null;
}

export interface TaxRateQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  taxCode?: string;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TaxRateRepository {
  async create(data: CreateTaxRateData) {
    return prisma.taxRate.create({
      data: {
        companyId: data.companyId,
        taxName: data.taxName,
        taxCode: data.taxCode,
        rate: data.rate,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy ?? null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.taxRate.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
          },
        },
      },
    });
  }

  /**
   * Resolve current active tax rate for company and taxCode
   */
  async findCurrent(
    companyId: string,
    taxCode: string = 'GST_3',
    timestamp: Date = new Date()
  ) {
    return prisma.taxRate.findFirst({
      where: {
        companyId,
        taxCode: { equals: taxCode, mode: 'insensitive' },
        isActive: true,
        effectiveFrom: { lte: timestamp },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: timestamp } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
          },
        },
      },
    });
  }

  /**
   * Overlap Guard Query: Find overlapping active tax rates
   */
  async findOverlappingRate(
    companyId: string,
    taxCode: string,
    effectiveFrom: Date,
    effectiveTo?: Date | null,
    excludeId?: string
  ) {
    const where: Prisma.TaxRateWhereInput = {
      companyId,
      taxCode: { equals: taxCode, mode: 'insensitive' },
      isActive: true,
      id: excludeId ? { not: excludeId } : undefined,
    };

    if (effectiveTo) {
      where.AND = [
        { effectiveFrom: { lte: effectiveTo } },
        {
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: effectiveFrom } },
          ],
        },
      ];
    } else {
      where.OR = [
        { effectiveTo: null },
        { effectiveTo: { gte: effectiveFrom } },
      ];
    }

    return prisma.taxRate.findFirst({ where });
  }

  async findAll(options?: TaxRateQueryOptions) {
    const page = options?.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options?.limit ? Math.max(1, Number(options.limit)) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TaxRateWhereInput = {};

    if (options?.companyId) {
      where.companyId = options.companyId;
    }

    if (options?.taxCode) {
      where.taxCode = { contains: options.taxCode, mode: 'insensitive' };
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options?.dateFrom || options?.dateTo) {
      where.effectiveFrom = {};
      if (options.dateFrom) where.effectiveFrom.gte = options.dateFrom;
      if (options.dateTo) where.effectiveFrom.lte = options.dateTo;
    }

    if (options?.search) {
      where.OR = [
        { taxName: { contains: options.search, mode: 'insensitive' } },
        { taxCode: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'effectiveFrom', 'rate', 'taxName', 'taxCode'];
    const sortBy = options?.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'effectiveFrom';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      prisma.taxRate.count({ where }),
      prisma.taxRate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              gstNumber: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findHistory(companyId?: string, taxCode?: string) {
    const where: Prisma.TaxRateWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (taxCode) where.taxCode = { equals: taxCode, mode: 'insensitive' };

    return prisma.taxRate.findMany({
      where,
      orderBy: { effectiveFrom: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTaxRateData) {
    return prisma.taxRate.update({
      where: { id },
      data: {
        taxName: data.taxName !== undefined ? data.taxName : undefined,
        rate: data.rate !== undefined ? data.rate : undefined,
        effectiveTo: data.effectiveTo !== undefined ? data.effectiveTo : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        updatedBy: data.updatedBy ?? null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            gstNumber: true,
          },
        },
      },
    });
  }

  async deactivate(id: string, updatedBy?: string) {
    return prisma.taxRate.update({
      where: { id },
      data: {
        isActive: false,
        effectiveTo: new Date(),
        updatedBy: updatedBy ?? null,
      },
    });
  }
}

export const taxRateRepository = new TaxRateRepository();
