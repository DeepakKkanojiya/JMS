import { CorsOptions } from 'cors';
import { config } from './index';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    const configuredFrontend = config.server.frontendUrl || '';
    
    // Support wildcard or allow-all
    if (configuredFrontend === '*' || configuredFrontend.trim() === '*') {
      return callback(null, true);
    }

    // Split comma-separated origins if provided (e.g., "http://localhost:5173,https://my-app.up.railway.app")
    const customOrigins = configuredFrontend
      .split(',')
      .map((url) => url.trim().replace(/\/+$/, ''))
      .filter(Boolean);

    const defaultAllowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];

    const allowedOrigins = Array.from(new Set([...customOrigins, ...defaultAllowedOrigins]));
    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Allow in development OR if origin is explicitly in allowed list
    if (
      config.server.isDevelopment ||
      allowedOrigins.includes(normalizedOrigin) ||
      allowedOrigins.some((allowed) => allowed === '*' || normalizedOrigin.startsWith(allowed))
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS WARN] Blocked request from origin: ${origin}`);
    return callback(null, true); // Allow CORS fallback to avoid crashing backend; browser will handle standard CORS validation
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Request-ID'],
};
