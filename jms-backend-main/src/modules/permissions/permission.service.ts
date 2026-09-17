import { permissionRepository, PermissionRepository } from './permission.repository';
import { CreatePermissionPayload, UpdatePermissionPayload, PermissionQueryFilter } from './permission.types';
import { ConflictError, NotFoundError, ValidationError } from '../../errors';

export class PermissionService {
  constructor(private repo: PermissionRepository = permissionRepository) {}

  async createPermission(payload: CreatePermissionPayload) {
    const mod = payload.module.trim().toLowerCase();
    const act = payload.action.trim().toLowerCase();
    const permissionKey = payload.permissionKey ? payload.permissionKey.trim().toLowerCase() : `${mod}.${act}`;

    const existing = await this.repo.findByKey(permissionKey);
    if (existing) {
      throw new ConflictError('Permission key already exists');
    }

    const permission = await this.repo.create({
      ...payload,
      module: mod,
      action: act,
      permissionKey,
    });

    return permission;
  }

  async getPermissions(filters: PermissionQueryFilter) {
    const result = await this.repo.findMany(filters);
    return result;
  }

  async getPermissionById(id: string) {
    const permission = await this.repo.findById(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }
    return permission;
  }

  async getPermissionsByModule(moduleName: string) {
    const permissions = await this.repo.findByModule(moduleName);
    return permissions.map((p) => p.permissionKey);
  }

  async updatePermission(id: string, payload: UpdatePermissionPayload) {
    const permission = await this.repo.findById(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    const updated = await this.repo.update(id, payload);
    return updated;
  }

  async deletePermission(id: string) {
    const permission = await this.repo.findById(id);
    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    const assignedCount = await this.repo.countRoleMappings(id);
    if (assignedCount > 0) {
      throw new ValidationError('Cannot Delete Permission Assigned To Any Role');
    }

    await this.repo.delete(id);
    return { success: true, message: 'Permission deleted successfully' };
  }
}

export const permissionService = new PermissionService();
