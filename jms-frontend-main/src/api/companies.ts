import { apiClient } from './client';

export interface Company {
  id: string;
  name: string;
  code: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  currency?: string;
  fiscalYearStart?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const companiesApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/companies', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/companies/${id}`);
    return res.data;
  },

  create: async (data: Partial<Company>) => {
    const res = await apiClient.post('/companies', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Company>) => {
    const res = await apiClient.put(`/companies/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/companies/${id}`);
    return res.data;
  },
};
