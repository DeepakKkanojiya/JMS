import { serverConfig } from './server';
import { databaseConfig } from './database';
import { jwtConfig } from './jwt';
import { loggerConfig } from './logger';

export const config = {
  server: serverConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  logger: loggerConfig,
};


function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '*****';
    }
    return parsed.toString();
  } catch {
    return 'postgresql://*****@...';
  }
}


export const printStartupSummary = (): void => {
  console.log('========================================');
  console.log('[CONFIG] Server Configuration Loaded');
  console.log('----------------------------------------');
  console.log(`Environment : ${config.server.env}`);
  console.log(`Port        : ${config.server.port}`);
  console.log(`App URL     : ${config.server.appUrl}`);
  console.log(`Database    : ${maskDatabaseUrl(config.database.url)}`);
  console.log(`Swagger     : ${config.server.swaggerEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`Log Level   : ${config.logger.level}`);
  console.log('========================================');
};

export { serverConfig, databaseConfig, jwtConfig, loggerConfig };
