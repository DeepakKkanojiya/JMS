export interface CreateTaxRateDTO {
  companyId: string;
  taxName: string;
  taxCode: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateTaxRateDTO {
  taxName?: string;
  rate?: number;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface TaxRateQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  taxCode?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
