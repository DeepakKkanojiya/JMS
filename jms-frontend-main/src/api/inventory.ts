import { apiClient } from './client';

export interface InventoryTag {
  id?: string;
  inventoryItemId?: string;
  barcode: string;
  qrCode: string;
  rfidEpc?: string | null;
  isActive: boolean;
  taggedAt?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  branchId: string;
  itemCode: string;
  grossWeight: number | string;
  netWeight: number | string;
  stoneWeight?: number | string;
  purity: string;
  metalType?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'TRANSFER_PENDING' | 'IN_TRANSIT' | 'UNDER_REPAIR' | 'ON_APPROVAL' | 'RETURNED' | 'LOST' | 'DAMAGED';
  product?: any;
  branch?: any;
  inventoryTag?: InventoryTag;
  images?: any[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedAtBy?: string;
}

export const inventoryApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/inventory-items', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/inventory-items/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post('/inventory-items', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/inventory-items/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/inventory-items/${id}`);
    return res.data;
  },

  getHistory: async (id: string) => {
    const res = await apiClient.get(`/inventory-items/${id}/history`);
    return res.data;
  },
};
