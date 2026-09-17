import { z } from 'zod';

/**
 * Reusable Email Validation Schema
 */
export const emailSchema = z
  .string({ message: 'Email must be a string' })
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase();

/**
 * Reusable Password Validation Schema
 */
export const passwordSchema = z
  .string({ message: 'Password must be a string' })
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters long')
  .max(100, 'Password must not exceed 100 characters');

/**
 * Reusable Name Validation Schema
 */
export const nameSchema = z
  .string({ message: 'Name must be a string' })
  .trim()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must not exceed 100 characters');

/**
 * Reusable Mobile Number Validation Schema (10-15 digits)
 */
export const mobileSchema = z
  .string({ message: 'Mobile number must be a string' })
  .trim()
  .min(1, 'Mobile number is required')
  .regex(/^[0-9]{10,15}$/, 'Mobile number must contain only numbers and be 10-15 digits long');

/**
 * Reusable UUID / ID Validation Schema
 */
export const uuidParamSchema = z.object({
  id: z
    .string({ message: 'ID must be a string' })
    .trim()
    .min(1, 'ID is required')
    .uuid('Invalid ID format. Must be a valid UUID'),
});

export const idParamSchema = uuidParamSchema;

/**
 * Reusable Pagination Query Validation Schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ message: 'Page must be a number' })
    .int('Page must be an integer')
    .min(1, 'Page must be greater than or equal to 1')
    .default(1),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

/**
 * Helper options for File Validation Schema
 */
export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxSizeBytes?: number; // default 5MB
  required?: boolean;
}

/**
 * Reusable File Upload Validation Schema Generator
 */
export function createFileSchema(options: FileValidationOptions = {}) {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    required = true,
  } = options;

  const fileObjectSchema = z
    .object({
      originalname: z.string({ message: 'Original filename is required' }),
      mimetype: z
        .string({ message: 'MIME type is required' })
        .refine((type) => allowedMimeTypes.includes(type), {
          message: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        }),
      size: z
        .number({ message: 'File size is required' })
        .max(maxSizeBytes, `File size exceeds maximum allowed limit of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`),
    })
    .refine(
      (file) => {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        return ext ? allowedExtensions.includes(ext) : false;
      },
      {
        message: `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`,
      }
    );

  if (required) {
    return z.custom<any>((val) => val !== undefined && val !== null, {
      message: 'File is required',
    }).pipe(fileObjectSchema);
  }

  return fileObjectSchema.optional();
}

/**
 * Default file validation schema for images and PDFs up to 5MB
 */
export const defaultFileSchema = createFileSchema({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  maxSizeBytes: 5 * 1024 * 1024,
  required: true,
});
