import { z } from 'zod';
import { JobWorkOrderStatus, JobWorkItemType } from '../../generated/prisma';

export const createJobWorkOrderSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  vendorId: z.string().uuid('Invalid Vendor ID'),
  targetItemName: z.string().min(1, 'Target item name is required'),
  metalType: z.string().optional(),
  purity: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  agreedWastagePercent: z.coerce.number().min(0, 'Agreed wastage percent cannot be negative').optional(),
  agreedMakingChargePerGram: z.coerce.number().min(0, 'Agreed making charge cannot be negative').optional(),
  notes: z.string().optional().nullable(),
});

export const updateJobWorkOrderSchema = z.object({
  targetItemName: z.string().min(1).optional(),
  metalType: z.string().optional(),
  purity: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  agreedWastagePercent: z.coerce.number().min(0).optional(),
  agreedMakingChargePerGram: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
});

export const issueMaterialSchema = z.object({
  itemType: z.nativeEnum(JobWorkItemType).optional(),
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID').optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  grossWeight: z.coerce.number().gt(0, 'Gross weight must be greater than 0'),
  stoneWeight: z.coerce.number().min(0).optional(),
  netWeight: z.coerce.number().gt(0, 'Net weight must be greater than 0'),
  purity: z.string().min(1, 'Purity is required'),
  fineWeight: z.coerce.number().gt(0, 'Fine weight must be greater than 0'),
});

export const receiveJobWorkSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  grossWeight: z.coerce.number().gt(0, 'Gross weight must be greater than 0'),
  stoneWeight: z.coerce.number().min(0).optional(),
  netWeight: z.coerce.number().gt(0, 'Net weight must be greater than 0'),
  purity: z.string().min(1, 'Purity is required'),
  fineWeight: z.coerce.number().gt(0, 'Fine weight must be greater than 0'),
  actualWastageWeight: z.coerce.number().min(0).optional(),
  makingCharges: z.coerce.number().min(0).optional(),
  remarks: z.string().optional().nullable(),
  createInventoryItem: z.boolean().optional(),
  productId: z.string().uuid('Invalid Product ID').optional(),
});

export const cancelJobWorkOrderSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const jobWorkOrderParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const jobWorkOrderQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  status: z.nativeEnum(JobWorkOrderStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
