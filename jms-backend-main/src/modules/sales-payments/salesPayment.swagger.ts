export const salesPaymentSwaggerDocs = {
  paths: {
    '/sales/payments': {
      post: {
        summary: 'Record sales payment',
        description: 'Records a new payment (CASH, CARD, UPI, BANK_TRANSFER, CHEQUE) against a CONFIRMED sales invoice',
        tags: ['Sales Payments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['salesInvoiceId', 'paymentMethod', 'amount'],
                properties: {
                  salesInvoiceId: { type: 'string', format: 'uuid', example: '11111111-1111-4111-a111-111111111111' },
                  paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'], example: 'UPI' },
                  amount: { type: 'number', example: 50000.0 },
                  transactionReference: { type: 'string', example: 'UPI123456789' },
                  paymentDate: { type: 'string', format: 'date-time', example: '2026-08-14T10:00:00.000Z' },
                  remarks: { type: 'string', example: 'Partial payment via UPI' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Payment recorded successfully' },
          400: { description: 'Validation failed or unconfirmed invoice status' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          409: { description: 'Overpayment conflict (exceeds outstanding amount)' },
        },
      },
      get: {
        summary: 'List sales payments',
        description: 'Retrieves sales payments with search, pagination, date range, and payment method filters',
        tags: ['Sales Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'salesInvoiceId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'paymentMethod', schema: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'] } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'dateFrom', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'dateTo', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'Payments list retrieved successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/sales/payments/{id}': {
      get: {
        summary: 'Get payment by ID',
        description: 'Fetches details of a specific payment record',
        tags: ['Sales Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Payment details retrieved' },
          401: { description: 'Unauthorized' },
          404: { description: 'Payment not found' },
        },
      },
    },
    '/sales/payments/{id}/reverse': {
      post: {
        summary: 'Reverse sales payment',
        description: 'Reverses a COMPLETED payment with a required audit reason and updates invoice settlement',
        tags: ['Sales Payments'],
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
                  reversalReason: { type: 'string', example: 'Customer cheque bounced / duplicate entry' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Payment reversed successfully' },
          400: { description: 'Validation failed or non-completed payment status' },
          401: { description: 'Unauthorized' },
          404: { description: 'Payment not found' },
        },
      },
    },
    '/sales/invoices/{id}/payments': {
      get: {
        summary: 'Get invoice payment history',
        description: 'Retrieves payment history records for a specific sales invoice',
        tags: ['Sales Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Invoice payment history retrieved' },
          401: { description: 'Unauthorized' },
          404: { description: 'Invoice not found' },
        },
      },
    },
    '/sales/invoices/{id}/payment-summary': {
      get: {
        summary: 'Get invoice payment summary',
        description: 'Retrieves financial settlement summary and breakdown by payment method for a sales invoice',
        tags: ['Sales Payments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Payment summary retrieved' },
          401: { description: 'Unauthorized' },
          404: { description: 'Invoice not found' },
        },
      },
    },
  },
};
