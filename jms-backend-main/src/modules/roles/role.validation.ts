import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
  displayName: z.string().trim().min(1, 'Display name is required'),
  description: z.string().trim().optional(),
});

export const updateRoleSchema = z.object({
  displayName: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.string().trim().min(1)).min(1, 'At least one permission ID is required'),
});

export const roleQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
