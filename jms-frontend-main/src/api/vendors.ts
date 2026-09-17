import { apiClient } from './client';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  creditDays?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const vendorsApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/vendors', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/vendors/${id}`);
    return res.data;
  },

  create: async (data: Partial<Vendor>) => {
    const res = await apiClient.post('/vendors', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Vendor>) => {
    const res = await apiClient.put(`/vendors/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/vendors/${id}`);
    return res.data;
  },
};
