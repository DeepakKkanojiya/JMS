import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Live Railway API & Localhost API URLs (Explicitly Separated)
export const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL || 'https://jms-backend.up.railway.app/api/v1';
export const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000/api/v1';

// Function to retrieve active base URL dynamically from environment, localStorage, or domain detection
export function getActiveBaseUrl(): string {
  const envPreference = localStorage.getItem('api_environment');
  if (envPreference === 'live') {
    return LIVE_API_URL;
  }
  if (envPreference === 'local') {
    return LOCAL_API_URL;
  }

  // If VITE_API_BASE_URL env var is explicitly provided in build environment
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Automatic domain detection: If deployed on non-localhost (e.g. jms-frontend.up.railway.app), default to LIVE Railway API URL!
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    if (!isLocalhost) {
      return LIVE_API_URL;
    }
  }

  return LOCAL_API_URL;
}

export const apiClient = axios.create({
  baseURL: getActiveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Update dynamic base URL on environment switch
export function setApiEnvironment(env: 'live' | 'local') {
  localStorage.setItem('api_environment', env);
  apiClient.defaults.baseURL = env === 'live' ? LIVE_API_URL : LOCAL_API_URL;
}

// 1. Request Interceptor: Attach Access Token & Dynamic Base URL
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getActiveBaseUrl();
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Token Refresh & Automatic Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Automatic Refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const activeUrl = getActiveBaseUrl();
        const res = await axios.post(`${activeUrl}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data?.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to extract validation errors from 400 Bad Request
export function parseValidationErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  const responseData = error?.response?.data;

  if (responseData?.errors && Array.isArray(responseData.errors)) {
    responseData.errors.forEach((err: { field: string; message: string }) => {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });
  } else if (responseData?.message) {
    fieldErrors['general'] = responseData.message;
  }

  return fieldErrors;
}
