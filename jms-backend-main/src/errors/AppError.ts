export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[];
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: any[],
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
