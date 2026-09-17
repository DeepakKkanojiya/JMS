import { apiClient } from './client';

export interface PurchaseBillItemInput {
  purchaseReceiptItemId?: string;
  purchaseOrderItemId?: string;
  billedQuantity: number;
  unitPrice: number;
  taxRatePercent?: number;
  makingCharge?: number;
  remarks?: string;
}

export interface CreatePurchaseBillInput {
  companyId: string;
  branchId: string;
  vendorId: string;
  purchaseOrderId?: string;
  vendorInvoiceNumber?: string;
  vendorInvoiceDate?: string;
  notes?: string;
  items: PurchaseBillItemInput[];
}

export const purchaseBillsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/purchase-bills', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/purchase-bills/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseBillInput) => {
    const response = await apiClient.post('/purchase-bills', data);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post(`/purchase-bills/${id}/submit`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.post(`/purchase-bills/${id}/approve`);
    return response.data;
  },

  cancel: async (id: string, cancellationReason: string) => {
    const response = await apiClient.post(`/purchase-bills/${id}/cancel`, { cancellationReason });
    return response.data;
  },
};
