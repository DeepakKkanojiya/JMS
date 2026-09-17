export interface CreateProductCategoryDTO {
  companyId?: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProductCategoryDTO {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductCategoryQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
