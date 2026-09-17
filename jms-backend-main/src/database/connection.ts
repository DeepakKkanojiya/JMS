import { prisma } from './client';
import { databaseLogger } from '../logger';

/**
 * Establish connection to the PostgreSQL database.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    databaseLogger.logDatabaseEvent('CONNECTED', 'PostgreSQL database connected successfully.');
    console.log('[INFO] PostgreSQL database connected successfully.');
  } catch (error) {
    databaseLogger.logDatabaseEvent('ERROR', 'Database connection failed.', error);
    console.error('[ERROR] Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from the PostgreSQL database gracefully.
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    databaseLogger.logDatabaseEvent('DISCONNECTED', 'PostgreSQL database disconnected.');
    console.log('[INFO] PostgreSQL database disconnected.');
  } catch (error) {
    databaseLogger.logDatabaseEvent('ERROR', 'Database disconnect error.', error);
    console.error('[ERROR] Database disconnect error:', error);
  }
};
