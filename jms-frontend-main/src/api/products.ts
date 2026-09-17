import { apiClient } from './client';

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface ProductSubCategory {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  category?: ProductCategory;
}

export interface Product {
  id: string;
  categoryId: string;
  subCategoryId?: string;
  name: string;
  sku: string;
  metalType: string;
  purity: string;
  description?: string;
  makingChargeType?: string;
  makingChargeValue?: number;
  wastePercentage?: number;
  hsnCode?: string;
  isActive: boolean;
  category?: ProductCategory;
  subCategory?: ProductSubCategory;
  images?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export const productsApi = {
  // Products
  list: async (params?: any) => {
    const res = await apiClient.get('/products', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  create: async (data: Partial<Product>) => {
    const res = await apiClient.post('/products', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Product>) => {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  // Categories
  listCategories: async (params?: any) => {
    const res = await apiClient.get('/product-categories', { params });
    return res.data;
  },

  createCategory: async (data: Partial<ProductCategory>) => {
    const res = await apiClient.post('/product-categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: Partial<ProductCategory>) => {
    const res = await apiClient.put(`/product-categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/product-categories/${id}`);
    return res.data;
  },

  // Sub-Categories
  listSubCategories: async (params?: any) => {
    const res = await apiClient.get('/product-sub-categories', { params });
    return res.data;
  },

  createSubCategory: async (data: Partial<ProductSubCategory>) => {
    const res = await apiClient.post('/product-sub-categories', data);
    return res.data;
  },

  updateSubCategory: async (id: string, data: Partial<ProductSubCategory>) => {
    const res = await apiClient.put(`/product-sub-categories/${id}`, data);
    return res.data;
  },

  deleteSubCategory: async (id: string) => {
    const res = await apiClient.delete(`/product-sub-categories/${id}`);
    return res.data;
  },
};
