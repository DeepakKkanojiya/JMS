import { apiClient } from './client';

export type MetalType = 'GOLD' | 'SILVER' | 'PLATINUM';

export interface MetalRate {
  id: string;
  companyId: string;
  metalType: MetalType;
  purity: string;
  marketRatePerGram?: number | string | null;
  ratePerGram: number | string;
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
    legalName?: string;
  };
}

export interface CreateMetalRatePayload {
  companyId: string;
  metalType: MetalType;
  purity: string;
  marketRatePerGram?: number | null;
  ratePerGram: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdateMetalRatePayload {
  ratePerGram?: number;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface MetalRateFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  metalType?: MetalType | '';
  purity?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'effectiveFrom' | 'effectiveTo' | 'ratePerGram' | 'metalType' | 'purity';
  sortOrder?: 'asc' | 'desc';
}

export const metalRatesApi = {
  list: async (params?: MetalRateFilterParams) => {
    const res = await apiClient.get('/metal-rates', { params });
    return res.data;
  },

  getHistory: async (params?: MetalRateFilterParams) => {
    const res = await apiClient.get('/metal-rates/history', { params });
    return res.data;
  },

  getCurrentRate: async (params: { companyId: string; metalType: MetalType; purity: string; at?: string }) => {
    const res = await apiClient.get('/metal-rates/current', { params });
    return res.data;
  },

  calculateValue: async (payload: { companyId: string; metalType: MetalType; purity: string; netWeight: number; at?: string }) => {
    const res = await apiClient.post('/metal-rates/calculate', payload);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/metal-rates/${id}`);
    return res.data;
  },

  create: async (payload: CreateMetalRatePayload) => {
    const res = await apiClient.post('/metal-rates', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateMetalRatePayload) => {
    const res = await apiClient.put(`/metal-rates/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: string) => {
    const res = await apiClient.post(`/metal-rates/${id}/deactivate`);
    return res.data;
  },

  getLiveMarketRates: async () => {
    const res = await apiClient.get('/metal-rates/live');
    return res.data;
  },
};
