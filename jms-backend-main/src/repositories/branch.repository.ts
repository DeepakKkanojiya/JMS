import { prisma } from '../database';

export class BranchRepository {
  async create(data: {
    companyId: string;
    branchCode: string;
    name: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isMainBranch?: boolean;
    isActive?: boolean;
  }) {
    return prisma.branch.create({ data });
  }

  async findById(id: string) {
    return prisma.branch.findUnique({
      where: { id },
      include: { company: true, employees: true, customers: true, vendors: true },
    });
  }

  async findByCode(companyId: string, branchCode: string) {
    return prisma.branch.findUnique({
      where: {
        companyId_branchCode: {
          companyId,
          branchCode,
        },
      },
    });
  }

  async findByCompanyId(companyId: string) {
    return prisma.branch.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    city?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.companyId) {
      where.companyId = params.companyId;
    }
    if (params?.city) {
      where.city = { contains: params.city, mode: 'insensitive' };
    }
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { branchCode: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
        { state: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'name', 'branchCode', 'city'];
    const sortBy = params?.sortBy && validSortFields.includes(params.sortBy) ? params.sortBy : 'createdAt';
    const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        include: { company: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.branch.count({ where }),
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

  async update(
    id: string,
    data: {
      companyId?: string;
      branchCode?: string;
      name?: string;
      email?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isMainBranch?: boolean;
      isActive?: boolean;
    }
  ) {
    return prisma.branch.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.branch.delete({ where: { id } });
  }
}

export const branchRepository = new BranchRepository();
