import { z } from 'zod';

export const ALLOWED_MOVEMENT_TYPES = [
  'STOCK_IN',
  'STOCK_OUT',
  'TRANSFER',
  'ADJUSTMENT',
  'SALE',
  'SALE_RETURN',
  'PURCHASE',
  'PURCHASE_RETURN',
  'REPAIR_OUT',
  'REPAIR_IN',
  'APPROVAL_OUT',
  'APPROVAL_RETURN',
] as const;

export const createStockMovementSchema = z
  .object({
    inventoryItemId: z.string().uuid('Invalid Inventory Item ID format'),
    fromBranchId: z.string().uuid('Invalid Source Branch ID format').nullable().optional(),
    toBranchId: z.string().uuid('Invalid Destination Branch ID format').nullable().optional(),
    movementType: z.enum(ALLOWED_MOVEMENT_TYPES),
    referenceType: z.string().trim().nullable().optional(),
    referenceId: z.string().trim().nullable().optional(),
    remarks: z.string().trim().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.movementType === 'TRANSFER') {
        if (!data.fromBranchId || !data.toBranchId) {
          return false;
        }
        return data.fromBranchId !== data.toBranchId;
      }
      return true;
    },
    {
      message: 'TRANSFER movement requires distinct fromBranchId and toBranchId',
      path: ['toBranchId'],
    }
  );

export const stockMovementParamSchema = z.object({
  id: z.string().uuid('Invalid Stock Movement ID format'),
});

export const stockMovementQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID format').optional().or(z.literal('')),
  fromBranchId: z.string().uuid('Invalid Source Branch ID format').optional().or(z.literal('')),
  toBranchId: z.string().uuid('Invalid Destination Branch ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid Branch ID format').optional().or(z.literal('')),
  movementType: z.string().trim().optional(),
  referenceType: z.string().trim().optional(),
  referenceId: z.string().trim().optional(),
  performedBy: z.string().uuid('Invalid PerformedBy User ID format').optional().or(z.literal('')),
  dateFrom: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  dateTo: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  sortBy: z.enum(['createdAt', 'movementType', 'referenceType', 'inventoryItemId']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
