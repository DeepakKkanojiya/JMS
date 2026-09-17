import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshSecret: env.REFRESH_SECRET,
  refreshExpiresIn: env.REFRESH_EXPIRES_IN,
};
