import { z } from 'zod';

export const createEmployeeSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format'),
  userId: z.string().uuid('Invalid user ID format').optional(),
  employeeCode: z.string().min(2, 'Employee code must be at least 2 characters').max(50).optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z
    .string()
    .regex(/^[0-9+]{10,15}$/, 'Invalid mobile phone number format (10-15 digits)'),
  designation: z.string().max(100).optional(),
  joiningDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateEmployeeSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format').optional(),
  userId: z.string().uuid('Invalid user ID format').optional(),
  employeeCode: z.string().min(2, 'Employee code must be at least 2 characters').max(50).optional(),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  mobile: z
    .string()
    .regex(/^[0-9+]{10,15}$/, 'Invalid mobile phone number format (10-15 digits)')
    .optional(),
  designation: z.string().max(100).optional(),
  joiningDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const employeeParamSchema = z.object({
  id: z.string().uuid('Invalid employee ID format'),
});

export const employeeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  companyId: z.string().uuid('Invalid company ID format').optional().or(z.literal('')),
  branchId: z.string().uuid('Invalid branch ID format').optional().or(z.literal('')),
  designation: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
