import { z } from 'zod';
import { PurchaseBillStatus } from '../../generated/prisma';

export const purchaseBillItemSchema = z
  .object({
    purchaseOrderItemId: z.string().uuid('Invalid Purchase Order Item ID').optional().nullable(),
    purchaseReceiptItemId: z.string().uuid('Invalid Purchase Receipt Item ID').optional().nullable(),
    inventoryItemId: z.string().uuid('Invalid Inventory Item ID').optional().nullable(),
    itemName: z.string().trim().min(1, 'Item name is required'),
    description: z.string().optional().nullable(),
    quantity: z.coerce.number().int().gt(0, 'Quantity must be greater than 0').default(1),
    grossWeight: z.coerce.number().min(0, 'Gross weight cannot be negative').optional().default(0),
    stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional().default(0),
    netWeight: z.coerce.number().min(0, 'Net weight cannot be negative').optional().default(0),
    purchaseRate: z.coerce.number().min(0, 'Purchase rate cannot be negative').optional().default(0),
    makingCharges: z.coerce.number().min(0, 'Making charges cannot be negative').optional().default(0),
    discountAmount: z.coerce.number().min(0, 'Discount amount cannot be negative').optional().default(0),
    taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').optional().default(0),
  })
  .refine((data) => data.netWeight <= data.grossWeight, {
    message: 'Net weight cannot exceed gross weight',
    path: ['netWeight'],
  });

export const createPurchaseBillSchema = z.object({
  purchaseOrderId: z.string().uuid('Invalid Purchase Order ID'),
  vendorId: z.string().uuid('Invalid Vendor ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  billDate: z.string().datetime({ message: 'Invalid bill date format' }).optional(),
  dueDate: z.string().datetime({ message: 'Invalid due date format' }).optional().nullable(),
  discountAmount: z.coerce.number().min(0, 'Header discount cannot be negative').optional().default(0),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseBillItemSchema).min(1, 'At least one line item is required'),
});

export const updatePurchaseBillSchema = z.object({
  dueDate: z.string().datetime({ message: 'Invalid due date format' }).optional().nullable(),
  discountAmount: z.coerce.number().min(0, 'Header discount cannot be negative').optional(),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseBillItemSchema).min(1, 'At least one line item is required').optional(),
});

export const cancelPurchaseBillSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const purchaseBillParamSchema = z.object({
  id: z.string().uuid('Invalid Purchase Bill ID'),
});

export const purchaseBillQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  vendorId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  status: z.nativeEnum(PurchaseBillStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
