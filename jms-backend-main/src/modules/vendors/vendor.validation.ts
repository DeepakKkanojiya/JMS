import { z } from 'zod';

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const mobileRegex = /^[0-9+]{10,15}$/;

export const createVendorSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format'),
  vendorCode: z.string().min(2, 'Vendor code must be at least 2 characters').max(50),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(255),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email('Invalid email address format').optional().or(z.literal('')),
  mobile: z.string().regex(mobileRegex, 'Mobile number must be 10-15 digits'),
  gstNumber: z
    .string()
    .regex(gstRegex, 'Invalid GSTIN format (e.g. 07AAAAA0000A1Z5)')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(panRegex, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
  vendorType: z.enum(['JEWELLERY', 'BULLION', 'GEMSTONE', 'PACKAGING', 'SERVICE', 'OTHER']).optional(),
  isActive: z.boolean().optional(),
});

export const updateVendorSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID format').optional(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(255).optional(),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email('Invalid email address format').optional().or(z.literal('')),
  mobile: z.string().regex(mobileRegex, 'Mobile number must be 10-15 digits').optional(),
  gstNumber: z
    .string()
    .regex(gstRegex, 'Invalid GSTIN format (e.g. 07AAAAA0000A1Z5)')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(panRegex, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
  vendorType: z.enum(['JEWELLERY', 'BULLION', 'GEMSTONE', 'PACKAGING', 'SERVICE', 'OTHER']).optional(),
  isActive: z.boolean().optional(),
});

export const vendorParamSchema = z.object({
  id: z.string().uuid('Invalid vendor ID format'),
});

export const vendorQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  search: z.string().optional(),
  branchId: z.string().uuid('Invalid branch ID format').optional().or(z.literal('')),
  gstNumber: z.string().optional(),
  gstin: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
