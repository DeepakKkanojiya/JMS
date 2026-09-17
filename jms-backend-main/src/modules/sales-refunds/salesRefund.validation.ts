import { z } from 'zod';
import { PaymentMethod, RefundStatus } from '../../generated/prisma';

export const createSalesRefundSchema = z.object({
  salesReturnId: z.string().uuid('Invalid Sales Return ID format'),
  refundMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().positive('Refund amount must be greater than 0'),
  transactionReference: z.string().max(100).optional(),
  remarks: z.string().max(500).optional(),
});

export const reverseSalesRefundSchema = z.object({
  reversalReason: z.string().min(3, 'Reversal reason must be at least 3 characters long').max(500),
});

export const findSalesRefundsQuerySchema = z.object({
  search: z.string().optional(),
  refundNumber: z.string().optional(),
  salesReturnId: z.string().uuid().optional(),
  refundMethod: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(RefundStatus).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'refundNumber', 'amount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const salesRefundIdParamSchema = z.object({
  id: z.string().uuid('Invalid Sales Refund ID format'),
});

export const salesReturnIdParamSchema = z.object({
  id: z.string().uuid('Invalid Sales Return ID format'),
});
