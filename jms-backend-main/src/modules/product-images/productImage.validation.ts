import { z } from 'zod';

export const productImageParamSchema = z.object({
  productId: z.string().uuid('Invalid Product ID format'),
  imageId: z.string().uuid('Invalid Image ID format').optional(),
});

export const updateProductImageSchema = z.object({
  altText: z.string().max(255, 'Alt text must not exceed 255 characters').optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be a non-negative integer').optional(),
});

export const uploadProductImageMetadataSchema = z.object({
  altText: z.string().max(255).optional(),
  isPrimary: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  sortOrder: z.coerce.number().int().optional(),
});
