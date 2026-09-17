export interface CreatePermissionPayload {
  module: string;
  action: string;
  permissionKey?: string;
  description?: string;
}

export interface UpdatePermissionPayload {
  description?: string;
}

export interface PermissionQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  action?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PermissionResponse {
  id: string;
  module: string;
  action: string;
  permissionKey: string;
  description?: string | null;
  createdAt: Date;
}
