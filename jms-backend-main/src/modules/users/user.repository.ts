import { prisma } from '../../database';
import { CreateUserPayload, UpdateUserPayload, UserQueryFilter } from './user.types';

export class UserRepository {
  /**
   * Find user by ID including role and employee details
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        employee: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true, employee: true },
    });
  }

  /**
   * Find user by mobile number
   */
  async findByMobile(mobile: string) {
    return prisma.user.findFirst({
      where: { mobile },
      include: { role: true, employee: true },
    });
  }

  /**
   * Find user by employee code
   */
  async findByEmployeeCode(employeeCode: string) {
    return prisma.user.findFirst({
      where: { employee: { employeeCode } },
      include: { role: true, employee: true },
    });
  }

  /**
   * Create new user record in iam.users
   */
  async create(data: CreateUserPayload & { passwordHash: string; employeeId?: string | null; createdBy?: string | null }) {
    return prisma.user.create({
      data: {
        roleId: data.roleId,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email.toLowerCase(),
        mobile: data.mobile || null,
        passwordHash: data.passwordHash,
        employeeId: data.employeeId || null,
        createdBy: data.createdBy || null,
        status: 'ACTIVE',
      },
      include: {
        role: true,
        employee: true,
      },
    });
  }

  /**
   * Update existing user record
   */
  async update(id: string, data: UpdateUserPayload & { passwordHash?: string; updatedBy?: string | null }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.mobile !== undefined && { mobile: data.mobile }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.roleId && { roleId: data.roleId }),
        ...(data.status && { status: data.status }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
        ...(data.updatedBy !== undefined && { updatedBy: data.updatedBy }),
      },
      include: {
        role: true,
        employee: true,
      },
    });
  }

  /**
   * Update user status (Activate / Deactivate)
   */
  async updateStatus(id: string, status: string, updatedBy?: string | null) {
    return prisma.user.update({
      where: { id },
      data: { status, updatedBy },
      include: { role: true, employee: true },
    });
  }

  /**
   * Delete user record (or soft delete by setting INACTIVE)
   */
  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Count total active users assigned to a specific role
   */
  async countUsersByRoleId(roleId: string) {
    return prisma.user.count({
      where: { roleId },
    });
  }

  /**
   * List users with pagination, search, role, status filters
   */
  async findMany(filters: UserQueryFilter) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.role) {
      where.role = {
        name: filters.role.toUpperCase(),
      };
    }

    if (filters.search) {
      const searchStr = filters.search.trim();
      where.OR = [
        { firstName: { contains: searchStr, mode: 'insensitive' } },
        { lastName: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { mobile: { contains: searchStr } },
        { employee: { employeeCode: { contains: searchStr, mode: 'insensitive' } } },
      ];
    }

    const sortField = filters.sort || 'createdAt';
    const sortOrder = filters.order || 'desc';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: { role: true, employee: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const userRepository = new UserRepository();
