import { apiClient } from './client';

export interface PurchaseReturnItemInput {
  inventoryItemId?: string;
  purchaseBillItemId?: string;
  returnedQuantity: number;
  grossWeight?: number;
  netWeight?: number;
  unitPrice: number;
  taxRatePercent?: number;
  remarks?: string;
}

export interface CreatePurchaseReturnInput {
  companyId: string;
  branchId: string;
  vendorId: string;
  purchaseBillId?: string;
  purchaseOrderId?: string;
  reason: string;
  items: PurchaseReturnItemInput[];
}

export const purchaseReturnsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/purchase-returns', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/purchase-returns/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseReturnInput) => {
    const response = await apiClient.post('/purchase-returns', data);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post(`/purchase-returns/${id}/submit`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.post(`/purchase-returns/${id}/approve`);
    return response.data;
  },

  process: async (id: string) => {
    const response = await apiClient.post(`/purchase-returns/${id}/process`);
    return response.data;
  },

  cancel: async (id: string, cancellationReason: string) => {
    const response = await apiClient.post(`/purchase-returns/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  getDebitNotes: async (params?: any) => {
    const response = await apiClient.get('/vendor-debit-notes', { params });
    return response.data;
  },
};
