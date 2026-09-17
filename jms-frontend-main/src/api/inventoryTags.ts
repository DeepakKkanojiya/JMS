import { apiClient } from './client';

export interface InventoryTagDetail {
  id: string;
  inventoryItemId: string;
  barcode: string;
  qrCode: string;
  rfidEpc?: string | null;
  isActive: boolean;
  taggedAt?: string;
  inventoryItem?: any;
}

export const inventoryTagsApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/inventory-tags', { params });
    return res.data;
  },

  getByBarcode: async (barcode: string) => {
    const res = await apiClient.get(`/inventory-tags/barcode/${encodeURIComponent(barcode)}`);
    return res.data;
  },

  getByQrCode: async (qrCode: string) => {
    const res = await apiClient.get(`/inventory-tags/qr/${encodeURIComponent(qrCode)}`);
    return res.data;
  },

  getItemTag: async (inventoryItemId: string) => {
    const res = await apiClient.get(`/inventory-items/${inventoryItemId}/tag`);
    return res.data;
  },

  createTag: async (inventoryItemId: string, data?: { barcode?: string; qrCode?: string; rfidEpc?: string | null; isActive?: boolean }) => {
    const res = await apiClient.post(`/inventory-items/${inventoryItemId}/tag`, data || {});
    return res.data;
  },

  updateTag: async (inventoryItemId: string, data: { barcode?: string; qrCode?: string; rfidEpc?: string | null; isActive?: boolean }) => {
    const res = await apiClient.put(`/inventory-items/${inventoryItemId}/tag`, data);
    return res.data;
  },

  regenerateTag: async (inventoryItemId: string) => {
    const res = await apiClient.post(`/inventory-items/${inventoryItemId}/tag/regenerate`);
    return res.data;
  },

  updateStatus: async (inventoryItemId: string, isActive: boolean) => {
    const res = await apiClient.patch(`/inventory-items/${inventoryItemId}/tag/status`, { isActive });
    return res.data;
  },
};
