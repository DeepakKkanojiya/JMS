import { z } from 'zod';

export const inventoryItemImageParamSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID format'),
  imageId: z.string().uuid('Invalid Image ID format').optional(),
});

export const updateInventoryItemImageSchema = z.object({
  altText: z.string().max(255, 'Alt text must not exceed 255 characters').optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0, 'Sort order must be a non-negative integer').optional(),
});
