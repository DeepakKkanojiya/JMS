import { apiClient } from './client';

export interface PurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent?: number;
  remarks?: string;
}

export interface CreatePurchaseOrderInput {
  companyId: string;
  branchId: string;
  vendorId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItemInput[];
}

export const purchasesApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/purchases/orders', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/purchases/orders/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseOrderInput) => {
    const response = await apiClient.post('/purchases/orders', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/purchases/orders/${id}`, data);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post(`/purchases/orders/${id}/submit`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.post(`/purchases/orders/${id}/approve`);
    return response.data;
  },

  cancel: async (id: string, cancellationReason: string) => {
    const response = await apiClient.post(`/purchases/orders/${id}/cancel`, { cancellationReason });
    return response.data;
  },
};
