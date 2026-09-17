import { commonResponses } from './common.responses';

export const userSchemas = {
  CreateUserRequest: {
    type: 'object',
    required: ['name', 'email', 'password', 'role'],
    properties: {
      name: { type: 'string', example: 'Store Staff Member', description: 'User full name' },
      email: { type: 'string', format: 'email', example: 'staff@jewelleryerp.com', description: 'User email' },
      password: { type: 'string', format: 'password', example: 'Staff@123456', description: 'User password' },
      role: { type: 'string', enum: ['OWNER', 'ADMIN', 'STAFF', 'USER'], example: 'STAFF', description: 'User RBAC role' },
      branchId: { type: 'string', format: 'uuid', example: '1a9860b0-379e-4e78-8314-b2581691efb0', description: 'Branch UUID' },
    },
  },
  UserItem: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '1a9860b0-379e-4e78-8314-b2581691efb0' },
      name: { type: 'string', example: 'System Admin' },
      email: { type: 'string', example: 'admin@jewelleryerp.com' },
      role: { type: 'string', example: 'ADMIN' },
      status: { type: 'string', example: 'ACTIVE' },
    },
  },
};

export const userPaths = {
  '/users': {
    get: {
      summary: 'Get Users List (Admin Only)',
      description: 'Allowed Roles: ADMIN, OWNER. Retrieves paginated list of system users.',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 }, description: 'Items per page (max 100)' },
        { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'Field to sort by' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term' },
      ],
      responses: {
        200: {
          description: 'Users list retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Admin Access Granted: User management list retrieved.' },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number', example: 1 },
                      limit: { type: 'number', example: 10 },
                    },
                  },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserItem' },
                  },
                },
              },
            },
          },
        },
        400: commonResponses[400],
        401: commonResponses[401],
        403: commonResponses[403],
        500: commonResponses[500],
      },
    },
    post: {
      summary: 'Create New User (Admin Only)',
      description: 'Allowed Roles: ADMIN, OWNER. Creates a new user record.',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUserRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User created successfully.' },
                  data: { $ref: '#/components/schemas/UserItem' },
                },
              },
            },
          },
        },
        400: commonResponses[400],
        401: commonResponses[401],
        403: commonResponses[403],
        409: commonResponses[409],
        500: commonResponses[500],
      },
    },
  },
  '/users/{id}': {
    get: {
      summary: 'Get User by ID (Admin Only)',
      description: 'Allowed Roles: ADMIN, OWNER. Fetches user profile by UUID parameter.',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          example: '1a9860b0-379e-4e78-8314-b2581691efb0',
          description: 'User UUID parameter',
        },
      ],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/UserItem' },
                },
              },
            },
          },
        },
        400: commonResponses[400],
        401: commonResponses[401],
        403: commonResponses[403],
        404: commonResponses[404],
        500: commonResponses[500],
      },
    },
  },
};
