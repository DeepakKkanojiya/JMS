export const goldExchangeSwaggerDocs = {
  paths: {
    '/sales/invoices/{invoiceId}/gold-exchanges': {
      post: {
        summary: 'Create gold exchange request for sales invoice',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'invoiceId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  customerId: { type: 'string', format: 'uuid' },
                  remarks: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['metalType', 'purity', 'grossWeight'],
                      properties: {
                        metalType: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] },
                        purity: { type: 'string', example: '22K' },
                        grossWeight: { type: 'number', example: 20.0 },
                        stoneWeight: { type: 'number', example: 2.0 },
                        deductionPercent: { type: 'number', example: 5.0 },
                        remarks: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Gold exchange record created successfully' },
          '400': { description: 'Bad Request / Validation error / Invalid invoice state' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Invoice not found' },
        },
      },
      get: {
        summary: 'Get gold exchange records for sales invoice',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'invoiceId',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': { description: 'List of gold exchanges for invoice' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Invoice not found' },
        },
      },
    },
    '/gold-exchanges': {
      get: {
        summary: 'List all customer gold exchanges with search and filters',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'exchangeNumber', schema: { type: 'string' } },
          { in: 'query', name: 'customerId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'salesInvoiceId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'branchId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['REQUESTED', 'VALUED', 'APPLIED', 'CANCELLED'] } },
          { in: 'query', name: 'metalType', schema: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] } },
          { in: 'query', name: 'purity', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'exchangeNumber', 'totalNetWeight', 'totalExchangeValue', 'status'] } },
          { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': { description: 'Paginated list of gold exchanges' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/gold-exchanges/{id}': {
      get: {
        summary: 'Get gold exchange details by ID',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Gold exchange details' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Gold exchange not found' },
        },
      },
    },
    '/gold-exchanges/{id}/value': {
      post: {
        summary: 'Calculate valuation and snapshot metal rates for gold exchange',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Gold exchange valued successfully' },
          '400': { description: 'Bad Request / Invalid status' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Gold exchange not found' },
        },
      },
    },
    '/gold-exchanges/{id}/apply': {
      post: {
        summary: 'Apply exchange credit to sales invoice',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Exchange credit applied to sales invoice successfully' },
          '400': { description: 'Bad Request / Invoice not in DRAFT state' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Gold exchange not found' },
          '409': { description: 'Exchange credit already applied to invoice' },
        },
      },
    },
    '/gold-exchanges/{id}/cancel': {
      post: {
        summary: 'Cancel gold exchange request',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Gold exchange cancelled successfully' },
          '400': { description: 'Bad Request / Applied exchange cannot be cancelled' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Gold exchange not found' },
        },
      },
    },
    '/gold-exchanges/{id}/history': {
      get: {
        summary: 'Get audit history for gold exchange',
        tags: ['Gold Exchanges'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Gold exchange audit history' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Gold exchange not found' },
        },
      },
    },
  },
};
