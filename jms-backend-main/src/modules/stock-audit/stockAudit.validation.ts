import { z } from 'zod';
import { AuditSessionStatus } from '../../generated/prisma';

export const createStockAuditSessionSchema = z.object({
  companyId: z.string().uuid('Invalid Company ID'),
  branchId: z.string().uuid('Invalid Branch ID'),
  categoryId: z.string().uuid('Invalid Category ID').optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const scanAuditItemSchema = z.object({
  identifier: z.string().trim().min(1, 'Identifier (barcode, RFID EPC, or Item ID) is required'),
  scannedGrossWeight: z.coerce.number().min(0, 'Scanned gross weight cannot be negative').optional(),
  scannedNetWeight: z.coerce.number().min(0, 'Scanned net weight cannot be negative').optional(),
  remarks: z.string().optional().nullable(),
});

export const cancelStockAuditSessionSchema = z.object({
  cancellationReason: z.string().trim().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const stockAuditSessionParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const stockAuditSessionQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(AuditSessionStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
