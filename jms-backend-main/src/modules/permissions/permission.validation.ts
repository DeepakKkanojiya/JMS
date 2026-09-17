import { z } from 'zod';

export const createPermissionSchema = z.object({
  module: z.string().trim().min(1, 'Module is required'),
  action: z.string().trim().min(1, 'Action is required'),
  permissionKey: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export const updatePermissionSchema = z.object({
  description: z.string().trim().optional(),
});

export const permissionQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
