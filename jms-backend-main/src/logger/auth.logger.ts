import { logger } from './logger';

export type AuthAction = 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'REFRESH_TOKEN';

export interface AuthLogDetails {
  email?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export class AuthLogger {
  public logAuthEvent(
    action: AuthAction,
    status: 'SUCCESS' | 'FAILED',
    details: AuthLogDetails,
    requestId?: string
  ): void {
    const userIdentifier = details.email || details.userId || 'Unknown User';
    const reasonStr = details.reason ? ` | Reason: ${details.reason}` : '';
    const level = status === 'SUCCESS' ? 'INFO' : 'WARN';

    logger.log(
      level,
      `AUTH_EVENT | User: ${userIdentifier} | Action: ${action} | Status: ${status}${reasonStr}`,
      'application',
      requestId,
      {
        ip: details.ipAddress,
        agent: details.userAgent,
      }
    );
  }
}

export const authLogger = new AuthLogger();
