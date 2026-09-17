export interface AuthUserPayload {
  userId: string;
  roleId: string;
  role: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  businessType?: 'RETAIL' | 'WHOLESALE';
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken?: string;
}

export interface AuthUserResponse {
  id: string;
  name: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  role: string;
  roleId: string;
  status: string;
  businessType?: 'RETAIL' | 'WHOLESALE';
  requiresModeSelection?: boolean;
  availableModes?: string[];
  dashboardConfig?: {
    type: 'RETAIL' | 'WHOLESALE' | 'FULL_ADMIN';
    features: string[];
  };
  employeeCode?: string | null;
  lastLoginAt?: Date | null;
  permissions?: string[];
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponse;
}

export interface RefreshResponseData {
  accessToken: string;
}

export interface CreateActivityLogParams {
  userId?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: string;
}
