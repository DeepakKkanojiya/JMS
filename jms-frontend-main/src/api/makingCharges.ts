import { apiClient } from './client';
import { MetalType } from './metalRates';

export type MakingChargeType = 'PER_GRAM' | 'FIXED' | 'PERCENTAGE';

export interface MakingCharge {
  id: string;
  companyId: string;
  metalType: MetalType;
  purity: string;
  chargeType: MakingChargeType;
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

export interface CreateMakingChargePayload {
  companyId: string;
  metalType: MetalType;
  purity: string;
  chargeType: MakingChargeType;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdateMakingChargePayload {
  rate?: number;
  effectiveTo?: string | null;
  isActive?: boolean;
}

export interface MakingChargeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  metalType?: MetalType | '';
  purity?: string;
  chargeType?: MakingChargeType | '';
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const makingChargesApi = {
  list: async (params?: MakingChargeFilterParams) => {
    const res = await apiClient.get('/making-charges', { params });
    return res.data;
  },

  getCurrent: async (params?: { companyId?: string; metalType?: MetalType; purity?: string }) => {
    const res = await apiClient.get('/making-charges/current', { params });
    return res.data;
  },

  getHistory: async (params?: MakingChargeFilterParams) => {
    const res = await apiClient.get('/making-charges/history', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/making-charges/${id}`);
    return res.data;
  },

  create: async (payload: CreateMakingChargePayload) => {
    const res = await apiClient.post('/making-charges', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateMakingChargePayload) => {
    const res = await apiClient.put(`/making-charges/${id}`, payload);
    return res.data;
  },

  deactivate: async (id: string) => {
    const res = await apiClient.post(`/making-charges/${id}/deactivate`);
    return res.data;
  },
};
