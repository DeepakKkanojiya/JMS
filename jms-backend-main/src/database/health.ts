import { prisma } from './client';

export interface DatabaseHealthResult {
  healthy: boolean;
  status: 'connected' | 'disconnected';
  error?: string;
}

/**
 * Check health status of PostgreSQL database connection.
 */
export const checkDatabaseHealth = async (): Promise<DatabaseHealthResult> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      status: 'connected',
    };
  } catch (error: any) {
    return {
      healthy: false,
      status: 'disconnected',
      error: error.message || 'Database query failed',
    };
  }
};
