import { prisma } from '../database';

export interface CreateProductImageInput {
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface UpdateProductImageInput {
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export class ProductImageRepository {
  async create(data: CreateProductImageInput) {
    return prisma.productImage.create({
      data: {
        productId: data.productId,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl || null,
        altText: data.altText || null,
        isPrimary: data.isPrimary ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async findById(id: string) {
    return prisma.productImage.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  async findByProductId(productId: string) {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [
        { isPrimary: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async update(id: string, data: UpdateProductImageInput) {
    return prisma.productImage.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.productImage.delete({
      where: { id },
    });
  }

  async countByProductId(productId: string) {
    return prisma.productImage.count({
      where: { productId },
    });
  }

  async unsetOtherPrimary(productId: string, excludeImageId?: string) {
    return prisma.productImage.updateMany({
      where: {
        productId,
        ...(excludeImageId ? { id: { not: excludeImageId } } : {}),
      },
      data: { isPrimary: false },
    });
  }

  async findNextPrimaryCandidate(productId: string, excludeImageId: string) {
    return prisma.productImage.findFirst({
      where: {
        productId,
        id: { not: excludeImageId },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }
}

export const productImageRepository = new ProductImageRepository();
