export interface CreateProductDTO {
  subCategoryId: string;
  sku: string;
  name: string;
  description?: string;
  metalType?: string;
  purity?: string;
  grossWeight?: number;
  netWeight?: number;
  isActive?: boolean;
}

export interface UpdateProductDTO {
  subCategoryId?: string;
  sku?: string;
  name?: string;
  description?: string;
  metalType?: string;
  purity?: string;
  grossWeight?: number;
  netWeight?: number;
  isActive?: boolean;
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  subCategoryId?: string;
  categoryId?: string;
  metalType?: string;
  purity?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
