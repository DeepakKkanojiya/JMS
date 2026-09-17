import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema, uuidParamSchema, paginationQuerySchema } from './common.validation';

export const ROLES_ENUM = ['OWNER', 'ADMIN', 'STAFF', 'USER'] as const;

/**
 * Create User Request Body Schema
 */
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(ROLES_ENUM, {
    message: 'Role is required and must be one of OWNER, ADMIN, STAFF, USER',
  }),
  branchId: z.string().trim().uuid('Invalid branch ID format. Must be a valid UUID').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Update User Request Body Schema
 */
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: z.enum(ROLES_ENUM).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  branchId: z.string().trim().uuid().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * User ID Parameter Schema
 */
export const getUserByIdSchema = uuidParamSchema;

/**
 * User Listing Query Schema
 */
export const getUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(ROLES_ENUM).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
