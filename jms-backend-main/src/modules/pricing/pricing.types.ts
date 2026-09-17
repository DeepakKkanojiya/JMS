import { MakingChargeType } from '../../generated/prisma';

export type TaxType = 'INTRA_STATE' | 'INTER_STATE';

export interface CalculatePricingDTO {
  taxType?: TaxType;
  wastagePercent?: number;
  makingChargeType?: MakingChargeType;
  makingChargeRate?: number;
  taxRate?: number;
}

export interface LineItemPricingBreakdown {
  itemId: string;
  inventoryItemId: string;
  itemCode: string;
  productName: string;
  netWeight: string;
  metalValue: string;
  wastagePercent: string;
  wastageWeight: string;
  wastageValue: string;
  makingChargeType: MakingChargeType;
  makingChargeRate: string;
  makingChargeAmount: string;
  taxableAmount: string;
  taxRate: string;
  taxAmount: string;
  lineTotal: string;
}

export interface InvoicePricingBreakdown {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
  taxType: TaxType;
  metalValue: string;
  wastageValue: string;
  makingCharges: string;
  taxableAmount: string;
  discountAmount: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  taxAmount: string;
  grandTotal: string;
  pricingCalculated: boolean;
  pricingCalculatedAt: Date | null;
  items: LineItemPricingBreakdown[];
}
