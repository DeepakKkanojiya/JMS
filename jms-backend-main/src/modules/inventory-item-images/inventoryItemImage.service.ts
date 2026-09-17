import fs from 'fs';
import path from 'path';
import { inventoryItemImageRepository, InventoryItemImageRepository } from '../../repositories/inventoryItemImage.repository';
import { inventoryItemRepository } from '../../repositories/inventoryItem.repository';
import { NotFoundError, BadRequestError } from '../../errors';
import { prisma } from '../../database';
import { UpdateInventoryItemImagePayload } from './inventoryItemImage.types';

export class InventoryItemImageService {
  constructor(private repo: InventoryItemImageRepository = inventoryItemImageRepository) {}

  private formatImageResponse(img: any) {
    return {
      id: img.id,
      inventoryItemId: img.inventoryItemId,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl || img.imageUrl,
      altText: img.altText || null,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt,
    };
  }

  async uploadImage(inventoryItemId: string, file?: Express.Multer.File, body: any = {}) {
    if (!file) {
      throw new BadRequestError('No image file uploaded');
    }

    const item = await inventoryItemRepository.findById(inventoryItemId);
    if (!item) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new NotFoundError('Inventory item not found');
    }

    const relativeUrl = `/uploads/${file.filename}`;
    const imageCount = await this.repo.countByInventoryItemId(inventoryItemId);
    const requestedPrimary = body.isPrimary === true || body.isPrimary === 'true';
    const isPrimary = imageCount === 0 || requestedPrimary;

    return prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.inventoryItemImage.updateMany({
          where: { inventoryItemId },
          data: { isPrimary: false },
        });
      }

      const created = await tx.inventoryItemImage.create({
        data: {
          inventoryItemId,
          imageUrl: relativeUrl,
          thumbnailUrl: relativeUrl,
          altText: body.altText || null,
          isPrimary,
          sortOrder: body.sortOrder ? parseInt(body.sortOrder, 10) : 0,
        },
      });

      return this.formatImageResponse(created);
    });
  }

  async getImages(inventoryItemId: string) {
    const item = await inventoryItemRepository.findById(inventoryItemId);
    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }

    const images = await this.repo.findByInventoryItemId(inventoryItemId);
    return images.map((img) => this.formatImageResponse(img));
  }

  async updateImage(inventoryItemId: string, imageId: string, payload: UpdateInventoryItemImagePayload) {
    const item = await inventoryItemRepository.findById(inventoryItemId);
    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }

    const image = await this.repo.findById(imageId);
    if (!image || image.inventoryItemId !== inventoryItemId) {
      throw new NotFoundError('Inventory item image not found');
    }

    return prisma.$transaction(async (tx) => {
      if (payload.isPrimary === true) {
        await tx.inventoryItemImage.updateMany({
          where: { inventoryItemId, id: { not: imageId } },
          data: { isPrimary: false },
        });
      }

      const updated = await tx.inventoryItemImage.update({
        where: { id: imageId },
        data: {
          ...(payload.altText !== undefined ? { altText: payload.altText } : {}),
          ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
          ...(payload.isPrimary !== undefined ? { isPrimary: payload.isPrimary } : {}),
        },
      });

      return this.formatImageResponse(updated);
    });
  }

  async deleteImage(inventoryItemId: string, imageId: string) {
    const item = await inventoryItemRepository.findById(inventoryItemId);
    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }

    const image = await this.repo.findById(imageId);
    if (!image || image.inventoryItemId !== inventoryItemId) {
      throw new NotFoundError('Inventory item image not found');
    }

    const wasPrimary = image.isPrimary;

    await prisma.$transaction(async (tx) => {
      await tx.inventoryItemImage.delete({ where: { id: imageId } });

      if (wasPrimary) {
        const nextPrimary = await tx.inventoryItemImage.findFirst({
          where: { inventoryItemId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });

        if (nextPrimary) {
          await tx.inventoryItemImage.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    const filename = path.basename(image.imageUrl);
    const filePath = path.resolve(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`[WARN] Could not remove file ${filePath}:`, err);
      }
    }

    return { success: true, message: 'Inventory item image deleted successfully' };
  }
}

export const inventoryItemImageService = new InventoryItemImageService();
