import { z } from 'zod';
import { SalesReturnStatus } from '../../generated/prisma';

export const createSalesReturnSchema = z.object({
  salesInvoiceId: z.string().uuid('Invalid Sales Invoice ID format'),
  reason: z.string().max(500).optional(),
  remarks: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        salesInvoiceItemId: z.string().uuid('Invalid Sales Invoice Item ID format'),
        inventoryItemId: z.string().uuid('Invalid Inventory Item ID format'),
        quantity: z.number().int().positive().default(1),
        deductionAmount: z.number().min(0, 'Deduction amount cannot be negative').default(0),
        reason: z.string().max(500).optional(),
        remarks: z.string().max(500).optional(),
      })
    )
    .min(1, 'At least one item must be specified for sales return'),
});

export const approveSalesReturnSchema = z.object({
  remarks: z.string().max(500).optional(),
});

export const processSalesReturnSchema = z.object({
  remarks: z.string().max(500).optional(),
});

export const cancelSalesReturnSchema = z.object({
  cancellationReason: z.string().min(3, 'Cancellation reason must be at least 3 characters long').max(500),
  remarks: z.string().max(500).optional(),
});

export const findSalesReturnsQuerySchema = z.object({
  search: z.string().optional(),
  returnNumber: z.string().optional(),
  customerId: z.string().uuid().optional(),
  salesInvoiceId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  status: z.nativeEnum(SalesReturnStatus).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'returnNumber', 'refundAmount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const salesReturnIdParamSchema = z.object({
  id: z.string().uuid('Invalid Sales Return ID format'),
});

export const invoiceIdParamSchema = z.object({
  invoiceId: z.string().uuid('Invalid Invoice ID format'),
});
