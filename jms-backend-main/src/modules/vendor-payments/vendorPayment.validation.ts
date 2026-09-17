import { z } from 'zod';
import { VendorPaymentMethod, VendorPaymentStatus } from '../../generated/prisma';

export const createVendorPaymentSchema = z.object({
  purchaseBillId: z.string().uuid('Invalid Purchase Bill ID').optional(),
  vendorId: z.string().uuid('Invalid Vendor ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  amount: z.coerce.number().gt(0, 'Payment amount must be greater than 0'),
  paymentMethod: z.nativeEnum(VendorPaymentMethod, {
    message: 'Invalid payment method',
  }),
  transactionReference: z.string().optional().nullable(),
  paymentDate: z.string().datetime({ message: 'Invalid payment date format' }).optional(),
  remarks: z.string().optional().nullable(),
});

export const reverseVendorPaymentSchema = z.object({
  reversalReason: z.string().trim().min(3, 'Reversal reason must be at least 3 characters'),
});

export const vendorPaymentParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const vendorPaymentQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  vendorId: z.string().uuid().optional(),
  purchaseBillId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(VendorPaymentMethod).optional(),
  status: z.nativeEnum(VendorPaymentStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
