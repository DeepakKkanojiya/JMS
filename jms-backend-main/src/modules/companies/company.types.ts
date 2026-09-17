export interface CreateCompanyDTO {
  companyCode: string;
  name: string;
  legalName?: string;
  gstNumber?: string;
  panNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateCompanyDTO {
  companyCode?: string;
  name?: string;
  legalName?: string;
  gstNumber?: string;
  panNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface CompanyQueryDTO {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
