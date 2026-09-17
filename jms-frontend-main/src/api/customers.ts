import { apiClient } from './client';

export interface Customer {
  id: string;
  code?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  city?: string;
  state?: string;
  address?: string;
  panNumber?: string;
  gstNumber?: string;
  membershipTier?: string;
  loyaltyPoints?: number;
  isActive: boolean;
  addresses?: any[];
  documents?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export const customersApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/customers', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },

  create: async (data: Partial<Customer>) => {
    const res = await apiClient.post('/customers', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Customer>) => {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data;
  },

  // Addresses
  listAddresses: async (customerId: string) => {
    const res = await apiClient.get(`/customers/${customerId}/addresses`);
    return res.data;
  },

  addAddress: async (customerId: string, data: any) => {
    const res = await apiClient.post(`/customers/${customerId}/addresses`, data);
    return res.data;
  },

  // Documents
  listDocuments: async (customerId: string) => {
    const res = await apiClient.get(`/customers/${customerId}/documents`);
    return res.data;
  },

  addDocument: async (customerId: string, data: any) => {
    const res = await apiClient.post(`/customers/${customerId}/documents`, data);
    return res.data;
  },
};
