import { apiClient } from './client';

export interface CreateJobWorkOrderInput {
  companyId: string;
  branchId: string;
  vendorId: string;
  targetItemName: string;
  metalType?: string;
  purity?: string;
  expectedDeliveryDate?: string;
  agreedWastagePercent?: number;
  agreedMakingChargePerGram?: number;
  notes?: string;
}

export interface IssueMaterialInput {
  itemType: 'RAW_METAL' | 'LOOSE_STONE' | 'INVENTORY_ITEM';
  inventoryItemId?: string;
  description: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  purity: string;
  fineWeight: number;
}

export interface ReceiveJobWorkInput {
  itemName: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  purity: string;
  fineWeight: number;
  actualWastageWeight?: number;
  makingCharges?: number;
  remarks?: string;
  createInventoryItem?: boolean;
  productId?: string;
}

export const jobWorkApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/job-work/orders', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/job-work/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateJobWorkOrderInput) => {
    const response = await apiClient.post('/job-work/orders', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/job-work/orders/${id}`, data);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post(`/job-work/orders/${id}/submit`);
    return response.data;
  },

  assign: async (id: string) => {
    const response = await apiClient.post(`/job-work/orders/${id}/assign`);
    return response.data;
  },

  issueMaterial: async (id: string, data: IssueMaterialInput) => {
    const response = await apiClient.post(`/job-work/orders/${id}/issue-material`, data);
    return response.data;
  },

  receive: async (id: string, data: ReceiveJobWorkInput) => {
    const response = await apiClient.post(`/job-work/orders/${id}/receive`, data);
    return response.data;
  },

  cancel: async (id: string, cancellationReason: string) => {
    const response = await apiClient.post(`/job-work/orders/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  getKarigarSummary: async (vendorId: string) => {
    const response = await apiClient.get(`/karigars/${vendorId}/job-work-summary`);
    return response.data;
  },
};
