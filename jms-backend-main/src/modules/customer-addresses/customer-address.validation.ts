import { z } from 'zod';

export const createCustomerAddressSchema = z.object({
  addressType: z.enum(['HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER']).optional(),
  addressLine1: z.string().min(2, 'Address line 1 is required').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().min(4, 'Pincode is required').max(20),
  isDefault: z.boolean().optional(),
});

export const updateCustomerAddressSchema = z.object({
  addressType: z.enum(['HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER']).optional(),
  addressLine1: z.string().min(2, 'Address line 1 is required').max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100).optional(),
  state: z.string().min(1, 'State is required').max(100).optional(),
  pincode: z.string().min(4, 'Pincode is required').max(20).optional(),
  isDefault: z.boolean().optional(),
});

export const customerAddressParamSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  addressId: z.string().uuid('Invalid address ID format').optional(),
});
