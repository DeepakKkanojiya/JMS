import { z } from 'zod';
import { GirviLoanStatus, GirviInterestPeriod, GirviCollectionStatus, GirviPaymentMethod } from '../../generated/prisma';

export const collateralSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid Inventory Item ID').optional().nullable(),
  itemName: z.string().min(1, 'Item name is required'),
  metalType: z.string().optional(),
  purity: z.string().optional(),
  grossWeight: z.coerce.number().gt(0, 'Gross weight must be greater than 0'),
  stoneWeight: z.coerce.number().min(0, 'Stone weight cannot be negative').optional(),
  netWeight: z.coerce.number().gt(0, 'Net weight must be greater than 0'),
  valuedAmount: z.coerce.number().min(0, 'Valued amount cannot be negative').optional(),
  barcode: z.string().optional().nullable(),
  rfidEpc: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const createGirviLoanSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  customerId: z.string().uuid('Invalid Customer ID'),
  dueDate: z.string().min(1, 'Due date is required'),
  principalAmount: z.coerce.number().gt(0, 'Principal amount must be greater than 0'),
  valuationAmount: z.coerce.number().min(0, 'Valuation amount cannot be negative').optional(),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative').optional(),
  interestPeriod: z.nativeEnum(GirviInterestPeriod).optional(),
  notes: z.string().optional().nullable(),
  documentRef: z.string().optional().nullable(),
  collaterals: z.array(collateralSchema).optional(),
});

export const updateGirviLoanSchema = z.object({
  dueDate: z.string().optional(),
  principalAmount: z.coerce.number().gt(0).optional(),
  valuationAmount: z.coerce.number().min(0).optional(),
  interestRate: z.coerce.number().min(0).optional(),
  interestPeriod: z.nativeEnum(GirviInterestPeriod).optional(),
  notes: z.string().optional().nullable(),
  documentRef: z.string().optional().nullable(),
});

export const cancelGirviLoanSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const addCollateralSchema = collateralSchema;

export const girviLoanParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const girviLoanQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(GirviLoanStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createGirviCollectionSchema = z.object({
  girviLoanId: z.string().uuid('Invalid Girvi Loan ID'),
  paymentMethod: z.nativeEnum(GirviPaymentMethod),
  amount: z.coerce.number().gt(0, 'Collection amount must be greater than 0'),
  principalAmount: z.coerce.number().min(0, 'Principal component cannot be negative').optional(),
  interestAmount: z.coerce.number().min(0, 'Interest component cannot be negative').optional(),
  transactionReference: z.string().optional().nullable(),
  collectionDate: z.string().optional(),
  remarks: z.string().optional().nullable(),
});

export const reverseGirviCollectionSchema = z.object({
  reversalReason: z.string().trim().min(3, 'Reversal reason must be at least 3 characters'),
});

export const renewGirviLoanSchema = z.object({
  newDueDate: z.string().min(1, 'New due date is required'),
  remarks: z.string().optional().nullable(),
});

export const girviCollectionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  girviLoanId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(GirviPaymentMethod).optional(),
  status: z.nativeEnum(GirviCollectionStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const overdueLoansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  branchId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  daysThreshold: z.coerce.number().int().optional(),
});

export const settleGirviLoanSchema = z.object({
  paymentMethod: z.nativeEnum(GirviPaymentMethod),
  totalSettlementAmount: z.coerce.number().min(0).optional(),
  principalSettled: z.coerce.number().min(0).optional(),
  interestSettled: z.coerce.number().min(0).optional(),
  transactionReference: z.string().optional().nullable(),
  settlementDate: z.string().optional(),
  remarks: z.string().optional().nullable(),
});

export const girviSettlementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  girviLoanId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(GirviPaymentMethod).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const girviReportQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const girviAuditQuerySchema = z.object({
  girviLoanId: z.string().uuid().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});


