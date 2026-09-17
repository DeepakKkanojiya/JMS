import { env } from './env';

const isDev = env.NODE_ENV === 'development';

export const securityConfig = {
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDev ? 1000 : 10, // 1000 attempts in dev mode, 10 in production
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per 15 minutes for general APIs
      message: 'Too many requests, please try again later.',
    },
  },
  uploads: {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ],
    blockedExtensions: ['.exe', '.bat', '.sh', '.js', '.cmd', '.php', '.dll', '.scr', '.vbs'],
  },
  headers: {
    frameOptions: 'DENY',
    contentTypeOptions: 'nosniff',
    hstsMaxAge: 31536000, 
    hidePoweredBy: true,
  },
};
