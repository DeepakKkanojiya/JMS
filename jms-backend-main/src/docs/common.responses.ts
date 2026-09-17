/**
 * Standard OpenAPI 3.0 Component Schemas and Error Responses
 */
export const commonSchemas = {
  ValidationErrorItem: {
    type: 'object',
    properties: {
      field: { type: 'string', example: 'email' },
      message: { type: 'string', example: 'Email is required' },
    },
  },
  StandardErrorPayload: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 400 },
      message: { type: 'string', example: 'Validation failed' },
      errors: {
        type: 'array',
        items: { $ref: '#/components/schemas/ValidationErrorItem' },
      },
      timestamp: { type: 'string', example: '2026-08-05T16:30:00Z' },
      path: { type: 'string', example: '/api/v1/auth/login' },
    },
  },
  UnauthorizedErrorPayload: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 401 },
      message: { type: 'string', example: 'Unauthorized' },
      timestamp: { type: 'string', example: '2026-08-05T16:30:00Z' },
      path: { type: 'string', example: '/api/v1/auth/me' },
    },
  },
  ForbiddenErrorPayload: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 403 },
      message: { type: 'string', example: 'Forbidden' },
      timestamp: { type: 'string', example: '2026-08-05T16:30:00Z' },
      path: { type: 'string', example: '/api/v1/users' },
    },
  },
  NotFoundErrorPayload: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 404 },
      message: { type: 'string', example: 'Route not found' },
      timestamp: { type: 'string', example: '2026-08-05T16:30:00Z' },
      path: { type: 'string', example: '/api/xyz' },
    },
  },
  ConflictErrorPayload: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 409 },
      message: { type: 'string', example: 'Email already exists' },
      timestamp: { type: 'string', example: '2026-08-05T16:30:00Z' },
      path: { type: 'string', example: '/api/v1/users' },
    },
  },
  InternalErrorPayload: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 500 },
      message: { type: 'string', example: 'Internal server error' },
      timestamp: { type: 'string', example: '2026-08-05T16:30:00Z' },
      path: { type: 'string', example: '/api/v1/test/internal-error' },
    },
  },
};

export const commonResponses = {
  400: {
    description: 'Bad Request / Validation Failed',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/StandardErrorPayload' },
      },
    },
  },
  401: {
    description: 'Unauthorized (Missing or invalid token)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/UnauthorizedErrorPayload' },
      },
    },
  },
  403: {
    description: 'Forbidden (Insufficient role permissions)',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ForbiddenErrorPayload' },
      },
    },
  },
  404: {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/NotFoundErrorPayload' },
      },
    },
  },
  409: {
    description: 'Conflict / Duplicate Entity',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ConflictErrorPayload' },
      },
    },
  },
  500: {
    description: 'Internal Server Error / Database Offline',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/InternalErrorPayload' },
      },
    },
  },
};
