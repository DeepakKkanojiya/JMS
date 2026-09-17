export interface CreateUserPayload {
  roleId: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobile?: string;
  password: string;
  employeeCode?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
  roleId?: string;
  status?: string;
}

export interface UserQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface ChangeRolePayload {
  roleId: string;
}

export interface UserResponse {
  id: string;
  employeeCode?: string | null;
  firstName: string;
  lastName?: string | null;
  name: string;
  email: string;
  mobile?: string | null;
  avatarUrl?: string | null;
  status: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    displayName: string;
  };
  lastLoginAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
