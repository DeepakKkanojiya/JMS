import { env } from './env';

export const serverConfig = {
  port: env.PORT,
  env: env.NODE_ENV,
  appName: env.APP_NAME,
  appUrl: env.APP_URL,
  frontendUrl: env.FRONTEND_URL,
  swaggerEnabled: env.SWAGGER_ENABLED,
  apiPrefix: '/api/v1',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProduction: env.NODE_ENV === 'production',
};
