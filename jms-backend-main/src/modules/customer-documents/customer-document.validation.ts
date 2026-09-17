import { z } from 'zod';

export const createCustomerDocumentSchema = z.object({
  documentType: z.enum(['AADHAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE', 'GST_CERTIFICATE', 'OTHER']),
  documentNumber: z.string().min(2, 'Document number must be at least 2 characters').max(100).optional(),
  fileUrl: z.string().max(500).optional().or(z.literal('')),
});

export const updateCustomerDocumentSchema = z.object({
  documentType: z.enum(['AADHAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE', 'GST_CERTIFICATE', 'OTHER']).optional(),
  documentNumber: z.string().min(2, 'Document number must be at least 2 characters').max(100).optional(),
  fileUrl: z.string().max(500).optional().or(z.literal('')),
});

export const customerDocumentParamSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  documentId: z.string().uuid('Invalid document ID format').optional(),
});
