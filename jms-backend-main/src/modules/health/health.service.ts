import { prisma } from '../../database';
import { config } from '../../config';
import { logger } from '../../logger';
import {
  HealthCheckResponse,
  ReadinessResponse,
  LivenessResponse,
  DatabaseHealthInfo,
} from './health.types';

export class HealthService {
  /**
   * Simple database connectivity check executing `SELECT 1`
   */
  private async checkDatabase(): Promise<DatabaseHealthInfo> {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTimeMs = Date.now() - startTime;
      return {
        status: 'UP',
        responseTimeMs,
      };
    } catch (err: any) {
      logger.error('Database health check failed', 'error', undefined, { error: err.message });
      return {
        status: 'DOWN',
        error: 'Database connection failed',
      };
    }
  }

  /**
   * Complete application & database health check
   */
  public async getHealth(): Promise<HealthCheckResponse> {
    const dbHealth = await this.checkDatabase();
    const isHealthy = dbHealth.status === 'UP';

    return {
      success: isHealthy,
      status: isHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
      environment: config.server.env,
      database: dbHealth,
    };
  }

  /**
   * Kubernetes / Load Balancer Readiness Check
   */
  public async getReadiness(): Promise<ReadinessResponse> {
    const dbHealth = await this.checkDatabase();
    const isReady = dbHealth.status === 'UP';

    return {
      success: isReady,
      ready: isReady,
      timestamp: new Date().toISOString(),
      database: dbHealth,
    };
  }

  /**
   * Lightweight Liveness Probe (Does NOT query database)
   */
  public getLiveness(): LivenessResponse {
    return {
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}

export const healthService = new HealthService();
