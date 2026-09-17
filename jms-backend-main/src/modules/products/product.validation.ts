import { z } from 'zod';

export const createProductSchema = z.object({
  subCategoryId: z.string().uuid('Invalid sub-category ID format'),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  metalType: z.string().max(50).optional(),
  purity: z.string().max(20).optional(),
  grossWeight: z.number().min(0, 'Gross weight cannot be negative').optional(),
  netWeight: z.number().min(0, 'Net weight cannot be negative').optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  subCategoryId: z.string().uuid('Invalid sub-category ID format').optional(),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50).optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100).optional(),
  description: z.string().max(500).optional(),
  metalType: z.string().max(50).optional(),
  purity: z.string().max(20).optional(),
  grossWeight: z.number().min(0, 'Gross weight cannot be negative').optional(),
  netWeight: z.number().min(0, 'Net weight cannot be negative').optional(),
  isActive: z.boolean().optional(),
});

export const productParamSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});

export const productQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  search: z.string().optional(),
  subCategoryId: z.string().uuid('Invalid sub-category ID format').optional().or(z.literal('')),
  categoryId: z.string().uuid('Invalid category ID format').optional().or(z.literal('')),
  metalType: z.string().optional(),
  purity: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
