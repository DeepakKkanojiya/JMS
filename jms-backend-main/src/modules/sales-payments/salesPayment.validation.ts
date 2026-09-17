import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '../../generated/prisma';

export const createSalesPaymentSchema = z.object({
  salesInvoiceId: z.string().uuid({ message: 'Valid salesInvoiceId UUID is required' }),
  paymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.CARD,
    PaymentMethod.UPI,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CHEQUE,
  ], {
    message: 'paymentMethod must be CASH, CARD, UPI, BANK_TRANSFER, or CHEQUE',
  }),
  amount: z.number().positive({ message: 'payment amount must be greater than 0' }),
  transactionReference: z.string().trim().max(100).optional().nullable(),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'paymentDate must be a valid ISO datetime' }).optional(),
  remarks: z.string().trim().max(500).optional().nullable(),
});

export const reverseSalesPaymentSchema = z.object({
  reversalReason: z.string().trim().min(1, { message: 'reversalReason is required' }).max(500),
});

export const salesPaymentParamSchema = z.object({
  id: z.string().uuid({ message: 'Valid payment ID UUID is required' }),
});

export const salesInvoiceParamSchema = z.object({
  id: z.string().uuid({ message: 'Valid sales invoice ID UUID is required' }),
});

export const salesPaymentQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  salesInvoiceId: z.string().uuid().optional(),
  paymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.CARD,
    PaymentMethod.UPI,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.CHEQUE,
  ]).optional(),
  status: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.COMPLETED,
    PaymentStatus.FAILED,
    PaymentStatus.REVERSED,
  ]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'paymentDate', 'amount', 'paymentNumber']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
