import { z } from 'zod';

export const createTaxRateSchema = z.object({
  companyId: z.string().uuid({ message: 'Valid companyId UUID is required' }),
  taxName: z.string().min(1, { message: 'taxName is required' }),
  taxCode: z.string().min(1, { message: 'taxCode is required' }),
  rate: z.number().min(0, { message: 'rate must be non-negative (>= 0)' }),
  effectiveFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'effectiveFrom must be a valid ISO datetime' }),
  effectiveTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'effectiveTo must be a valid ISO datetime' }).optional().nullable(),
});

export const updateTaxRateSchema = z.object({
  taxName: z.string().optional(),
  rate: z.number().min(0, { message: 'rate must be non-negative (>= 0)' }).optional(),
  effectiveTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'effectiveTo must be a valid ISO datetime' }).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const taxRateParamSchema = z.object({
  id: z.string().uuid({ message: 'Valid tax rate ID is required' }),
});

export const taxRateQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  taxCode: z.string().optional(),
  isActive: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
