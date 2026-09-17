import { MetalType } from '../../generated/prisma';

export interface CreateMetalRateInput {
  companyId: string;
  metalType: MetalType;
  purity: string;
  marketRatePerGram?: number | null;
  ratePerGram: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdateMetalRateInput {
  ratePerGram?: number;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface MetalRateQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  metalType?: MetalType | string;
  purity?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'effectiveFrom' | 'effectiveTo' | 'ratePerGram' | 'metalType' | 'purity';
  sortOrder?: 'asc' | 'desc';
}

export interface CalculateMetalValueInput {
  companyId: string;
  metalType: MetalType;
  purity: string;
  netWeight: number;
  at?: string;
}

export interface CalculateMetalValueResult {
  companyId: string;
  metalType: MetalType;
  purity: string;
  netWeight: number;
  ratePerGram: number;
  metalValue: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}

export interface LiveMetalRateItem {
  metalType: MetalType;
  purity: string;
  displayName: string;
  ratePerGram: number;
  ratePer10Gram?: number;
  ratePerKg?: number;
  currency: string;
  change24h: number;
  high24h: number;
  low24h: number;
  internationalUsdOz?: number;
}

export interface LiveMetalRatesFeed {
  timestamp: string;
  source: string;
  currency: string;
  usdInrRate: number;
  rates: LiveMetalRateItem[];
}

export interface SyncLiveRatesInput {
  companyId: string;
  markupPercent?: number;
  flatMarkupPerGram?: number;
}

export interface BulkRateItemInput {
  metalType: MetalType;
  purity: string;
  ratePerGram: number;
}

export interface BulkUpdateRatesInput {
  companyId: string;
  rates: BulkRateItemInput[];
}
