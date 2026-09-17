import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_NAME: z.string().default('Jewellery ERP'),
  APP_URL: z.string().default('http://localhost:5000'),

  DATABASE_URL: z.string().default('postgresql://postgres:admin@localhost:5432/jewellery_erp?schema=iam'),

  JWT_SECRET: z.string().default('super_secret_jwt_key_jewellery_erp_2026'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  REFRESH_SECRET: z.string().default('super_secret_refresh_token_key_jewellery_erp_2026'),
  REFRESH_EXPIRES_IN: z.string().default('7d'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),

  UPLOAD_PATH: z.string().default('uploads'),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(5242880),

  SWAGGER_ENABLED: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true' || val === '1' || val === undefined),
});

/**
 * Validate process.env against the envSchema.
 * Halts execution with descriptive logs if validation fails.
 */
export const parseEnv = (overrideEnv?: Record<string, string | undefined>) => {
  const rawEnv = overrideEnv || process.env;
  const targetEnv = {
    ...rawEnv,
    DATABASE_URL: rawEnv.DATABASE_URL || rawEnv.PGURL || 'postgresql://postgres:admin@localhost:5432/jewellery_erp?schema=iam',
    JWT_SECRET: rawEnv.JWT_SECRET || rawEnv.JWT_TOKEN_SECRET || 'super_secret_jwt_key_jewellery_erp_2026',
    REFRESH_SECRET: rawEnv.REFRESH_SECRET || rawEnv.REFRESH_TOKEN_SECRET || 'super_secret_refresh_token_key_jewellery_erp_2026',
    FRONTEND_URL: rawEnv.FRONTEND_URL || rawEnv.CORS_ORIGIN || 'http://localhost:5173',
    SWAGGER_ENABLED: rawEnv.SWAGGER_ENABLED !== undefined ? rawEnv.SWAGGER_ENABLED : 'true',
  };

  const result = envSchema.safeParse(targetEnv);

  if (!result.success) {
    console.error('[ERROR] Environment validation failed:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    if (!overrideEnv) {
      process.exit(1);
    } else {
      throw new Error('Environment validation failed');
    }
  }

  return result.data;
};

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;
