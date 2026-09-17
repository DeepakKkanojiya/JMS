import fs from 'fs';
import path from 'path';
import { config } from '../config';

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export type LogTarget = 'access' | 'error' | 'application';

const SENSITIVE_KEYS_REGEX = /password|token|secret|aadhaar|pan|otp|creditcard|authorization/i;

/**
 * Mask sensitive data inside objects prior to logging.
 */
export function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  if (typeof data === 'object') {
    const masked: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS_REGEX.test(key)) {
        masked[key] = '***MASKED***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  return data;
}

export class Logger {
  private logsDir: string;

  constructor() {
    this.logsDir = path.resolve(process.cwd(), 'logs');
    this.ensureLogsDirectory();
  }

  /**
   * Ensure logs/ directory exists
   */
  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Append log string entry to specified target file
   */
  private writeToFile(target: LogTarget, entry: string): void {
    try {
      this.ensureLogsDirectory();
      const filePath = path.join(this.logsDir, `${target}.log`);
      fs.appendFileSync(filePath, entry + '\n', 'utf8');
    } catch (err) {
      console.error(`[LOGGER_ERROR] Failed to write log to file ${target}.log:`, err);
    }
  }

  /**
   * Build clean log string entry
   */
  private formatLog(
    level: LogLevel,
    message: string,
    requestId?: string,
    metadata?: any
  ): string {
    const timestamp = new Date().toISOString();
    const reqIdStr = requestId ? `[${requestId}] ` : '';
    let metaStr = '';

    if (metadata !== undefined && metadata !== null) {
      const sanitizedMeta = maskSensitiveData(metadata);
      metaStr = typeof sanitizedMeta === 'object' ? ` ${JSON.stringify(sanitizedMeta)}` : ` ${sanitizedMeta}`;
    }

    return `[${timestamp}] [${level}] ${reqIdStr}${message}${metaStr}`;
  }

  /**
   * Log entry to console and target file
   */
  public log(
    level: LogLevel,
    message: string,
    target: LogTarget = 'application',
    requestId?: string,
    metadata?: any
  ): void {
    const formatted = this.formatLog(level, message, requestId, metadata);

    // Persist to file
    this.writeToFile(target, formatted);

    // Also write to error log if level is ERROR
    if (level === 'ERROR' && target !== 'error') {
      this.writeToFile('error', formatted);
    }

    // Console output in development or for errors
    if (config.server.isDevelopment || level === 'ERROR') {
      if (level === 'ERROR') {
        console.error(formatted);
      } else if (level === 'WARN') {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  public info(message: string, target: LogTarget = 'application', requestId?: string, metadata?: any): void {
    this.log('INFO', message, target, requestId, metadata);
  }

  public warn(message: string, target: LogTarget = 'application', requestId?: string, metadata?: any): void {
    this.log('WARN', message, target, requestId, metadata);
  }

  public error(message: string, target: LogTarget = 'error', requestId?: string, metadata?: any): void {
    this.log('ERROR', message, target, requestId, metadata);
  }

  public debug(message: string, target: LogTarget = 'application', requestId?: string, metadata?: any): void {
    if (config.server.isDevelopment) {
      this.log('DEBUG', message, target, requestId, metadata);
    }
  }
}

export const logger = new Logger();
