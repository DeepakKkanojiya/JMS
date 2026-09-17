import { apiClient } from './client';

export interface Branch {
  id: string;
  companyId: string;
  company?: { name: string; code: string };
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const branchesApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/branches', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/branches/${id}`);
    return res.data;
  },

  create: async (data: Partial<Branch>) => {
    const res = await apiClient.post('/branches', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Branch>) => {
    const res = await apiClient.put(`/branches/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/branches/${id}`);
    return res.data;
  },
};
