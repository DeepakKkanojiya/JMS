import { z } from 'zod';

export const createProductSubCategorySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
  name: z.string().min(2, 'Sub-category name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Sub-category code must be at least 2 characters').max(50),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSubCategorySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  name: z.string().min(2, 'Sub-category name must be at least 2 characters').max(100).optional(),
  code: z.string().min(2, 'Sub-category code must be at least 2 characters').max(50).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const productSubCategoryParamSchema = z.object({
  id: z.string().uuid('Invalid product sub-category ID format'),
});

export const productSubCategoryQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  search: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional().or(z.literal('')),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
