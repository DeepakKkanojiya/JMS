import { commonResponses } from './common.responses';

export const customerPaths = {
  '/customers': {
    get: {
      summary: 'Get Customers List (Staff & Admin)',
      description: 'Allowed Roles: ADMIN, OWNER, STAFF. Retrieves customer list.',
      tags: ['Customers'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
      ],
      responses: {
        200: {
          description: 'Customer list retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'c1' },
                        name: { type: 'string', example: 'Rajesh Kumar' },
                        phone: { type: 'string', example: '+919876543210' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: commonResponses[401],
        403: commonResponses[403],
        500: commonResponses[500],
      },
    },
  },
  '/customer/upload': {
    post: {
      summary: 'Upload Customer Document (Staff & Admin)',
      description: 'Allowed Roles: ADMIN, OWNER, STAFF. Validates and uploads customer KYC/document file.',
      tags: ['Customers'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'Image or PDF document file (max 5MB)',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Customer document uploaded successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Customer document uploaded and validated successfully.' },
                  file: {
                    type: 'object',
                    properties: {
                      filename: { type: 'string', example: 'kyc-doc.pdf' },
                      mimetype: { type: 'string', example: 'application/pdf' },
                      size: { type: 'number', example: 1048576 },
                    },
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
  },
};
