import { prisma } from '../database';
import { Prisma, MetalType } from '../generated/prisma';

export interface CreateMetalRateData {
  companyId: string;
  metalType: MetalType;
  purity: string;
  marketRatePerGram?: number | Prisma.Decimal | null;
  ratePerGram: number | Prisma.Decimal;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateMetalRateData {
  ratePerGram?: number | Prisma.Decimal;
  effectiveTo?: Date | null;
  isActive?: boolean;
  updatedBy?: string | null;
}

export interface MetalRateQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  metalType?: MetalType | string;
  purity?: string;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'effectiveFrom' | 'effectiveTo' | 'ratePerGram' | 'metalType' | 'purity';
  sortOrder?: 'asc' | 'desc';
}

export class MetalRateRepository {
  private defaultInclude = {
    company: {
      select: {
        id: true,
        name: true,
        legalName: true,
        gstNumber: true,
      },
    },
  };

  async create(data: CreateMetalRateData, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.metalRate.create({
      data: {
        companyId: data.companyId,
        metalType: data.metalType,
        purity: data.purity,
        marketRatePerGram: data.marketRatePerGram ?? null,
        ratePerGram: data.ratePerGram,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy,
      },
      include: this.defaultInclude,
    });
  }

  async findById(id: string) {
    return prisma.metalRate.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  /**
   * Resolves active rate for company, metalType, and purity at specified timestamp
   */
  async findCurrentRate(
    companyId: string,
    metalType: MetalType,
    purity: string,
    timestamp: Date = new Date(),
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.metalRate.findFirst({
      where: {
        companyId,
        metalType,
        purity,
        isActive: true,
        effectiveFrom: { lte: timestamp },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: timestamp } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
      include: this.defaultInclude,
    });
  }

  /**
   * Checks if an active rate overlaps with proposed effectiveFrom / effectiveTo period
   */
  async findOverlappingRate(
    companyId: string,
    metalType: MetalType,
    purity: string,
    effectiveFrom: Date,
    effectiveTo?: Date | null,
    excludeId?: string
  ) {
    const whereClause: Prisma.MetalRateWhereInput = {
      companyId,
      metalType,
      purity,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        // Case 1: Proposed period starts during an existing open-ended or bounded rate
        {
          effectiveFrom: { lte: effectiveFrom },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
        },
        // Case 2: Proposed period ends after an existing rate starts
        ...(effectiveTo
          ? [
              {
                effectiveFrom: { lte: effectiveTo },
                OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveTo } }],
              },
              {
                effectiveFrom: { gte: effectiveFrom, lte: effectiveTo },
              },
            ]
          : [
              {
                effectiveFrom: { gte: effectiveFrom },
              },
            ]),
      ],
    };

    return prisma.metalRate.findFirst({
      where: whereClause,
      include: this.defaultInclude,
    });
  }

  async findAll(options: MetalRateQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MetalRateWhereInput = {};

    if (options.companyId) {
      where.companyId = options.companyId;
    }

    if (options.metalType) {
      where.metalType = options.metalType as MetalType;
    }

    if (options.purity) {
      where.purity = { equals: options.purity, mode: 'insensitive' };
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.dateFrom || options.dateTo) {
      where.effectiveFrom = {};
      if (options.dateFrom) {
        where.effectiveFrom.gte = options.dateFrom;
      }
      if (options.dateTo) {
        where.effectiveFrom.lte = options.dateTo;
      }
    }

    if (options.search) {
      const search = options.search.trim();
      where.OR = [
        { purity: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const sortBy = options.sortBy || 'effectiveFrom';
    const sortOrder = options.sortOrder || 'desc';

    const [total, data] = await Promise.all([
      prisma.metalRate.count({ where }),
      prisma.metalRate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.defaultInclude,
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

  async update(id: string, data: UpdateMetalRateData, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.metalRate.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async deactivate(id: string, updatedBy?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.metalRate.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: updatedBy || null,
      },
      include: this.defaultInclude,
    });
  }
}

export const metalRateRepository = new MetalRateRepository();
