import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
  businessType: z
    .enum(['RETAIL', 'WHOLESALE'])
    .optional()
    .default('RETAIL'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .trim()
    .min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().optional(),
});
