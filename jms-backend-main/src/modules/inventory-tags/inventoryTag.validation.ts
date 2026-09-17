import { z } from 'zod';

export const createInventoryTagSchema = z.object({
  barcode: z.string().trim().min(2, 'Barcode must be at least 2 characters long').optional(),
  rfidEpc: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateInventoryTagSchema = z.object({
  barcode: z.string().trim().min(2, 'Barcode must be at least 2 characters long').optional(),
  rfidEpc: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateTagStatusSchema = z.object({
  isActive: z.boolean(),
});

export const inventoryTagParamSchema = z.object({
  id: z.string().uuid('Invalid Inventory Item ID format'),
});

export const inventoryTagBarcodeParamSchema = z.object({
  barcode: z.string().trim().min(1, 'Barcode parameter is required'),
});

export const inventoryTagQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  barcode: z.string().trim().optional(),
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid Branch ID format').optional().or(z.literal('')),
  sortBy: z.enum(['createdAt', 'updatedAt', 'taggedAt', 'barcode', 'isActive']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
