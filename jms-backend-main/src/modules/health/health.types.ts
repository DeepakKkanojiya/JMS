export type HealthStatus = 'UP' | 'DOWN';

export interface DatabaseHealthInfo {
  status: HealthStatus;
  responseTimeMs?: number;
  error?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database: DatabaseHealthInfo;
}

export interface ReadinessResponse {
  success: boolean;
  ready: boolean;
  timestamp: string;
  database: DatabaseHealthInfo;
}

export interface LivenessResponse {
  success: boolean;
  status: HealthStatus;
  timestamp: string;
  uptime: number;
}
