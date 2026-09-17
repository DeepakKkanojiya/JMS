import { prisma } from '../database';

export class ProductSubCategoryRepository {
  async create(data: {
    companyId: string;
    categoryId: string;
    name: string;
    code: string;
    description?: string;
    isActive?: boolean;
  }) {
    return prisma.productSubCategory.create({
      data,
      include: { category: true },
    });
  }

  async findById(id: string) {
    return prisma.productSubCategory.findUnique({
      where: { id },
      include: { category: true, products: true },
    });
  }

  async findByCode(companyId: string, code: string) {
    return prisma.productSubCategory.findUnique({
      where: {
        companyId_code: { companyId, code },
      },
    });
  }

  async findByCategoryId(categoryId: string) {
    return prisma.productSubCategory.findMany({
      where: { categoryId },
      include: { category: true, products: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

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
      prisma.productSubCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { category: true },
      }),
      prisma.productSubCategory.count({ where }),
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
      categoryId?: string;
      name?: string;
      code?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.productSubCategory.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return prisma.productSubCategory.delete({ where: { id } });
  }
}

export const productSubCategoryRepository = new ProductSubCategoryRepository();
