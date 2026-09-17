import { apiClient } from './client';

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: any;
    roleId?: string;
    permissions?: string[];
    companyId?: string;
    branchId?: string;
  };
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async (refreshToken?: string) => {
    const res = await apiClient.post('/auth/logout', { refreshToken });
    return res.data;
  },
};
