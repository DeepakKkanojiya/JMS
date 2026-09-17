import { prisma } from '../database';

export class CustomerRepository {
  async create(data: {
    companyId: string;
    branchId?: string | null;
    customerCode: string;
    firstName: string;
    lastName?: string;
    email?: string;
    mobile: string;
    panNumber?: string;
    aadharNumber?: string;
    gstNumber?: string;
    customerType?: string;
    openingCashBalance?: number;
    openingGoldBalanceGrams?: number;
    openingSilverBalanceGrams?: number;
    cashBalance?: number;
    goldBalanceGrams?: number;
    silverBalanceGrams?: number;
    isActive?: boolean;
  }) {
    return prisma.customer.create({
      data: data as any,
      include: { branch: true, customerAddresses: true, customerDocuments: true },
    });
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: { branch: true, customerAddresses: true, customerDocuments: true },
    });
  }

  async findByCode(companyId: string, customerCode: string) {
    return prisma.customer.findUnique({
      where: {
        companyId_customerCode: {
          companyId,
          customerCode,
        },
      },
    });
  }

  async findByMobile(mobile: string) {
    return prisma.customer.findUnique({ where: { mobile } });
  }

  async findByEmail(email: string) {
    return prisma.customer.findFirst({ where: { email } });
  }

  async findByGst(gstNumber: string) {
    return prisma.customer.findFirst({ where: { gstNumber } });
  }

  async findByPan(panNumber: string) {
    return prisma.customer.findFirst({ where: { panNumber } });
  }

  async findByBranchId(branchId: string) {
    return prisma.customer.findMany({
      where: { branchId },
      include: { customerAddresses: true, customerDocuments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchQuick(query: string, branchId?: string, limit: number = 10) {
    const where: any = {
      OR: [
        { mobile: { contains: query, mode: 'insensitive' } },
        { customerCode: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (branchId) {
      where.branchId = branchId;
    }
    return prisma.customer.findMany({
      where,
      take: limit,
      include: { branch: true, customerAddresses: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    branchId?: string;
    customerType?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.branchId) {
      where.branchId = params.branchId;
    }
    if (params?.companyId) {
      where.companyId = params.companyId;
    }
    if (params?.customerType) {
      where.customerType = params.customerType;
    }
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }
    if (params?.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { customerCode: { contains: params.search, mode: 'insensitive' } },
        { mobile: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { gstNumber: { contains: params.search, mode: 'insensitive' } },
        { panNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'customerCode', 'firstName', 'lastName'];
    const sortBy = params?.sortBy && validSortFields.includes(params.sortBy) ? params.sortBy : 'createdAt';
    const sortOrder = params?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: { branch: true, customerAddresses: true, customerDocuments: true },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.customer.count({ where }),
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
      branchId?: string | null;
      customerCode?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile?: string;
      panNumber?: string;
      aadharNumber?: string;
      gstNumber?: string;
      customerType?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.customer.update({
      where: { id },
      data,
      include: { branch: true, customerAddresses: true, customerDocuments: true },
    });
  }

  async delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  }

  async count(companyId: string) {
    return prisma.customer.count({ where: { companyId } });
  }
}

export const customerRepository = new CustomerRepository();
