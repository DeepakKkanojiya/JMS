import { env } from './env';

export const databaseConfig = {
  url: env.DATABASE_URL,
  provider: 'postgresql',
  connectionTimeout: 10000,
  poolSize: env.NODE_ENV === 'production' ? 20 : 5,
};
