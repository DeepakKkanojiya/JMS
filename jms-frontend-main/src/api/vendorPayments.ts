import { apiClient } from './client';

export interface CreateVendorPaymentInput {
  companyId: string;
  branchId: string;
  vendorId: string;
  purchaseBillId: string;
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  amount: number;
  referenceNumber?: string;
  notes?: string;
}

export const vendorPaymentsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/vendor-payments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/vendor-payments/${id}`);
    return response.data;
  },

  create: async (data: CreateVendorPaymentInput) => {
    const response = await apiClient.post('/vendor-payments', data);
    return response.data;
  },

  reverse: async (id: string, reversalReason: string) => {
    const response = await apiClient.post(`/vendor-payments/${id}/reverse`, { reversalReason });
    return response.data;
  },

  getVendorPayables: async (vendorId: string) => {
    const response = await apiClient.get(`/vendors/${vendorId}/payables`);
    return response.data;
  },
};
