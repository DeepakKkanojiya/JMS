import bcrypt from 'bcryptjs';
import { userRepository, UserRepository } from './user.repository';
import { CreateUserPayload, UpdateUserPayload, UserQueryFilter, ChangePasswordPayload, ResetPasswordPayload } from './user.types';
import { ConflictError, NotFoundError, ValidationError, UnauthorizedError } from '../../errors';
import { prisma } from '../../database';

export class UserService {
  constructor(private repo: UserRepository = userRepository) {}

  private formatUserResponse(user: any) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.firstName;
    return {
      id: user.id,
      employeeCode: user.employee?.employeeCode || null,
      firstName: user.firstName,
      lastName: user.lastName,
      name: fullName,
      email: user.email,
      mobile: user.mobile,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name,
        displayName: user.role.displayName,
      },
      lastLoginAt: user.lastLoginAt,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(payload: CreateUserPayload, createdByUserId?: string) {
    // 1. Check duplicate email
    const existingEmail = await this.repo.findByEmail(payload.email);
    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    // 2. Check duplicate mobile if provided
    if (payload.mobile) {
      const existingMobile = await this.repo.findByMobile(payload.mobile);
      if (existingMobile) {
        throw new ConflictError('Mobile number already exists');
      }
    }

    // 3. Verify Role existence
    const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(payload.password, 10);

    let employeeId: string | null = null;
    if (payload.employeeCode) {
      const emp = await prisma.employee.findFirst({ where: { employeeCode: payload.employeeCode } });
      if (!emp) {
        throw new NotFoundError(`Employee with code '${payload.employeeCode}' not found`);
      }
      employeeId = emp.id;
    }

    // 5. Insert user record
    const user = await this.repo.create({
      ...payload,
      passwordHash,
      employeeId,
      createdBy: createdByUserId,
    });

    return this.formatUserResponse(user);
  }

  async getUsers(filters: UserQueryFilter) {
    const result = await this.repo.findMany(filters);
    return {
      data: result.data.map((u) => this.formatUserResponse(u)),
      pagination: result.pagination,
    };
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.formatUserResponse(user);
  }

  async updateUser(id: string, payload: UpdateUserPayload, updatedByUserId?: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (payload.email && payload.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await this.repo.findByEmail(payload.email);
      if (existing) {
        throw new ConflictError('Email already exists');
      }
    }

    if (payload.mobile && payload.mobile !== user.mobile) {
      const existing = await this.repo.findByMobile(payload.mobile);
      if (existing) {
        throw new ConflictError('Mobile number already exists');
      }
    }

    if (payload.roleId) {
      const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    const updated = await this.repo.update(id, {
      ...payload,
      updatedBy: updatedByUserId,
    });

    return this.formatUserResponse(updated);
  }

  async deleteUser(id: string, currentUserId: string) {
    // 1. Self deletion protection
    if (id === currentUserId) {
      throw new ValidationError('Owner cannot delete self');
    }

    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Last Owner protection
    if (user.role.name === 'OWNER') {
      const ownerCount = await prisma.user.count({
        where: {
          role: { name: 'OWNER' },
        },
      });
      if (ownerCount <= 1) {
        throw new ValidationError('Cannot delete the last Owner account');
      }
    }

    // Revoke user sessions
    await prisma.userSession.deleteMany({ where: { userId: id } });

    // Delete user
    await this.repo.delete(id);
    return { success: true, message: 'User deleted successfully' };
  }

  async activateUser(id: string, updatedByUserId?: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const updated = await this.repo.updateStatus(id, 'ACTIVE', updatedByUserId);
    return this.formatUserResponse(updated);
  }

  async deactivateUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ValidationError('Cannot deactivate yourself');
    }
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role.name === 'OWNER') {
      const ownerCount = await prisma.user.count({
        where: { role: { name: 'OWNER' }, status: 'ACTIVE' },
      });
      if (ownerCount <= 1) {
        throw new ValidationError('Cannot deactivate the last active Owner account');
      }
    }

    // Revoke sessions
    await prisma.userSession.deleteMany({ where: { userId: id } });

    const updated = await this.repo.updateStatus(id, 'INACTIVE', currentUserId);
    return this.formatUserResponse(updated);
  }

  async changeUserRole(id: string, roleId: string, updatedByUserId?: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    const updated = await this.repo.update(id, { roleId, updatedBy: updatedByUserId });
    return this.formatUserResponse(updated);
  }

  async changePassword(userId: string, payload: ChangePasswordPayload) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(payload.newPassword, 10);
    await this.repo.update(userId, { passwordHash: newPasswordHash, updatedBy: userId });

    return { success: true, message: 'Password changed successfully' };
  }

  async resetPassword(targetUserId: string, payload: ResetPasswordPayload, adminUserId: string) {
    const user = await this.repo.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const newPasswordHash = await bcrypt.hash(payload.newPassword, 10);
    await this.repo.update(targetUserId, { passwordHash: newPasswordHash, updatedBy: adminUserId });

    // Revoke active sessions for security
    await prisma.userSession.deleteMany({ where: { userId: targetUserId } });

    return { success: true, message: 'Password reset successfully' };
  }

  async getUserProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    const permissions = rolePermissions.map((rp) => rp.permission.permissionKey);

    return {
      user: this.formatUserResponse(user),
      permissions,
    };
  }
}

export const userService = new UserService();
