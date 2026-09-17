import { z } from 'zod';
import { PurchaseReturnStatus, DebitNoteStatus } from '../../generated/prisma';

export const createPurchaseReturnItemSchema = z.object({
  purchaseBillItemId: z.string().uuid('Invalid Purchase Bill Item ID').optional().nullable(),
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID').optional().nullable(),
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional().nullable(),
  quantity: z.coerce.number().int().gt(0, 'Quantity must be greater than 0'),
  grossWeight: z.coerce.number().min(0, 'Gross weight cannot be negative'),
  stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional(),
  netWeight: z.coerce.number().gt(0, 'Net weight must be greater than 0'),
  purchaseRate: z.coerce.number().gt(0, 'Purchase rate must be greater than 0'),
  makingCharges: z.coerce.number().min(0, 'Making charges cannot be negative').optional(),
  taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').optional(),
});

export const createPurchaseReturnSchema = z.object({
  purchaseBillId: z.string().uuid('Invalid Purchase Bill ID').optional().nullable(),
  purchaseOrderId: z.string().uuid('Invalid Purchase Order ID').optional().nullable(),
  vendorId: z.string().uuid('Invalid Vendor ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  reason: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(createPurchaseReturnItemSchema).min(1, 'At least one return line item is required'),
});

export const updatePurchaseReturnSchema = z.object({
  reason: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const cancelPurchaseReturnSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const purchaseReturnParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const purchaseReturnQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  vendorId: z.string().uuid().optional(),
  purchaseBillId: z.string().uuid().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  status: z.nativeEnum(PurchaseReturnStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const debitNoteQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  vendorId: z.string().uuid().optional(),
  purchaseBillId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  status: z.nativeEnum(DebitNoteStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
