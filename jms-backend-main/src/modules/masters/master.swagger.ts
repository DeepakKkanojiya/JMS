export const masterSwaggerDocs = {
  paths: {
    '/api/v1/masters/dropdowns': {
      get: {
        summary: 'Get reusable master data dropdown options',
        tags: ['Common Masters'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Master data dropdown options retrieved successfully',
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/masters/statuses': {
      get: {
        summary: 'Get master status definitions',
        tags: ['Common Masters'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Master status definitions retrieved successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/masters/branches': {
      get: {
        summary: 'Get active branch selection options',
        tags: ['Common Masters'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Active branches retrieved successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/masters/roles': {
      get: {
        summary: 'Get IAM roles for selection',
        tags: ['Common Masters'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'IAM roles retrieved successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/masters/categories': {
      get: {
        summary: 'Get product category selection options',
        tags: ['Common Masters'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Product categories retrieved successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
