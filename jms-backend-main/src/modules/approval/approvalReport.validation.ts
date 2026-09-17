import { z } from 'zod';
import { ApprovalStatus, PaymentMethod, PaymentStatus } from '../../generated/prisma';

export const approvalReportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  salespersonId: z.string().uuid().optional(),
  status: z.nativeEnum(ApprovalStatus).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  isOverdue: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'string' ? val === 'true' : val))
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const customerReportParamSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID'),
});

export const approvalAuditParamSchema = z.object({
  id: z.string().uuid('Invalid Approval ID'),
});
