import { apiClient } from './client';

export interface TaxRate {
  id: string;
  companyId: string;
  taxName: string;
  taxCode: string;
  rate: number | string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateTaxRatePayload {
  companyId: string;
  taxName: string;
  taxCode: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdateTaxRatePayload {
  taxName?: string;
  rate?: number;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface TaxRateFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  taxCode?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const taxRatesApi = {
  list: async (params?: TaxRateFilterParams) => {
    const res = await apiClient.get('/tax-rates', { params });
    return res.data;
  },

  getCurrent: async (params?: { companyId?: string; taxCode?: string }) => {
    const res = await apiClient.get('/tax-rates/current', { params });
    return res.data;
  },

  getHistory: async (params?: TaxRateFilterParams) => {
    const res = await apiClient.get('/tax-rates/history', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/tax-rates/${id}`);
    return res.data;
  },

  create: async (payload: CreateTaxRatePayload) => {
    const res = await apiClient.post('/tax-rates', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateTaxRatePayload) => {
    const res = await apiClient.put(`/tax-rates/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: string) => {
    const res = await apiClient.post(`/tax-rates/${id}/deactivate`);
    return res.data;
  },
};
