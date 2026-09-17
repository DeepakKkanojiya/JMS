import { prisma } from '../database';

export class CompanyRepository {
  async create(data: {
    companyCode: string;
    name: string;
    legalName?: string;
    gstNumber?: string;
    panNumber?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string;
    isActive?: boolean;
  }) {
    return prisma.company.create({ data });
  }

  async findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: { branches: true },
    });
  }

  async findByGstNumber(gstNumber: string) {
    return prisma.company.findUnique({ where: { gstNumber } });
  }

  async findByPanNumber(panNumber: string) {
    return prisma.company.findUnique({ where: { panNumber } });
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { legalName: { contains: params.search, mode: 'insensitive' } },
        { gstNumber: { contains: params.search, mode: 'insensitive' } },
        { panNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'name', 'legalName', 'gstNumber', 'panNumber'];
    const sortBy = params?.sortBy && validSortFields.includes(params.sortBy) ? params.sortBy : 'createdAt';
    const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: { branches: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.company.count({ where }),
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

  async findByCode(companyCode: string) {
    return prisma.company.findUnique({ where: { companyCode } });
  }

  async update(
    id: string,
    data: {
      companyCode?: string;
      name?: string;
      legalName?: string;
      gstNumber?: string;
      panNumber?: string;
      email?: string;
      phone?: string;
      website?: string;
      logoUrl?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.company.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.company.delete({ where: { id } });
  }
}

export const companyRepository = new CompanyRepository();
