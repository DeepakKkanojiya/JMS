import { z } from 'zod';
import { nameSchema, mobileSchema, createFileSchema } from './common.validation';

/**
 * Aadhaar Number Validation Schema (12 Digits)
 */
export const aadhaarSchema = z
  .string({ message: 'Aadhaar number must be a string' })
  .trim()
  .regex(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits');

/**
 * PAN Card Number Validation Schema (e.g., ABCDE1234F)
 */
export const panSchema = z
  .string({ message: 'PAN number must be a string' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format (e.g. ABCDE1234F)');

/**
 * Create Customer Request Body Schema
 */
export const createCustomerSchema = z.object({
  name: nameSchema,
  mobile: mobileSchema,
  aadhaar: aadhaarSchema.optional(),
  pan: panSchema.optional(),
  address: z
    .string({ message: 'Address must be a string' })
    .trim()
    .min(5, 'Address must be at least 5 characters long')
    .max(500, 'Address cannot exceed 500 characters')
    .optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

/**
 * Customer Document Upload File Schema (KYC / Invoice / ID)
 * Max size: 5MB, Allowed types: image/jpeg, image/png, image/webp, application/pdf
 */
export const customerUploadSchema = createFileSchema({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  required: true,
});
