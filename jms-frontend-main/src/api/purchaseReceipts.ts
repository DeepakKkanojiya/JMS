import { apiClient } from './client';

export interface PurchaseReceiptItemInput {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  grossWeight?: number;
  netWeight?: number;
  purity?: string;
  remarks?: string;
}

export interface CreatePurchaseReceiptInput {
  purchaseOrderId: string;
  companyId: string;
  branchId: string;
  vendorId: string;
  supplierInvoiceNumber?: string;
  notes?: string;
  items: PurchaseReceiptItemInput[];
}

export const purchaseReceiptsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/purchase-receipts', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/purchase-receipts/${id}`);
    return response.data;
  },

  create: async (data: CreatePurchaseReceiptInput) => {
    const response = await apiClient.post('/purchase-receipts', data);
    return response.data;
  },

  processIntake: async (id: string) => {
    const response = await apiClient.post(`/purchase-receipts/${id}/receive`);
    return response.data;
  },
};
