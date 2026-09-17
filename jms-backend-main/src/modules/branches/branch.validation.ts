import { z } from 'zod';

export const createBranchSchema = z.object({
  companyId: z.string().uuid('Invalid company ID format'),
  branchCode: z.string().min(2, 'Branch code must be at least 2 characters').max(50),
  name: z.string().min(2, 'Branch name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
  isMainBranch: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateBranchSchema = z.object({
  companyId: z.string().uuid('Invalid company ID format').optional(),
  branchCode: z.string().min(2, 'Branch code must be at least 2 characters').max(50).optional(),
  name: z.string().min(2, 'Branch name must be at least 2 characters').max(255).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
  isMainBranch: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const branchParamSchema = z.object({
  id: z.string().uuid('Invalid branch ID format'),
});

export const branchQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  companyId: z.string().uuid('Invalid company ID format').optional().or(z.literal('')),
  city: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
