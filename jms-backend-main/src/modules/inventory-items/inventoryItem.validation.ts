import { z } from 'zod';

export const ALLOWED_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'TRANSFER_PENDING',
  'IN_TRANSIT',
  'UNDER_REPAIR',
  'ON_APPROVAL',
  'RETURNED',
  'LOST',
  'DAMAGED',
] as const;

export const createInventoryItemSchema = z
  .object({
    productId: z.string().uuid('Invalid Product ID format'),
    branchId: z.string().uuid('Invalid Branch ID format'),
    itemCode: z.string().trim().min(2, 'Item code must be at least 2 characters long'),
    grossWeight: z.coerce.number().gt(0, 'Gross weight must be a positive number greater than 0'),
    netWeight: z.coerce.number().gt(0, 'Net weight must be a positive number greater than 0'),
    stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional().default(0),
    purity: z.string().trim().min(1, 'Purity is required'),
    status: z.enum(ALLOWED_STATUSES).optional().default('AVAILABLE'),
    barcode: z.string().trim().optional(),
    qrCode: z.string().trim().optional(),
    rfidEpc: z.string().trim().nullable().optional(),
  })
  .refine((data) => data.grossWeight >= data.netWeight, {
    message: 'Gross weight must be greater than or equal to net weight',
    path: ['grossWeight'],
  });

export const updateInventoryItemSchema = z
  .object({
    branchId: z.string().uuid('Invalid Branch ID format').optional(),
    grossWeight: z.coerce.number().gt(0, 'Gross weight must be a positive number').optional(),
    netWeight: z.coerce.number().gt(0, 'Net weight must be a positive number').optional(),
    stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional(),
    purity: z.string().trim().min(1).optional(),
    status: z.enum(ALLOWED_STATUSES).optional(),
    barcode: z.string().trim().optional(),
    qrCode: z.string().trim().optional(),
    rfidEpc: z.string().trim().nullable().optional(),
    adjustmentReason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.grossWeight !== undefined && data.netWeight !== undefined) {
        return data.grossWeight >= data.netWeight;
      }
      return true;
    },
    {
      message: 'Gross weight must be greater than or equal to net weight',
      path: ['grossWeight'],
    }
  );

export const inventoryItemParamSchema = z.object({
  id: z.string().uuid('Invalid Inventory Item ID format'),
});

export const inventoryItemQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  productId: z.string().uuid('Invalid Product ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid Branch ID format').optional().or(z.literal('')),
  status: z.string().trim().optional(),
  purity: z.string().trim().optional(),
  metalType: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'itemCode', 'grossWeight', 'netWeight', 'purity', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
