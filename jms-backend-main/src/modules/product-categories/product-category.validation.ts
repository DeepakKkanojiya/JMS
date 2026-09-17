import { z } from 'zod';

export const createProductCategorySchema = z.object({
  companyId: z.string().uuid().optional(),
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Category code must be at least 2 characters').max(50),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const updateProductCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100).optional(),
  code: z.string().min(2, 'Category code must be at least 2 characters').max(50).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const productCategoryParamSchema = z.object({
  id: z.string().uuid('Invalid product category ID format'),
});

export const productCategoryQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
