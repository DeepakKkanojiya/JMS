import { apiClient } from './client';

export interface ImageRecord {
  id: string;
  productId?: string;
  inventoryItemId?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export const imagesApi = {
  // Product Master Images
  listProductImages: async (productId: string) => {
    const res = await apiClient.get(`/products/${productId}/images`);
    return res.data;
  },

  uploadProductImage: async (productId: string, fileOrUrl: File | string, altText?: string, isPrimary?: boolean, sortOrder?: number) => {
    if (typeof fileOrUrl === 'string') {
      const res = await apiClient.post(`/products/${productId}/images`, {
        imageUrl: fileOrUrl,
        altText,
        isPrimary,
        sortOrder,
      });
      return res.data;
    } else {
      const formData = new FormData();
      formData.append('image', fileOrUrl);
      if (altText !== undefined) formData.append('altText', altText);
      if (isPrimary !== undefined) formData.append('isPrimary', String(isPrimary));
      if (sortOrder !== undefined) formData.append('sortOrder', String(sortOrder));

      const res = await apiClient.post(`/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }
  },

  updateProductImage: async (productId: string, imageId: string, data: { altText?: string; isPrimary?: boolean; sortOrder?: number }) => {
    const res = await apiClient.put(`/products/${productId}/images/${imageId}`, data);
    return res.data;
  },

  deleteProductImage: async (productId: string, imageId: string) => {
    const res = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return res.data;
  },

  // Physical Inventory Item Photographs
  listInventoryItemImages: async (inventoryItemId: string) => {
    const res = await apiClient.get(`/inventory-items/${inventoryItemId}/images`);
    return res.data;
  },

  uploadInventoryItemImage: async (inventoryItemId: string, fileOrUrl: File | string, altText?: string, isPrimary?: boolean, sortOrder?: number) => {
    if (typeof fileOrUrl === 'string') {
      const res = await apiClient.post(`/inventory-items/${inventoryItemId}/images`, {
        imageUrl: fileOrUrl,
        altText,
        isPrimary,
        sortOrder,
      });
      return res.data;
    } else {
      const formData = new FormData();
      formData.append('image', fileOrUrl);
      if (altText !== undefined) formData.append('altText', altText);
      if (isPrimary !== undefined) formData.append('isPrimary', String(isPrimary));
      if (sortOrder !== undefined) formData.append('sortOrder', String(sortOrder));

      const res = await apiClient.post(`/inventory-items/${inventoryItemId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }
  },

  updateInventoryItemImage: async (inventoryItemId: string, imageId: string, data: { altText?: string; isPrimary?: boolean; sortOrder?: number }) => {
    const res = await apiClient.put(`/inventory-items/${inventoryItemId}/images/${imageId}`, data);
    return res.data;
  },

  deleteInventoryItemImage: async (inventoryItemId: string, imageId: string) => {
    const res = await apiClient.delete(`/inventory-items/${inventoryItemId}/images/${imageId}`);
    return res.data;
  },
};
