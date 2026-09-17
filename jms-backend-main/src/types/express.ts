import { AuthUserPayload } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      file?: any;
      files?: any;
      requestId?: string;
    }
  }
}
