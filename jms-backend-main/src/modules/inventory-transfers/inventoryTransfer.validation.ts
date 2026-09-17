import { z } from 'zod';

export const createTransferSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID format'),
  toBranchId: z.string().uuid('Invalid Destination Branch ID format'),
  fromBranchId: z.string().uuid('Invalid Source Branch ID format').optional(),
  remarks: z.string().trim().optional(),
});

export const rejectTransferSchema = z.object({
  rejectionReason: z.string().trim().min(2, 'Rejection reason must be at least 2 characters long'),
});

export const transferParamSchema = z.object({
  id: z.string().uuid('Invalid Transfer ID format'),
});

export const transferQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().trim().optional(),
  status: z
    .enum(['REQUESTED', 'APPROVED', 'REJECTED', 'DISPATCHED', 'RECEIVED', 'CANCELLED'])
    .optional(),
  fromBranchId: z.string().uuid('Invalid Source Branch ID format').optional().or(z.literal('')),
  toBranchId: z.string().uuid('Invalid Destination Branch ID format').optional().or(z.literal('')),
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID format').optional().or(z.literal('')),
  transferCode: z.string().trim().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'transferCode', 'status', 'dispatchedAt', 'receivedAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
