import { z } from 'zod';
import { ApprovalStatus, PaymentMethod, PaymentStatus } from '../../generated/prisma';

export const createApprovalItemSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative').optional(),
  notes: z.string().optional().nullable(),
});

export const createApprovalSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  customerId: z.string().uuid('Invalid Customer ID'),
  salespersonId: z.string().uuid('Invalid Salesperson ID').optional().nullable(),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional().nullable(),
  requiredDepositAmount: z.coerce.number().min(0, 'Required deposit amount cannot be negative').optional().default(0),
  items: z.array(createApprovalItemSchema).min(1, 'At least one approval item is required'),
});

export const updateApprovalSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID').optional(),
  salespersonId: z.string().uuid('Invalid Salesperson ID').optional().nullable(),
  dueDate: z.string().optional(),
  notes: z.string().optional().nullable(),
  requiredDepositAmount: z.coerce.number().min(0, 'Required deposit amount cannot be negative').optional(),
  items: z.array(createApprovalItemSchema).optional(),
});

export const approvalParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const approvalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  salespersonId: z.string().uuid().optional(),
  status: z.nativeEnum(ApprovalStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createApprovalDepositSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.coerce.number().gt(0, 'Deposit payment amount must be greater than 0'),
  transactionReference: z.string().trim().optional().nullable(),
  paymentDate: z.string().optional(),
  remarks: z.string().trim().optional().nullable(),
});

export const reverseApprovalDepositSchema = z.object({
  reversalReason: z.string().trim().min(3, 'Reversal reason must be at least 3 characters'),
});

export const approvalDepositQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  approvalId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const returnApprovalSchema = z.object({
  returnReason: z.string().trim().optional().nullable(),
});

export const purchaseApprovalSchema = z.object({
  notes: z.string().trim().optional().nullable(),
  discountAmount: z.coerce.number().min(0, 'Discount amount cannot be negative').optional().default(0),
});
