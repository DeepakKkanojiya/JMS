export const taxRateSwaggerDocs = {
  '/api/v1/tax-rates': {
    post: {
      summary: 'Create Tax Rate Configuration',
      tags: ['Tax Rates'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'taxName', 'taxCode', 'rate', 'effectiveFrom'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                taxName: { type: 'string', example: 'GST' },
                taxCode: { type: 'string', example: 'GST_3' },
                rate: { type: 'number', example: 3.00 },
                effectiveFrom: { type: 'string', format: 'date-time' },
                effectiveTo: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Tax rate configuration created' },
        400: { description: 'Bad Request / Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        409: { description: 'Conflict - Overlapping configuration' },
      },
    },
    get: {
      summary: 'List Tax Rate Configurations',
      tags: ['Tax Rates'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'taxCode', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: { description: 'Paginated list of tax rates' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/api/v1/tax-rates/current': {
    get: {
      summary: 'Get Current Active Tax Rate',
      tags: ['Tax Rates'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'taxCode', in: 'query', schema: { type: 'string', default: 'GST_3' } },
      ],
      responses: {
        200: { description: 'Current active tax rate configuration' },
        404: { description: 'Not Found' },
      },
    },
  },
};
