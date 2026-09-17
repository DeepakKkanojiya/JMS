export const salesRefundSwaggerDocs = {
  paths: {
    '/sales/refunds': {
      post: {
        summary: 'Issue a new refund for a processed sales return',
        tags: ['Sales Refunds'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['salesReturnId', 'refundMethod', 'amount'],
                properties: {
                  salesReturnId: { type: 'string', format: 'uuid' },
                  refundMethod: {
                    type: 'string',
                    enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'],
                    example: 'CASH',
                  },
                  amount: { type: 'number', example: 15000.0 },
                  transactionReference: { type: 'string', example: 'TXN-REF-998822' },
                  remarks: { type: 'string', example: 'Cash returned to customer at branch counter' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Sales refund issued successfully in COMPLETED status' },
          '400': { description: 'Bad Request / Return not PROCESSED / Amount exceeds eligible refund' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
        },
      },
      get: {
        summary: 'List sales refunds with search, method, and status filters',
        tags: ['Sales Refunds'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'refundNumber', schema: { type: 'string' } },
          { in: 'query', name: 'salesReturnId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'refundMethod', schema: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['COMPLETED', 'REVERSED'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'List of sales refunds retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/sales/refunds/{id}': {
      get: {
        summary: 'Get sales refund details by ID',
        tags: ['Sales Refunds'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Sales refund details retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales refund not found' },
        },
      },
    },
    '/sales/refunds/{id}/reverse': {
      post: {
        summary: 'Reverse a completed sales refund with mandatory audit reason',
        tags: ['Sales Refunds'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reversalReason'],
                properties: {
                  reversalReason: { type: 'string', example: 'Incorrect bank account credited' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Sales refund reversed successfully' },
          '400': { description: 'Bad Request / Already reversed / Missing reason' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales refund not found' },
        },
      },
    },
    '/sales/returns/{id}/refunds': {
      get: {
        summary: 'Get refund history for a specific sales return',
        tags: ['Sales Refunds'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Refund history for sales return retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
        },
      },
    },
  },
};
