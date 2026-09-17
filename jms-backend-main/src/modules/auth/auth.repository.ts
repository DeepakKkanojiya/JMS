import { prisma } from '../../database';
import { CreateActivityLogParams } from './auth.types';

export class AuthRepository {
  /**
   * Find user by email including role relation from iam schema
   */
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * Find user by ID including role relation from iam schema
   */
  async findUserById(userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * Update user's last_login_at timestamp in iam.users
   */
  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Store active refresh token session in iam.user_sessions
   */
  async saveUserSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    device?: string | null,
    browser?: string | null,
    ipAddress?: string | null
  ) {
    return prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        device: device || null,
        browser: browser || null,
        ipAddress: ipAddress || null,
      },
    });
  }

  /**
   * Find stored refresh token session in iam.user_sessions
   */
  async findUserSession(refreshToken: string) {
    return prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Delete single user session from iam.user_sessions
   */
  async deleteUserSession(refreshToken: string) {
    return prisma.userSession.deleteMany({
      where: { refreshToken },
    });
  }

  /**
   * Delete all sessions for user from iam.user_sessions
   */
  async deleteUserSessionsByUserId(userId: string) {
    return prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  /**
   * Record login entry in iam.login_history
   */
  async createLoginHistory(
    userId: string,
    status: string = 'SUCCESS',
    ipAddress?: string | null,
    device?: string | null,
    browser?: string | null
  ) {
    return prisma.loginHistory.create({
      data: {
        userId,
        status,
        ipAddress: ipAddress || null,
        device: device || null,
        browser: browser || null,
      },
    });
  }

  /**
   * Record activity log entry for audit logging
   */
  async createActivityLog(params: CreateActivityLogParams) {
    if (!params.userId) return null;
    return prisma.loginHistory.create({
      data: {
        userId: params.userId,
        status: params.status,
        ipAddress: params.ipAddress || null,
        device: params.userAgent || null,
      },
    });
  }
}

export const authRepository = new AuthRepository();
