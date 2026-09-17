import { prisma } from '../../database';
import { CreateRolePayload, UpdateRolePayload, RoleQueryFilter } from './role.types';

export class RoleRepository {
  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name: name.toUpperCase() },
    });
  }

  async create(payload: CreateRolePayload) {
    return prisma.role.create({
      data: {
        name: payload.name.trim().toUpperCase(),
        displayName: payload.displayName.trim(),
        description: payload.description || null,
        isActive: true,
      },
    });
  }

  async update(id: string, payload: UpdateRolePayload) {
    return prisma.role.update({
      where: { id },
      data: {
        ...(payload.displayName && { displayName: payload.displayName }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      },
    });
  }

  async delete(id: string) {
    return prisma.role.delete({
      where: { id },
    });
  }

  async countUsersAssigned(roleId: string) {
    return prisma.user.count({
      where: { roleId },
    });
  }

  async findMany(filters: RoleQueryFilter) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.isActive = filters.status.toUpperCase() === 'ACTIVE';
    }

    if (filters.search) {
      const searchStr = filters.search.trim();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { displayName: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const sortField = filters.sort || 'createdAt';
    const sortOrder = filters.order || 'desc';

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          _count: { select: { users: true } },
          rolePermissions: { include: { permission: true } },
        },
      }),
      prisma.role.count({ where }),
    ]);

    return {
      data: roles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPermissionsByRole(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    return prisma.$transaction(async (tx) => {
      // Delete old mapping
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Insert new mapping
      const data = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));

      await tx.rolePermission.createMany({
        data,
      });

      return tx.rolePermission.findMany({
        where: { roleId },
        include: { permission: true },
      });
    });
  }

  async removeSinglePermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  async findAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }
}

export const roleRepository = new RoleRepository();
