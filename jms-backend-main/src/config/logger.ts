import { env } from './env';

export const loggerConfig = {
  level: env.LOG_LEVEL,
  uploadPath: env.UPLOAD_PATH,
  maxFileSize: env.MAX_FILE_SIZE,
};
