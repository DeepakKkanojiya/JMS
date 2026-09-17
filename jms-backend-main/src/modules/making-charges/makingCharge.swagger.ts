export const makingChargeSwaggerDocs = {
  '/api/v1/making-charges': {
    post: {
      summary: 'Create Making Charge Configuration',
      tags: ['Making Charges'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'metalType', 'purity', 'chargeType', 'rate', 'effectiveFrom'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                metalType: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] },
                purity: { type: 'string', example: '22K' },
                chargeType: { type: 'string', enum: ['PER_GRAM', 'FIXED', 'PERCENTAGE'] },
                rate: { type: 'number', example: 450.00 },
                effectiveFrom: { type: 'string', format: 'date-time' },
                effectiveTo: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Making charge configuration created' },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        409: { description: 'Conflict - Overlapping configuration' },
      },
    },
    get: {
      summary: 'List Making Charge Configurations',
      tags: ['Making Charges'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'metalType', in: 'query', schema: { type: 'string' } },
        { name: 'purity', in: 'query', schema: { type: 'string' } },
        { name: 'chargeType', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: { description: 'Paginated list of making charges' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/api/v1/making-charges/current': {
    get: {
      summary: 'Get Current Active Making Charge',
      tags: ['Making Charges'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'metalType', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'purity', in: 'query', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Current active making charge configuration' },
        404: { description: 'Not Found' },
      },
    },
  },
};
