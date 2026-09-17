import { z } from 'zod';

export const ALLOWED_INVOICE_STATUSES = ['DRAFT', 'CONFIRMED', 'CANCELLED'] as const;

export const salesInvoiceItemSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID format'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').optional().default(1),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
  discountAmount: z.coerce.number().min(0, 'Discount amount cannot be negative').optional().default(0),
  taxAmount: z.coerce.number().min(0, 'Tax amount cannot be negative').optional().default(0),
});

export const createSalesInvoiceSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID format'),
  branchId: z.string().uuid('Invalid Branch ID format'),
  salespersonId: z.string().uuid('Invalid Salesperson Employee ID format').optional().nullable(),
  invoiceDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional(),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  items: z
    .array(salesInvoiceItemSchema)
    .min(1, 'At least one line item is required to create a sales invoice'),
});

export const updateSalesInvoiceSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID format').optional(),
  branchId: z.string().uuid('Invalid Branch ID format').optional(),
  salespersonId: z.string().uuid('Invalid Salesperson Employee ID format').optional().nullable(),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  items: z.array(salesInvoiceItemSchema).min(1, 'At least one line item is required').optional(),
});

export const salesInvoiceParamSchema = z.object({
  id: z.string().uuid('Invalid Sales Invoice ID format'),
});

export const salesInvoiceQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  branchId: z.string().uuid('Invalid Branch ID format').optional().or(z.literal('')),
  customerId: z.string().uuid('Invalid Customer ID format').optional().or(z.literal('')),
  salespersonId: z.string().uuid('Invalid Salesperson ID format').optional().or(z.literal('')),
  status: z.enum(ALLOWED_INVOICE_STATUSES).optional().or(z.literal('')),
  fromDate: z.string().optional().or(z.literal('')),
  toDate: z.string().optional().or(z.literal('')),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'invoiceNumber', 'invoiceDate', 'grandTotal'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
