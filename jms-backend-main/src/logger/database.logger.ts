import { logger } from './logger';

export type DatabaseAction = 'CONNECTED' | 'DISCONNECTED' | 'MIGRATION' | 'SEED' | 'ERROR';

export class DatabaseLogger {
  public logDatabaseEvent(
    action: DatabaseAction,
    message: string,
    errorDetails?: any
  ): void {
    const level = action === 'ERROR' ? 'ERROR' : 'INFO';
    const target = action === 'ERROR' ? 'error' : 'application';

    logger.log(
      level,
      `DATABASE_EVENT | Action: ${action} | Message: ${message}`,
      target,
      undefined,
      errorDetails
    );
  }
}

export const databaseLogger = new DatabaseLogger();
