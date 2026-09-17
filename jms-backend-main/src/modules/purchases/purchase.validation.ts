import { z } from 'zod';

export const ALLOWED_PURCHASE_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'RECEIVING',
  'COMPLETED',
  'CANCELLED',
] as const;

export const purchaseOrderItemSchema = z
  .object({
    id: z.string().uuid('Invalid line item ID format').optional(),
    productId: z.string().uuid('Invalid Product ID format').optional().nullable(),
    metalType: z.enum(['GOLD', 'SILVER', 'PLATINUM'], {
      message: 'Metal type must be GOLD, SILVER, or PLATINUM',
    }),
    purity: z.string().trim().min(1, 'Purity is required (e.g. 22K, 18K, 999)'),
    itemName: z.string().trim().min(1, 'Item name is required').max(200, 'Item name too long'),
    description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
    orderedQuantity: z.coerce.number().int().min(1, 'Ordered quantity must be at least 1').optional().default(1),
    grossWeight: z.coerce.number().gt(0, 'Gross weight must be greater than 0'),
    netWeight: z.coerce.number().gt(0, 'Net weight must be greater than 0'),
    stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional().default(0),
    expectedRate: z.coerce.number().min(0, 'Expected rate cannot be negative'),
    makingCharges: z.coerce.number().min(0, 'Making charges cannot be negative').optional().default(0),
    taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%').optional().default(0),
  })
  .refine((data) => data.netWeight <= data.grossWeight, {
    message: 'Net weight cannot exceed gross weight',
    path: ['netWeight'],
  })
  .refine((data) => (data.stoneWeight || 0) <= data.grossWeight, {
    message: 'Stone weight cannot exceed gross weight',
    path: ['stoneWeight'],
  });

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid('Invalid Vendor ID format'),
  branchId: z.string().uuid('Invalid Branch ID format'),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional().nullable(),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional().nullable(),
  termsConditions: z.string().trim().max(4000, 'Terms & conditions cannot exceed 4000 characters').optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one line item is required to create a purchase order'),
});

export const updatePurchaseOrderSchema = z.object({
  vendorId: z.string().uuid('Invalid Vendor ID format').optional(),
  branchId: z.string().uuid('Invalid Branch ID format').optional(),
  orderDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional(),
  expectedDeliveryDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional().nullable(),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional().nullable(),
  termsConditions: z.string().trim().max(4000, 'Terms & conditions cannot exceed 4000 characters').optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one line item is required').optional(),
});

export const cancelPurchaseOrderSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Cancellation reason cannot exceed 500 characters'),
});

export const purchaseOrderParamSchema = z.object({
  id: z.string().uuid('Invalid Purchase Order ID format'),
});

export const purchaseOrderQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  vendorId: z.string().uuid('Invalid Vendor ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid Branch ID format').optional().or(z.literal('')),
  companyId: z.string().uuid('Invalid Company ID format').optional().or(z.literal('')),
  status: z.enum(ALLOWED_PURCHASE_STATUSES).optional().or(z.literal('')),
  fromDate: z.string().optional().or(z.literal('')),
  toDate: z.string().optional().or(z.literal('')),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'purchaseOrderNumber', 'orderDate', 'grandTotal'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const purchaseReceiveItemSchema = z
  .object({
    purchaseOrderItemId: z.string().uuid('Invalid Purchase Order Item ID format'),
    receivedQuantity: z.coerce.number().int().min(1, 'Received quantity must be at least 1'),
    grossWeight: z.coerce.number().gt(0, 'Gross weight must be greater than 0'),
    netWeight: z.coerce.number().gt(0, 'Net weight must be greater than 0'),
    stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional().default(0),
    purchaseRate: z.coerce.number().min(0, 'Purchase rate cannot be negative'),
    makingCharges: z.coerce.number().min(0, 'Making charges cannot be negative').optional().default(0),
    taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%').optional().default(0),
  })
  .refine((data) => data.netWeight <= data.grossWeight, {
    message: 'Net weight cannot exceed gross weight',
    path: ['netWeight'],
  })
  .refine((data) => (data.stoneWeight || 0) <= data.grossWeight, {
    message: 'Stone weight cannot exceed gross weight',
    path: ['stoneWeight'],
  });

export const purchaseReceiveSchema = z.object({
  receivedDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional(),
  remarks: z.string().trim().max(1000, 'Remarks cannot exceed 1000 characters').optional().nullable(),
  items: z.array(purchaseReceiveItemSchema).min(1, 'At least one item is required to receive inventory'),
});

export const purchaseReceiptParamSchema = z.object({
  id: z.string().uuid('Invalid Purchase Order ID format'),
  receiptId: z.string().uuid('Invalid Purchase Receipt ID format').optional(),
});

export const purchaseReceiptQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  companyId: z.string().uuid('Invalid Company ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid Branch ID format').optional().or(z.literal('')),
  purchaseOrderId: z.string().uuid('Invalid Purchase Order ID format').optional().or(z.literal('')),
  sortBy: z.enum(['createdAt', 'updatedAt', 'purchaseReceiptNumber', 'receivedDate', 'grandTotal']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

