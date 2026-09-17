import { prisma } from '../database';

export interface CreateInventoryItemImageInput {
  inventoryItemId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface UpdateInventoryItemImageInput {
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export class InventoryItemImageRepository {
  async create(data: CreateInventoryItemImageInput) {
    return prisma.inventoryItemImage.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl || null,
        altText: data.altText || null,
        isPrimary: data.isPrimary ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async findById(id: string) {
    return prisma.inventoryItemImage.findUnique({
      where: { id },
      include: {
        inventoryItem: true,
      },
    });
  }

  async findByInventoryItemId(inventoryItemId: string) {
    return prisma.inventoryItemImage.findMany({
      where: { inventoryItemId },
      orderBy: [
        { isPrimary: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async update(id: string, data: UpdateInventoryItemImageInput) {
    return prisma.inventoryItemImage.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.inventoryItemImage.delete({
      where: { id },
    });
  }

  async countByInventoryItemId(inventoryItemId: string) {
    return prisma.inventoryItemImage.count({
      where: { inventoryItemId },
    });
  }

  async unsetOtherPrimary(inventoryItemId: string, excludeImageId?: string) {
    return prisma.inventoryItemImage.updateMany({
      where: {
        inventoryItemId,
        ...(excludeImageId ? { id: { not: excludeImageId } } : {}),
      },
      data: { isPrimary: false },
    });
  }

  async findNextPrimaryCandidate(inventoryItemId: string, excludeImageId: string) {
    return prisma.inventoryItemImage.findFirst({
      where: {
        inventoryItemId,
        id: { not: excludeImageId },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }
}

export const inventoryItemImageRepository = new InventoryItemImageRepository();
