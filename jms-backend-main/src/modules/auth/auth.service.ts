import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { authRepository, AuthRepository } from './auth.repository';
import { LoginPayload, RefreshTokenPayload, LogoutPayload, AuthUserResponse } from './auth.types';
import { UnauthorizedError, ForbiddenError } from '../../errors';
import { prisma } from '../../database';

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  /**
   * Helper to format User model to AuthUserResponse
   */
  private async formatUserResponse(user: any, businessType: 'RETAIL' | 'WHOLESALE' = 'RETAIL'): Promise<AuthUserResponse> {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.firstName;
    
    let permissions: string[] = [];
    if (user.role?.name === 'OWNER') {
      const allPerms = await prisma.permission.findMany({ select: { permissionKey: true } });
      permissions = allPerms.map((p) => p.permissionKey);
    } else if (user.roleId) {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: user.roleId },
        include: { permission: true },
      });
      permissions = rolePermissions.map((rp) => rp.permission.permissionKey);
    }

    const userRole = user.role?.name || user.role;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    const retailFeatures = [
      'pos_billing',
      'barcode_scanner',
      'customer_loyalty',
      'old_gold_exchange',
      'retail_making_charges',
      'daily_metal_rates',
    ];

    const wholesaleFeatures = [
      'bulk_purchase_orders',
      'vendor_debit_notes',
      'karigar_job_work',
      'bulk_stock_vault',
      'weight_purity_settlements',
      'vendor_ledger_payments',
    ];

    const fullAdminFeatures = [
      ...retailFeatures,
      ...wholesaleFeatures,
      'live_market_benchmark_prices',
      'system_settings',
      'user_permission_management',
      'master_data_management',
    ];

    let dashboardType: 'RETAIL' | 'WHOLESALE' | 'FULL_ADMIN' = businessType;
    let features = businessType === 'WHOLESALE' ? wholesaleFeatures : retailFeatures;

    if (isAdmin) {
      dashboardType = 'FULL_ADMIN';
      features = fullAdminFeatures;
    }

    return {
      id: user.id,
      name: fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: userRole,
      roleId: user.roleId,
      status: user.status,
      businessType: isAdmin ? undefined : businessType,
      requiresModeSelection: !isAdmin,
      availableModes: isAdmin ? ['FULL_ADMIN'] : ['RETAIL', 'WHOLESALE'],
      dashboardConfig: {
        type: dashboardType,
        features,
      },
      employeeCode: user.employeeCode,
      lastLoginAt: user.lastLoginAt,
      permissions,
    };
  }

  /**
   * Helper to parse user agent string into device and browser
   */
  private parseUserAgent(userAgent?: string): { device: string; browser: string } {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown' };
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Postman')) browser = 'PostmanRuntime';

    let device = 'Desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      device = 'Mobile';
    }
    return { device, browser };
  }

  /**
   * Authenticate user with email & password against iam.users
   */
  async login(payload: LoginPayload, ipAddress?: string, userAgent?: string) {
    const email = payload.email.trim().toLowerCase();

    // 1. Find user by email
    const user = await this.repo.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Verify account status
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Your account has been disabled.');
    }

    // 3. Compare password hash
    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 4. Generate JWT Tokens
    const activeMode = payload.businessType || 'RETAIL';
    const accessTokenPayload = {
      userId: user.id,
      roleId: user.roleId,
      role: user.role.name,
      email: user.email,
      activeMode,
    };

    const accessToken = jwt.sign(accessTokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    const refreshTokenPayload = {
      userId: user.id,
      type: 'refresh',
      nonce: `${Date.now()}-${Math.random()}`,
    };

    const refreshToken = jwt.sign(refreshTokenPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });

    // Calculate refresh token expiry (7 days default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { device, browser } = this.parseUserAgent(userAgent);

    // 5. Store session in iam.user_sessions
    await this.repo.saveUserSession(
      user.id,
      refreshToken,
      expiresAt,
      device,
      browser,
      ipAddress
    );

    // 6. Update last_login_at timestamp in iam.users
    await this.repo.updateLastLogin(user.id);

    // 7. Insert audit entry in iam.login_history
    await this.repo.createLoginHistory(user.id, 'SUCCESS', ipAddress, device, browser);

    return {
      accessToken,
      refreshToken,
      user: await this.formatUserResponse(user, payload.businessType || 'RETAIL'),
    };
  }

  /**
   * Refresh JWT access token using valid refresh token
   */
  async refreshToken(payload: RefreshTokenPayload) {
    const { refreshToken } = payload;

    // Verify JWT refresh token signature
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      throw new UnauthorizedError('Token expired.');
    }

    // Find session record in iam.user_sessions
    const session = await this.repo.findUserSession(refreshToken);
    if (!session || !session.user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      await this.repo.deleteUserSession(refreshToken);
      throw new UnauthorizedError('Token expired.');
    }

    // Verify user account status
    if (session.user.status !== 'ACTIVE') {
      throw new ForbiddenError('Your account has been disabled.');
    }

    // Issue new Access Token
    const accessTokenPayload = {
      userId: session.user.id,
      roleId: session.user.roleId,
      role: session.user.role.name,
      email: session.user.email,
    };

    const accessToken = jwt.sign(accessTokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    return { accessToken };
  }

  /**
   * Logout user by revoking session
   */
  async logout(payload: LogoutPayload, userId?: string) {
    if (payload.refreshToken) {
      await this.repo.deleteUserSession(payload.refreshToken);
    } else if (userId) {
      await this.repo.deleteUserSessionsByUserId(userId);
    }
    return { success: true, message: 'Logout successful' };
  }

  /**
   * Fetch current user profile by user ID
   */
  async getCurrentUser(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Your account has been disabled.');
    }
    return await this.formatUserResponse(user);
  }
}

export const authService = new AuthService();
