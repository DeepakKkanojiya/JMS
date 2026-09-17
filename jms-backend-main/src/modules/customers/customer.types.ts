export interface CreateCustomerDTO {
  companyId?: string;
  branchId?: string;
  customerCode: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobile: string;
  panNumber?: string;
  aadharNumber?: string;
  gstNumber?: string;
  customerType?: string;
  openingCashBalance?: number;
  openingGoldBalanceGrams?: number;
  openingSilverBalanceGrams?: number;
  cashBalance?: number;
  goldBalanceGrams?: number;
  silverBalanceGrams?: number;
  isActive?: boolean;
}

export interface UpdateCustomerDTO {
  branchId?: string | null;
  customerCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  panNumber?: string;
  aadharNumber?: string;
  gstNumber?: string;
  customerType?: string;
  openingCashBalance?: number;
  openingGoldBalanceGrams?: number;
  openingSilverBalanceGrams?: number;
  cashBalance?: number;
  goldBalanceGrams?: number;
  silverBalanceGrams?: number;
  isActive?: boolean;
}

export interface CustomerQueryDTO {
  page?: string;
  limit?: string;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerType?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerSearchQueryDTO {
  q?: string;
  branchId?: string;
  limit?: string;
}
