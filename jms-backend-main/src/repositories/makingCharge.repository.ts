import { prisma } from '../database';
import { Prisma, MetalType, MakingChargeType } from '../generated/prisma';

export interface CreateMakingChargeData {
  companyId: string;
  metalType: MetalType;
  purity: string;
  chargeType: MakingChargeType;
  rate: number | Prisma.Decimal;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateMakingChargeData {
  rate?: number | Prisma.Decimal;
  effectiveTo?: Date | null;
  isActive?: boolean;
  updatedBy?: string | null;
}

export interface MakingChargeQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  metalType?: MetalType;
  purity?: string;
  chargeType?: MakingChargeType;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class MakingChargeRepository {
  async create(data: CreateMakingChargeData) {
    return prisma.makingCharge.create({
      data: {
        companyId: data.companyId,
        metalType: data.metalType,
        purity: data.purity,
        chargeType: data.chargeType,
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
    return prisma.makingCharge.findUnique({
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
   * Resolve current active making charge for company, metalType, and purity
   */
  async findCurrent(
    companyId: string,
    metalType: MetalType,
    purity: string,
    timestamp: Date = new Date()
  ) {
    return prisma.makingCharge.findFirst({
      where: {
        companyId,
        metalType,
        purity: { equals: purity, mode: 'insensitive' },
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
   * Overlap Guard Query: Find overlapping active making charges
   */
  async findOverlappingRate(
    companyId: string,
    metalType: MetalType,
    purity: string,
    effectiveFrom: Date,
    effectiveTo?: Date | null,
    excludeId?: string
  ) {
    const where: Prisma.MakingChargeWhereInput = {
      companyId,
      metalType,
      purity: { equals: purity, mode: 'insensitive' },
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

    return prisma.makingCharge.findFirst({ where });
  }

  async findAll(options?: MakingChargeQueryOptions) {
    const page = options?.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options?.limit ? Math.max(1, Number(options.limit)) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MakingChargeWhereInput = {};

    if (options?.companyId) {
      where.companyId = options.companyId;
    }

    if (options?.metalType) {
      where.metalType = options.metalType;
    }

    if (options?.purity) {
      where.purity = { contains: options.purity, mode: 'insensitive' };
    }

    if (options?.chargeType) {
      where.chargeType = options.chargeType;
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
        { purity: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'effectiveFrom', 'rate', 'metalType', 'purity'];
    const sortBy = options?.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'effectiveFrom';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      prisma.makingCharge.count({ where }),
      prisma.makingCharge.findMany({
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

  async findHistory(companyId?: string, metalType?: MetalType, purity?: string) {
    const where: Prisma.MakingChargeWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (metalType) where.metalType = metalType;
    if (purity) where.purity = { equals: purity, mode: 'insensitive' };

    return prisma.makingCharge.findMany({
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

  async update(id: string, data: UpdateMakingChargeData) {
    return prisma.makingCharge.update({
      where: { id },
      data: {
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
    return prisma.makingCharge.update({
      where: { id },
      data: {
        isActive: false,
        effectiveTo: new Date(),
        updatedBy: updatedBy ?? null,
      },
    });
  }
}

export const makingChargeRepository = new MakingChargeRepository();
