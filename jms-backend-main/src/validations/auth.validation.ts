import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.validation';

/**
 * Authentication Login Request Body Schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Refresh Token Request Body Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ message: 'Refresh token must be a string' })
    .trim()
    .min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
