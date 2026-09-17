import { roleRepository, RoleRepository } from './role.repository';
import { CreateRolePayload, UpdateRolePayload, AssignPermissionsPayload, RoleQueryFilter } from './role.types';
import { ConflictError, NotFoundError, ValidationError } from '../../errors';
import { prisma } from '../../database';

export class RoleService {
  constructor(private repo: RoleRepository = roleRepository) {}

  private formatRoleResponse(role: any) {
    const permissions = role.rolePermissions
      ? role.rolePermissions.map((rp: any) => ({
          id: rp.permission.id,
          module: rp.permission.module,
          action: rp.permission.action,
          permissionKey: rp.permission.permissionKey,
          description: rp.permission.description,
        }))
      : undefined;

    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      usersCount: role._count?.users ?? 0,
      permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async createRole(payload: CreateRolePayload) {
    const roleName = payload.name.trim().toUpperCase();
    const existing = await this.repo.findByName(roleName);
    if (existing) {
      throw new ConflictError('Role name already exists');
    }

    const role = await this.repo.create(payload);
    return this.formatRoleResponse(role);
  }

  async getRoles(filters: RoleQueryFilter) {
    const result = await this.repo.findMany(filters);
    return {
      data: result.data.map((r) => this.formatRoleResponse(r)),
      pagination: result.pagination,
    };
  }

  async getRoleById(id: string) {
    const role = await this.repo.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return this.formatRoleResponse(role);
  }

  async updateRole(id: string, payload: UpdateRolePayload) {
    const role = await this.repo.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    const updated = await this.repo.update(id, payload);
    return this.formatRoleResponse(updated);
  }

  async deleteRole(id: string) {
    const role = await this.repo.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.name === 'OWNER' || role.name === 'ADMIN') {
      throw new ValidationError(`Cannot Delete ${role.name} Role`);
    }

    const assignedUsersCount = await this.repo.countUsersAssigned(id);
    if (assignedUsersCount > 0) {
      throw new ValidationError('Cannot Delete Role Assigned To Users');
    }

    await this.repo.delete(id);
    return { success: true, message: 'Role deleted successfully' };
  }

  async getRolePermissions(roleId: string) {
    const role = await this.repo.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    const rolePermissions = await this.repo.findPermissionsByRole(roleId);
    return rolePermissions.map((rp) => ({
      id: rp.permission.id,
      module: rp.permission.module,
      action: rp.permission.action,
      permissionKey: rp.permission.permissionKey,
      description: rp.permission.description,
    }));
  }

  async assignPermissions(roleId: string, payload: AssignPermissionsPayload) {
    const role = await this.repo.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Verify all permission IDs exist
    const validPermissions = await prisma.permission.findMany({
      where: { id: { in: payload.permissionIds } },
    });

    if (validPermissions.length !== payload.permissionIds.length) {
      throw new ValidationError('One or more invalid permission IDs provided');
    }

    const updatedRolePermissions = await this.repo.assignPermissions(roleId, payload.permissionIds);
    return {
      success: true,
      message: 'Permissions assigned successfully',
      data: updatedRolePermissions.map((rp) => rp.permission.permissionKey),
    };
  }

  async removeSinglePermission(roleId: string, permissionId: string) {
    const role = await this.repo.findById(roleId);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    try {
      await this.repo.removeSinglePermission(roleId, permissionId);
      return { success: true, message: 'Permission removed successfully' };
    } catch {
      throw new NotFoundError('Permission mapping not found for this role');
    }
  }

  async getAllPermissions() {
    const permissions = await this.repo.findAllPermissions();
    return permissions;
  }
}

export const roleService = new RoleService();
