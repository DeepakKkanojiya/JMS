export const healthPaths = {
  '/health': {
    get: {
      summary: 'System and Database Health Check',
      description: 'Comprehensive health check verifying process status and PostgreSQL database connection.',
      tags: ['System'],
      responses: {
        200: {
          description: 'Application and Database healthy (UP)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  status: { type: 'string', example: 'UP' },
                  timestamp: { type: 'string', example: '2026-08-05T18:30:00Z' },
                  uptime: { type: 'number', example: 3600 },
                  version: { type: 'string', example: '1.0.0' },
                  environment: { type: 'string', example: 'development' },
                  database: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'UP' },
                      responseTimeMs: { type: 'number', example: 4 },
                    },
                  },
                },
              },
            },
          },
        },
        503: {
          description: 'Database connection down (Service Unavailable)',
        },
      },
    },
  },
  '/health/ready': {
    get: {
      summary: 'Readiness Probe Check',
      description: 'Verifies if backend application is ready to accept incoming HTTP traffic.',
      tags: ['System'],
      responses: {
        200: { description: 'Application ready (UP)' },
        503: { description: 'Application not ready (DOWN)' },
      },
    },
  },
  '/health/live': {
    get: {
      summary: 'Liveness Probe Check',
      description: 'Lightweight liveness probe checking if the Node.js process is alive (does NOT query database).',
      tags: ['System'],
      responses: {
        200: { description: 'Process alive (UP)' },
      },
    },
  },
};
