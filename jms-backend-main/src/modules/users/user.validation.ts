import { z } from 'zod';

export const createUserSchema = z.object({
  roleId: z.string().trim().min(1, 'Role ID is required'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional(),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email format'),
  mobile: z.string().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  employeeCode: z.string().trim().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email('Invalid email format').optional(),
  mobile: z.string().trim().optional(),
  avatarUrl: z.string().trim().optional(),
  roleId: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const changeRoleSchema = z.object({
  roleId: z.string().trim().min(1, 'Role ID is required'),
});

export const userQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || (parseInt(val, 10) > 0), { message: 'Page must be a positive integer' }),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || (parseInt(val, 10) > 0 && parseInt(val, 10) <= 100), { message: 'Limit must be between 1 and 100' }),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const userParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});
