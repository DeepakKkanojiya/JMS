import { prisma } from '../database';

export class VendorRepository {
  async create(data: {
    companyId: string;
    branchId?: string;
    vendorCode: string;
    companyName: string;
    contactPerson?: string;
    email?: string;
    mobile: string;
    gstNumber?: string;
    panNumber?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    vendorType?: string;
    isActive?: boolean;
  }) {
    return prisma.vendor.create({
      data,
      include: { branch: true },
    });
  }

  async findById(id: string) {
    return prisma.vendor.findUnique({
      where: { id },
      include: { branch: true },
    });
  }

  async findByCode(companyId: string, vendorCode: string) {
    return prisma.vendor.findUnique({
      where: {
        companyId_vendorCode: { companyId, vendorCode },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.vendor.findFirst({ where: { email } });
  }

  async findByGstNumber(gstNumber: string) {
    return prisma.vendor.findUnique({ where: { gstNumber } });
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    branchId?: string;
    gstNumber?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.branchId) {
      where.branchId = options.branchId;
    }

    if (options.gstNumber) {
      where.gstNumber = { contains: options.gstNumber, mode: 'insensitive' };
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.search) {
      where.OR = [
        { companyName: { contains: options.search, mode: 'insensitive' } },
        { vendorCode: { contains: options.search, mode: 'insensitive' } },
        { contactPerson: { contains: options.search, mode: 'insensitive' } },
        { mobile: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { gstNumber: { contains: options.search, mode: 'insensitive' } },
        { panNumber: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'vendorCode', 'companyName', 'contactPerson'];
    const sortBy = options.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { branch: true },
      }),
      prisma.vendor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async update(
    id: string,
    data: {
      branchId?: string;
      companyName?: string;
      contactPerson?: string;
      email?: string;
      mobile?: string;
      gstNumber?: string;
      panNumber?: string;
      addressLine1?: string;
      city?: string;
      state?: string;
      pincode?: string;
      vendorType?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.vendor.update({
      where: { id },
      data,
      include: { branch: true },
    });
  }

  async delete(id: string) {
    return prisma.vendor.delete({ where: { id } });
  }
}

export const vendorRepository = new VendorRepository();
