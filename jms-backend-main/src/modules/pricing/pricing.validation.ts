import { z } from 'zod';
import { MakingChargeType } from '../../generated/prisma';

export const calculatePricingBodySchema = z.object({
  taxType: z.enum(['INTRA_STATE', 'INTER_STATE']).optional().default('INTRA_STATE'),
  wastagePercent: z.number().min(0).max(100, { message: 'wastagePercent must be between 0 and 100' }).optional(),
  makingChargeType: z.enum([MakingChargeType.PER_GRAM, MakingChargeType.FIXED, MakingChargeType.PERCENTAGE]).optional(),
  makingChargeRate: z.number().min(0, { message: 'makingChargeRate must be non-negative' }).optional(),
  taxRate: z.number().min(0, { message: 'taxRate must be non-negative' }).optional(),
});

export const invoiceParamSchema = z.object({
  id: z.string().uuid({ message: 'Valid invoice ID is required' }),
});
