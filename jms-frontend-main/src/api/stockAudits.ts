import { apiClient } from './client';

export interface CreateStockAuditInput {
  companyId: string;
  branchId: string;
  categoryId?: string;
  notes?: string;
}

export interface ScanAuditItemInput {
  identifier: string;
  scannedGrossWeight?: number;
  scannedNetWeight?: number;
  remarks?: string;
}

export const stockAuditsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/stock-audits', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/stock-audits/${id}`);
    return response.data;
  },

  create: async (data: CreateStockAuditInput) => {
    const response = await apiClient.post('/stock-audits', data);
    return response.data;
  },

  scanItem: async (id: string, data: ScanAuditItemInput) => {
    const response = await apiClient.post(`/stock-audits/${id}/scan`, data);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await apiClient.post(`/stock-audits/${id}/submit`);
    return response.data;
  },

  reconcile: async (id: string) => {
    const response = await apiClient.post(`/stock-audits/${id}/reconcile`);
    return response.data;
  },

  cancel: async (id: string, cancellationReason: string) => {
    const response = await apiClient.post(`/stock-audits/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  getDiscrepancies: async (id: string) => {
    const response = await apiClient.get(`/stock-audits/${id}/discrepancies`);
    return response.data;
  },
};
