export interface CreateRolePayload {
  name: string;
  displayName: string;
  description?: string;
}

export interface UpdateRolePayload {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignPermissionsPayload {
  permissionIds: string[];
}

export interface RoleQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface RoleResponse {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isActive: boolean;
  usersCount?: number;
  permissions?: Array<{
    id: string;
    module: string;
    action: string;
    permissionKey: string;
    description?: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
