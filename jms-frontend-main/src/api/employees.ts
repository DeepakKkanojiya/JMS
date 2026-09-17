import { apiClient } from './client';

export interface Employee {
  id: string;
  companyId: string;
  branchId?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  code: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  isActive: boolean;
  company?: { name: string };
  branch?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export const employeesApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/employees', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/employees/${id}`);
    return res.data;
  },

  create: async (data: Partial<Employee>) => {
    const res = await apiClient.post('/employees', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Employee>) => {
    const res = await apiClient.put(`/employees/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  },
};
