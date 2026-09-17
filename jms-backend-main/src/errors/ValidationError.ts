import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(message, 400, errors);
  }
}
