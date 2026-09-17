import { z } from 'zod';

export const ALLOWED_METAL_TYPES = ['GOLD', 'SILVER', 'PLATINUM'] as const;

export const createMetalRateSchema = z
  .object({
    companyId: z.string().uuid('Invalid Company ID format'),
    metalType: z.enum(ALLOWED_METAL_TYPES, {
      message: 'Metal type must be one of: GOLD, SILVER, PLATINUM',
    }),
    purity: z.string().trim().min(1, 'Purity is required'),
    marketRatePerGram: z.coerce.number().gt(0).optional(),
    ratePerGram: z.coerce.number().gt(0, 'Rate per gram must be a positive number greater than 0'),
    effectiveFrom: z.string().datetime({ message: 'Invalid ISO date string for effectiveFrom' }),
    effectiveTo: z.string().datetime({ message: 'Invalid ISO date string for effectiveTo' }).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.effectiveTo) {
        return new Date(data.effectiveTo) > new Date(data.effectiveFrom);
      }
      return true;
    },
    {
      message: 'effectiveTo timestamp must be greater than effectiveFrom',
      path: ['effectiveTo'],
    }
  );

export const updateMetalRateSchema = z.object({
  marketRatePerGram: z.coerce.number().gt(0).optional(),
  ratePerGram: z.coerce.number().gt(0, 'Rate per gram must be a positive number').optional(),
  effectiveTo: z.string().datetime({ message: 'Invalid ISO date string for effectiveTo' }).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const metalRateParamSchema = z.object({
  id: z.string().uuid('Invalid Metal Rate ID format'),
});

export const currentMetalRateQuerySchema = z.object({
  companyId: z.string().uuid('Invalid Company ID format'),
  metalType: z.enum(ALLOWED_METAL_TYPES, {
    message: 'Metal type must be one of: GOLD, SILVER, PLATINUM',
  }),
  purity: z.string().trim().min(1, 'Purity is required'),
  at: z.string().datetime().optional(),
});

export const calculateMetalRateSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID format'),
  metalType: z.enum(ALLOWED_METAL_TYPES, {
    message: 'Metal type must be one of: GOLD, SILVER, PLATINUM',
  }),
  purity: z.string().trim().min(1, 'Purity is required'),
  netWeight: z.coerce.number().gt(0, 'Net weight must be a positive number greater than 0'),
  at: z.string().datetime().optional(),
});

export const metalRateQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  companyId: z.string().uuid('Invalid Company ID format').optional().or(z.literal('')),
  metalType: z.enum(ALLOWED_METAL_TYPES).optional().or(z.literal('')),
  purity: z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  dateFrom: z.string().optional().or(z.literal('')),
  dateTo: z.string().optional().or(z.literal('')),
  sortBy: z
    .enum(['createdAt', 'effectiveFrom', 'effectiveTo', 'ratePerGram', 'metalType', 'purity'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const lockMetalRateParamSchema = z.object({
  id: z.string().uuid('Invalid Sales Invoice ID format'),
});

export const syncLiveRatesSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID format'),
  markupPercent: z.coerce.number().min(-50).max(100).optional().default(0),
  flatMarkupPerGram: z.coerce.number().min(-1000).max(5000).optional().default(0),
});

export const bulkRateItemSchema = z.object({
  metalType: z.enum(ALLOWED_METAL_TYPES),
  purity: z.string().trim().min(1, 'Purity is required'),
  marketRatePerGram: z.coerce.number().gt(0).optional(),
  ratePerGram: z.coerce.number().gt(0, 'Rate per gram must be greater than 0'),
});

export const bulkUpdateRatesSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID format'),
  rates: z.array(bulkRateItemSchema).min(1, 'At least one rate is required for bulk update'),
});
