import { apiClient } from './client';
import { MakingChargeType } from './makingCharges';

export interface PricingOptions {
  taxType?: 'INTRA_STATE' | 'INTER_STATE';
  wastagePercent?: number;
  makingChargeType?: MakingChargeType;
  makingChargeRate?: number;
  taxRate?: number;
}

export interface PricingCalculationResult {
  invoiceId: string;
  subtotal: number | string;
  metalValue: number | string;
  wastageValue: number | string;
  makingCharges: number | string;
  taxableAmount: number | string;
  discountAmount: number | string;
  cgstAmount: number | string;
  sgstAmount: number | string;
  igstAmount: number | string;
  taxAmount: number | string;
  grandTotal: number | string;
  pricingCalculated: boolean;
  pricingCalculatedAt: string;
  items: Array<{
    id: string;
    inventoryItemId: string;
    quantity: number;
    unitPrice: number | string;
    metalValue: number | string;
    wastagePercent: number | string;
    wastageWeight: number | string;
    wastageValue: number | string;
    makingChargeType?: MakingChargeType | null;
    makingChargeRate: number | string;
    makingChargeAmount: number | string;
    taxableAmount: number | string;
    taxRate: number | string;
    discountAmount: number | string;
    taxAmount: number | string;
    lineTotal: number | string;
  }>;
}

export const pricingApi = {
  calculateInvoicePricing: async (invoiceId: string, options?: PricingOptions) => {
    const res = await apiClient.post(`/sales/invoices/${invoiceId}/calculate-pricing`, options || {});
    return res.data;
  },

  getInvoicePricing: async (invoiceId: string) => {
    const res = await apiClient.get(`/sales/invoices/${invoiceId}/pricing`);
    return res.data;
  },
};
