import fs from 'fs';
import path from 'path';
import { productImageRepository, ProductImageRepository } from '../../repositories/productImage.repository';
import { productRepository } from '../../repositories/product.repository';
import { NotFoundError, BadRequestError } from '../../errors';
import { prisma } from '../../database';
import { UpdateProductImagePayload } from './productImage.types';

export class ProductImageService {
  constructor(private repo: ProductImageRepository = productImageRepository) {}

  private formatImageResponse(img: any) {
    return {
      id: img.id,
      productId: img.productId,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl || img.imageUrl,
      altText: img.altText || null,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt,
    };
  }

  async uploadImage(productId: string, file?: Express.Multer.File, body: any = {}) {
    if (!file) {
      throw new BadRequestError('No image file uploaded');
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      // Clean up uploaded file if parent doesn't exist
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new NotFoundError('Product not found');
    }

    const relativeUrl = `/uploads/${file.filename}`;
    const imageCount = await this.repo.countByProductId(productId);
    const requestedPrimary = body.isPrimary === true || body.isPrimary === 'true';
    const isPrimary = imageCount === 0 || requestedPrimary;

    return prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      const created = await tx.productImage.create({
        data: {
          productId,
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

  async getImages(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const images = await this.repo.findByProductId(productId);
    return images.map((img) => this.formatImageResponse(img));
  }

  async updateImage(productId: string, imageId: string, payload: UpdateProductImagePayload) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const image = await this.repo.findById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundError('Product image not found');
    }

    return prisma.$transaction(async (tx) => {
      if (payload.isPrimary === true) {
        await tx.productImage.updateMany({
          where: { productId, id: { not: imageId } },
          data: { isPrimary: false },
        });
      }

      const updated = await tx.productImage.update({
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

  async deleteImage(productId: string, imageId: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const image = await this.repo.findById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundError('Product image not found');
    }

    const wasPrimary = image.isPrimary;

    await prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: imageId } });

      if (wasPrimary) {
        const nextPrimary = await tx.productImage.findFirst({
          where: { productId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });

        if (nextPrimary) {
          await tx.productImage.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    // Safely delete physical file from disk storage
    const filename = path.basename(image.imageUrl);
    const filePath = path.resolve(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`[WARN] Could not remove file ${filePath}:`, err);
      }
    }

    return { success: true, message: 'Product image deleted successfully' };
  }
}

export const productImageService = new ProductImageService();
