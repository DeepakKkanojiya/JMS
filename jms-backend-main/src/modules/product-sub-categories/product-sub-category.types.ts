export interface CreateProductSubCategoryDTO {
  categoryId: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProductSubCategoryDTO {
  categoryId?: string;
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductSubCategoryQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
