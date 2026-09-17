export const pricingSwaggerDocs = {
  '/api/v1/sales/invoices/{id}/calculate-pricing': {
    post: {
      summary: 'Calculate & Persist Invoice Pricing Breakdown',
      tags: ['Sales Invoices - Pricing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                taxType: { type: 'string', enum: ['INTRA_STATE', 'INTER_STATE'], default: 'INTRA_STATE' },
                wastagePercent: { type: 'number', example: 2.5 },
                makingChargeType: { type: 'string', enum: ['PER_GRAM', 'FIXED', 'PERCENTAGE'] },
                makingChargeRate: { type: 'number', example: 450.00 },
                taxRate: { type: 'number', example: 3.00 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Pricing breakdown calculated and persisted successfully' },
        400: { description: 'Bad Request / Invoice not in DRAFT status or metal rate not locked' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Invoice Not Found' },
      },
    },
  },
  '/api/v1/sales/invoices/{id}/pricing': {
    get: {
      summary: 'Get Invoice Pricing Breakdown Snapshot',
      tags: ['Sales Invoices - Pricing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Stored invoice pricing breakdown snapshot' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Invoice Not Found' },
      },
    },
  },
};
