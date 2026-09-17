import { z } from 'zod';

export const createCustomerSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format'),
  customerCode: z.string().min(2, 'Customer code must be at least 2 characters').max(50).optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z
    .string()
    .regex(/^[0-9+]{10,15}$/, 'Invalid mobile phone number format (10-15 digits)'),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  aadharNumber: z
    .string()
    .regex(/^[0-9]{12}$/, 'Invalid Aadhar format (12 digits)')
    .optional()
    .or(z.literal('')),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GSTIN format (15 characters)'
    )
    .optional()
    .or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'VIP', 'CORPORATE']).optional(),
  openingCashBalance: z.number().optional(),
  openingGoldBalanceGrams: z.number().optional(),
  openingSilverBalanceGrams: z.number().optional(),
  cashBalance: z.number().optional(),
  goldBalanceGrams: z.number().optional(),
  silverBalanceGrams: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const updateCustomerSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format').optional(),
  customerCode: z.string().min(2, 'Customer code must be at least 2 characters').max(50).optional(),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z
    .string()
    .regex(/^[0-9+]{10,15}$/, 'Invalid mobile phone number format (10-15 digits)')
    .optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  aadharNumber: z
    .string()
    .regex(/^[0-9]{12}$/, 'Invalid Aadhar format (12 digits)')
    .optional()
    .or(z.literal('')),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GSTIN format (15 characters)'
    )
    .optional()
    .or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'VIP', 'CORPORATE']).optional(),
  openingCashBalance: z.number().optional(),
  openingGoldBalanceGrams: z.number().optional(),
  openingSilverBalanceGrams: z.number().optional(),
  cashBalance: z.number().optional(),
  goldBalanceGrams: z.number().optional(),
  silverBalanceGrams: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const customerParamSchema = z.object({
  id: z.string().uuid('Invalid customer ID format'),
});

export const customerQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  companyId: z.string().uuid('Invalid company ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid branch ID format').optional().or(z.literal('')),
  customerType: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const customerSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query parameter q is required'),
  branchId: z.string().uuid('Invalid branch ID format').optional().or(z.literal('')),
  limit: z.string().optional(),
});
