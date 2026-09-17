import { z } from 'zod';
import { ThirdPartyGirviStatus, GirviInterestPeriod } from '../../generated/prisma';

export const createThirdPartyLenderSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID'),
  branchId: z.string().uuid('Invalid Branch ID').optional(),
  lenderCode: z.string().trim().min(2, 'Lender code must be at least 2 characters'),
  name: z.string().trim().min(2, 'Lender name is required'),
  contactPerson: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
});

export const thirdPartyCollateralSchema = z.object({
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

export const createThirdPartyGirviSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  customerId: z.string().uuid('Invalid Customer ID'),
  thirdPartyLenderId: z.string().uuid('Invalid Third-Party Lender ID'),
  externalLoanNumber: z.string().trim().min(1, 'External loan number is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  principalAmount: z.coerce.number().gt(0, 'Principal amount must be greater than 0'),
  valuationAmount: z.coerce.number().min(0, 'Valuation amount cannot be negative').optional(),
  interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative').optional(),
  interestPeriod: z.nativeEnum(GirviInterestPeriod).optional(),
  notes: z.string().optional().nullable(),
  documentRef: z.string().optional().nullable(),
  collaterals: z.array(thirdPartyCollateralSchema).optional(),
});

export const updateThirdPartyGirviSchema = z.object({
  dueDate: z.string().optional(),
  principalAmount: z.coerce.number().gt(0).optional(),
  valuationAmount: z.coerce.number().min(0).optional(),
  interestRate: z.coerce.number().min(0).optional(),
  interestPeriod: z.nativeEnum(GirviInterestPeriod).optional(),
  notes: z.string().optional().nullable(),
  documentRef: z.string().optional().nullable(),
});

export const closeThirdPartyGirviSchema = z.object({
  closureReason: z.string().trim().min(3, 'Closure reason must be at least 3 characters'),
});

export const cancelThirdPartyGirviSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const thirdPartyGirviParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const thirdPartyGirviQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  thirdPartyLenderId: z.string().uuid().optional(),
  status: z.nativeEnum(ThirdPartyGirviStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
