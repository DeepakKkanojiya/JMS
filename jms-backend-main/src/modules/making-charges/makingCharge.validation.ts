import { z } from 'zod';
import { MetalType, MakingChargeType } from '../../generated/prisma';

export const createMakingChargeSchema = z.object({
  companyId: z.string().uuid({ message: 'Valid companyId UUID is required' }),
  metalType: z.enum([MetalType.GOLD, MetalType.SILVER, MetalType.PLATINUM], {
    message: 'metalType must be GOLD, SILVER, or PLATINUM',
  }),
  purity: z.string().min(1, { message: 'purity is required' }),
  chargeType: z.enum([MakingChargeType.PER_GRAM, MakingChargeType.FIXED, MakingChargeType.PERCENTAGE], {
    message: 'chargeType must be PER_GRAM, FIXED, or PERCENTAGE',
  }),
  rate: z.number().min(0, { message: 'rate must be non-negative (>= 0)' }),
  effectiveFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'effectiveFrom must be a valid ISO datetime' }),
  effectiveTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'effectiveTo must be a valid ISO datetime' }).optional().nullable(),
});

export const updateMakingChargeSchema = z.object({
  rate: z.number().min(0, { message: 'rate must be non-negative (>= 0)' }).optional(),
  effectiveTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'effectiveTo must be a valid ISO datetime' }).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const makingChargeParamSchema = z.object({
  id: z.string().uuid({ message: 'Valid making charge ID is required' }),
});

export const makingChargeQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  metalType: z.enum([MetalType.GOLD, MetalType.SILVER, MetalType.PLATINUM]).optional(),
  purity: z.string().optional(),
  chargeType: z.enum([MakingChargeType.PER_GRAM, MakingChargeType.FIXED, MakingChargeType.PERCENTAGE]).optional(),
  isActive: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
