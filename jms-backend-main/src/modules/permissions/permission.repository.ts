import { prisma } from '../../database';
import { CreatePermissionPayload, UpdatePermissionPayload, PermissionQueryFilter } from './permission.types';

export class PermissionRepository {
  async findById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
    });
  }

  async findByKey(permissionKey: string) {
    return prisma.permission.findUnique({
      where: { permissionKey },
    });
  }

  async create(payload: CreatePermissionPayload & { permissionKey: string }) {
    return prisma.permission.create({
      data: {
        module: payload.module.toLowerCase(),
        action: payload.action.toLowerCase(),
        permissionKey: payload.permissionKey,
        description: payload.description || null,
      },
    });
  }

  async update(id: string, payload: UpdatePermissionPayload) {
    return prisma.permission.update({
      where: { id },
      data: {
        ...(payload.description !== undefined && { description: payload.description }),
      },
    });
  }

  async delete(id: string) {
    return prisma.permission.delete({
      where: { id },
    });
  }

  async countRoleMappings(permissionId: string) {
    return prisma.rolePermission.count({
      where: { permissionId },
    });
  }

  async findByModule(moduleName: string) {
    return prisma.permission.findMany({
      where: { module: moduleName.toLowerCase() },
      orderBy: { action: 'asc' },
    });
  }

  async findMany(filters: PermissionQueryFilter) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.module) {
      where.module = filters.module.toLowerCase();
    }

    if (filters.action) {
      where.action = filters.action.toLowerCase();
    }

    if (filters.search) {
      const searchStr = filters.search.trim();
      where.OR = [
        { module: { contains: searchStr, mode: 'insensitive' } },
        { action: { contains: searchStr, mode: 'insensitive' } },
        { permissionKey: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const sortField = filters.sort || 'module';
    const sortOrder = filters.order || 'asc';

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortField]: sortOrder }, { action: 'asc' }],
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      data: permissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const permissionRepository = new PermissionRepository();
