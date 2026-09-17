import { commonResponses } from './common.responses';

export const authSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@jewelleryerp.com', description: 'User login email address' },
      password: { type: 'string', format: 'password', example: 'Admin@123456', description: 'User login password' },
    },
  },
  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' },
    },
  },
  LoginSuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Login successful' },
      data: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1a9860b0-379e-4e78-8314-b2581691efb0' },
              name: { type: 'string', example: 'System Admin' },
              email: { type: 'string', example: 'admin@jewelleryerp.com' },
              role: { type: 'string', example: 'OWNER' },
              status: { type: 'string', example: 'ACTIVE' },
            },
          },
        },
      },
    },
  },
  RefreshSuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Access token refreshed' },
      data: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
    },
  },
  MeSuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1a9860b0-379e-4e78-8314-b2581691efb0' },
          name: { type: 'string', example: 'System Admin' },
          email: { type: 'string', example: 'admin@jewelleryerp.com' },
          role: { type: 'string', example: 'OWNER' },
          status: { type: 'string', example: 'ACTIVE' },
        },
      },
    },
  },
};

export const authPaths = {
  '/auth/login': {
    post: {
      summary: 'User Login',
      description: 'Authenticate user with email and password to obtain JWT access and refresh tokens.',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginSuccessResponse' },
            },
          },
        },
        400: commonResponses[400],
        401: commonResponses[401],
        500: commonResponses[500],
      },
    },
  },
  '/auth/refresh': {
    post: {
      summary: 'Refresh Access Token',
      description: 'Generate a new JWT access token using a valid refresh token.',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Access token refreshed successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshSuccessResponse' },
            },
          },
        },
        400: commonResponses[400],
        401: commonResponses[401],
        500: commonResponses[500],
      },
    },
  },
  '/auth/logout': {
    post: {
      summary: 'User Logout',
      description: 'Revoke active refresh tokens and log out current user.',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Logout successful' },
                },
              },
            },
          },
        },
        401: commonResponses[401],
        500: commonResponses[500],
      },
    },
  },
  '/auth/me': {
    get: {
      summary: 'Get Current Authenticated User',
      description: 'Retrieve profile details of the currently authenticated user.',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Current user profile returned',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MeSuccessResponse' },
            },
          },
        },
        401: commonResponses[401],
        404: commonResponses[404],
        500: commonResponses[500],
      },
    },
  },
};
