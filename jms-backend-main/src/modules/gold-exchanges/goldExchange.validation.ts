import { z } from 'zod';
import { MetalType, ExchangeStatus } from '../../generated/prisma';

export const goldExchangeItemSchema = z
  .object({
    metalType: z.nativeEnum(MetalType, {
      message: 'Invalid metal type',
    }),
    purity: z.string({ message: 'Purity is required' }).min(1, 'Purity cannot be empty'),
    grossWeight: z
      .number({ message: 'Gross weight is required' })
      .gt(0, 'Gross weight must be greater than 0'),
    stoneWeight: z
      .number()
      .gte(0, 'Stone weight cannot be negative')
      .default(0),
    deductionPercent: z
      .number()
      .gte(0, 'Deduction percent cannot be negative')
      .lte(100, 'Deduction percent cannot exceed 100%')
      .default(0),
    remarks: z.string().optional(),
  })
  .refine((data) => data.stoneWeight <= data.grossWeight, {
    message: 'Stone weight cannot be greater than gross weight',
    path: ['stoneWeight'],
  });

export const createGoldExchangeSchema = z.object({
  customerId: z.string().uuid('Invalid customer UUID').optional(),
  remarks: z.string().optional(),
  items: z
    .array(goldExchangeItemSchema)
    .min(1, 'At least one exchange item is required'),
});

export const goldExchangeIdParamSchema = z.object({
  id: z.string().uuid('Invalid gold exchange UUID'),
});

export const invoiceIdParamSchema = z.object({
  invoiceId: z.string().uuid('Invalid sales invoice UUID'),
});

export const findGoldExchangesQuerySchema = z.object({
  search: z.string().optional(),
  exchangeNumber: z.string().optional(),
  customerId: z.string().uuid('Invalid customer UUID').optional(),
  salesInvoiceId: z.string().uuid('Invalid sales invoice UUID').optional(),
  branchId: z.string().uuid('Invalid branch UUID').optional(),
  status: z.nativeEnum(ExchangeStatus).optional(),
  metalType: z.nativeEnum(MetalType).optional(),
  purity: z.string().optional(),
  dateFrom: z.string().datetime({ message: 'dateFrom must be an ISO date string' }).optional(),
  dateTo: z.string().datetime({ message: 'dateTo must be an ISO date string' }).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
