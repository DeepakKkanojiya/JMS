import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setApiEnvironment, LIVE_API_URL, LOCAL_API_URL } from '../api/client';
import { authApi } from '../api/auth';
import { hasPermission as checkPermission, hasAnyPermission as checkAnyPermission, hasAllPermissions as checkAllPermissions } from '../utils/permissions';

export interface Role {
  id?: string;
  name?: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role | string;
  permissions?: string[];
  companyId?: string;
  branchId?: string;
  businessMode?: 'RETAIL' | 'WHOLESALE';
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  environment: 'local' | 'live';
  businessMode: 'RETAIL' | 'WHOLESALE';
  setBusinessMode: (mode: 'RETAIL' | 'WHOLESALE') => void;
  login: (email: string, password: string, mode?: 'RETAIL' | 'WHOLESALE') => Promise<void>;
  logout: () => Promise<void>;
  toggleEnvironment: (env: 'local' | 'live') => void;
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine default environment based on localStorage or browser domain
  const [environment, setEnvState] = useState<'local' | 'live'>(() => {
    const saved = localStorage.getItem('api_environment') as 'local' | 'live' | null;
    if (saved === 'local' || saved === 'live') return saved;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
      if (!isLocalhost) return 'live';
    }
    return 'local';
  });

  const [businessModeState, setBusinessModeState] = useState<'RETAIL' | 'WHOLESALE'>(() => {
    return (localStorage.getItem('jms_business_mode') as 'RETAIL' | 'WHOLESALE') || 'RETAIL';
  });

  const setBusinessMode = (mode: 'RETAIL' | 'WHOLESALE') => {
    localStorage.setItem('jms_business_mode', mode);
    setBusinessModeState(mode);
    if (user) {
      setUser({ ...user, businessMode: mode });
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res?.success && res?.data) {
        const savedMode = (localStorage.getItem('jms_business_mode') as 'RETAIL' | 'WHOLESALE') || 'RETAIL';
        setUser({ ...res.data, businessMode: savedMode });
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [accessToken]);

  const login = async (email: string, password: string, mode?: 'RETAIL' | 'WHOLESALE') => {
    const chosenMode = mode || businessModeState;
    localStorage.setItem('jms_business_mode', chosenMode);
    setBusinessModeState(chosenMode);

    const res = await authApi.login(email, password);
    if (res?.success && res?.data) {
      const { accessToken: newAccess, refreshToken: newRefresh, user: userData } = res.data;
      const userWithMode = { ...userData, businessMode: chosenMode };
      localStorage.setItem('accessToken', newAccess);
      localStorage.setItem('refreshToken', newRefresh);
      localStorage.setItem('user', JSON.stringify(userWithMode));
      setAccessToken(newAccess);
      setUser(userWithMode);
    } else {
      throw new Error(res?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
    }
  };

  const toggleEnvironment = (env: 'local' | 'live') => {
    setEnvState(env);
    setApiEnvironment(env);
  };

  const hasPermission = (permissionKey: string): boolean => {
    if (!user || !user.permissions) return false;
    return checkPermission(user.permissions, permissionKey);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return checkAnyPermission(user.permissions, permissions);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return checkAllPermissions(user.permissions, permissions);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        environment,
        businessMode: businessModeState,
        setBusinessMode,
        login,
        logout,
        toggleEnvironment,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
