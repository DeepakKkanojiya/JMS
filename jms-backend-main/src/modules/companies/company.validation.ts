import { z } from 'zod';

export const createCompanySchema = z.object({
  companyCode: z.string().min(2, 'Company code must be at least 2 characters').max(50),
  name: z.string().min(2, 'Company name must be at least 2 characters').max(255),
  legalName: z.string().max(255).optional(),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GSTIN format')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid Indian PAN format')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(255).optional(),
  legalName: z.string().max(255).optional(),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GSTIN format')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid Indian PAN format')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const companyParamSchema = z.object({
  id: z.string().uuid('Invalid company ID format'),
});

export const companyQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
