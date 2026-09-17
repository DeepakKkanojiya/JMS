export const salesReturnSwaggerDocs = {
  paths: {
    '/sales/returns': {
      post: {
        summary: 'Create a new Sales Return request for a confirmed invoice',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['salesInvoiceId', 'items'],
                properties: {
                  salesInvoiceId: { type: 'string', format: 'uuid' },
                  reason: { type: 'string', example: 'Customer exchange request' },
                  remarks: { type: 'string', example: 'Gold ring size mismatch' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['salesInvoiceItemId', 'inventoryItemId'],
                      properties: {
                        salesInvoiceItemId: { type: 'string', format: 'uuid' },
                        inventoryItemId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', default: 1 },
                        deductionAmount: { type: 'number', default: 0 },
                        reason: { type: 'string' },
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
          '201': { description: 'Sales return request created in REQUESTED state' },
          '400': { description: 'Bad Request / Validation error / Unconfirmed invoice' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Invoice or item not found' },
          '409': { description: 'Conflict: Item already in an active return' },
        },
      },
      get: {
        summary: 'List sales returns with search and filters',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'returnNumber', schema: { type: 'string' } },
          { in: 'query', name: 'customerId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'salesInvoiceId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'branchId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['REQUESTED', 'APPROVED', 'PROCESSED', 'CANCELLED'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'List of sales returns retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/sales/returns/{id}': {
      get: {
        summary: 'Get sales return details by ID',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Sales return details retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
        },
      },
    },
    '/sales/returns/{id}/history': {
      get: {
        summary: 'Get stage audit history of sales return',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Sales return audit history retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
        },
      },
    },
    '/sales/returns/{id}/approve': {
      post: {
        summary: 'Approve requested sales return',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  remarks: { type: 'string', example: 'Return approved after physical inspection' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Sales return approved successfully' },
          '400': { description: 'Bad Request: Return not in REQUESTED status' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
        },
      },
    },
    '/sales/returns/{id}/process': {
      post: {
        summary: 'Process approved sales return (Restores inventory to AVAILABLE & creates SALE_RETURN movement)',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  remarks: { type: 'string', example: 'Items returned into store vault' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Sales return processed successfully, inventory updated' },
          '400': { description: 'Bad Request: Return not in APPROVED status' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
          '409': { description: 'Conflict: Item no longer in SOLD status' },
        },
      },
    },
    '/sales/returns/{id}/cancel': {
      post: {
        summary: 'Cancel sales return request',
        tags: ['Sales Returns'],
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
                required: ['cancellationReason'],
                properties: {
                  cancellationReason: { type: 'string', example: 'Customer decided to keep jewellery' },
                  remarks: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Sales return cancelled successfully' },
          '400': { description: 'Bad Request: Already processed or cancelled' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Sales return not found' },
        },
      },
    },
    '/sales/invoices/{invoiceId}/returns': {
      get: {
        summary: 'Get all sales returns for a specific sales invoice',
        tags: ['Sales Returns'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'invoiceId', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Sales returns for invoice retrieved successfully' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Invoice not found' },
        },
      },
    },
  },
};
