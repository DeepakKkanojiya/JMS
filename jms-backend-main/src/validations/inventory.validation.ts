import { z } from 'zod';

/**
 * Create Inventory Item Request Body Schema
 */
export const createInventorySchema = z.object({
  rfid: z
    .string({ message: 'RFID tag must be a string' })
    .trim()
    .min(1, 'RFID tag is required'),
  barcode: z
    .string({ message: 'Barcode must be a string' })
    .trim()
    .min(1, 'Barcode is required'),
  weight: z.coerce
    .number({ message: 'Weight must be a number' })
    .positive('Weight must be greater than 0'),
  purity: z
    .string({ message: 'Purity must be a string' })
    .trim()
    .min(1, 'Purity is required'),
  sellingPrice: z.coerce
    .number({ message: 'Selling price must be a number' })
    .positive('Selling price must be greater than 0'),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
