import { prisma } from '../database';

export class ProductCategoryRepository {
  async create(data: {
    companyId: string;
    name: string;
    code: string;
    description?: string;
    isActive?: boolean;
  }) {
    return prisma.productCategory.create({
      data,
      include: { productSubCategories: true },
    });
  }

  async findById(id: string) {
    return prisma.productCategory.findUnique({
      where: { id },
      include: { productSubCategories: true },
    });
  }

  async findByCode(companyId: string, code: string) {
    return prisma.productCategory.findUnique({
      where: {
        companyId_code: { companyId, code },
      },
    });
  }

  async findByName(name: string) {
    return prisma.productCategory.findFirst({ where: { name } });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { code: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'name', 'code'];
    const sortBy = options?.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { productSubCategories: true },
      }),
      prisma.productCategory.count({ where }),
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
      name?: string;
      code?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.productCategory.update({
      where: { id },
      data,
      include: { productSubCategories: true },
    });
  }

  async delete(id: string) {
    return prisma.productCategory.delete({ where: { id } });
  }
}

export const productCategoryRepository = new ProductCategoryRepository();
