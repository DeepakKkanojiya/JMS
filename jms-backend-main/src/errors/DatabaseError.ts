import { AppError } from './AppError';

export class DatabaseError extends AppError {
  constructor(message: string = 'Database unavailable', details?: any) {
    super(message, 500, undefined, details);
  }
}
