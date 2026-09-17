import { prisma } from '../database';
import { Prisma } from '../generated/prisma';

export class ProductRepository {
  async create(data: {
    companyId: string;
    subCategoryId: string;
    sku: string;
    name: string;
    description?: string;
    metalType?: string;
    purity?: string;
    grossWeight?: number | Prisma.Decimal;
    netWeight?: number | Prisma.Decimal;
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data,
      include: {
        subCategory: { include: { category: true } },
        images: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        subCategory: { include: { category: true } },
        images: true,
      },
    });
  }

  async findBySku(companyId: string, sku: string) {
    return prisma.product.findUnique({
      where: {
        companyId_sku: { companyId, sku },
      },
      include: {
        subCategory: { include: { category: true } },
        images: true,
      },
    });
  }

  async findBySubCategoryId(subCategoryId: string) {
    return prisma.product.findMany({
      where: { subCategoryId },
      include: {
        subCategory: { include: { category: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    subCategoryId?: string;
    categoryId?: string;
    metalType?: string;
    purity?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.subCategoryId) {
      where.subCategoryId = options.subCategoryId;
    }

    if (options?.categoryId) {
      where.subCategory = { categoryId: options.categoryId };
    }

    if (options?.metalType) {
      where.metalType = { contains: options.metalType, mode: 'insensitive' };
    }

    if (options?.purity) {
      where.purity = { contains: options.purity, mode: 'insensitive' };
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { sku: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'sku', 'name', 'grossWeight', 'netWeight'];
    const sortBy = options?.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          subCategory: { include: { category: true } },
          images: true,
        },
      }),
      prisma.product.count({ where }),
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
      subCategoryId?: string;
      sku?: string;
      name?: string;
      description?: string;
      metalType?: string;
      purity?: string;
      grossWeight?: number | Prisma.Decimal;
      netWeight?: number | Prisma.Decimal;
      isActive?: boolean;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        subCategory: { include: { category: true } },
        images: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}

export const productRepository = new ProductRepository();
