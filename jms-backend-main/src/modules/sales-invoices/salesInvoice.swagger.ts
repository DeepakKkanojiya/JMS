export const salesInvoiceSwaggerDocs = {
  '/sales/invoices': {
    post: {
      summary: 'Create Draft Sales Invoice',
      description: 'Creates a new sales invoice foundation record in DRAFT status.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['customerId', 'branchId', 'items'],
              properties: {
                customerId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                branchId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
                salespersonId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
                invoiceDate: { type: 'string', format: 'date-time', example: '2026-08-13T20:00:00.000Z' },
                notes: { type: 'string', example: 'Retail customer gold jewellery purchase' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['inventoryItemId', 'unitPrice'],
                    properties: {
                      inventoryItemId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174003' },
                      quantity: { type: 'integer', example: 1 },
                      unitPrice: { type: 'number', example: 65000.00 },
                      discountAmount: { type: 'number', example: 1000.00 },
                      taxAmount: { type: 'number', example: 1920.00 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Sales invoice created successfully in DRAFT status' },
        400: { description: 'Validation Error or Invalid item status/branch' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.create permission' },
        404: { description: 'Customer, Branch, Salesperson, or Inventory item not found' },
      },
    },
    get: {
      summary: 'Get Sales Invoices',
      description: 'Returns paginated list of sales invoices with search and filters.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'customerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'salespersonId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'CONFIRMED', 'CANCELLED'] } },
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'invoiceNumber', 'invoiceDate', 'grandTotal'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Paginated sales invoices list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.read permission' },
      },
    },
  },
  '/sales/invoices/{id}': {
    get: {
      summary: 'Get Sales Invoice Details',
      description: 'Returns complete sales invoice details by ID.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Sales invoice details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.read permission' },
        404: { description: 'Sales invoice not found' },
      },
    },
    put: {
      summary: 'Update Draft Sales Invoice',
      description: 'Updates a DRAFT sales invoice. Confirmed or Cancelled invoices cannot be modified.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                customerId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                salespersonId: { type: 'string', format: 'uuid' },
                notes: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['inventoryItemId', 'unitPrice'],
                    properties: {
                      inventoryItemId: { type: 'string', format: 'uuid' },
                      quantity: { type: 'integer' },
                      unitPrice: { type: 'number' },
                      discountAmount: { type: 'number' },
                      taxAmount: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Draft sales invoice updated successfully' },
        400: { description: 'Validation Error or attempting to edit non-DRAFT invoice' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.update permission' },
        404: { description: 'Sales invoice not found' },
      },
    },
  },
  '/sales/invoices/{id}/items': {
    get: {
      summary: 'Get Sales Invoice Line Items',
      description: 'Returns line items for a given sales invoice.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Sales invoice items retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.read permission' },
        404: { description: 'Sales invoice not found' },
      },
    },
  },
  '/sales/invoices/{id}/confirm': {
    post: {
      summary: 'Confirm POS Draft Sales Invoice (Atomic Inventory Deduction)',
      description: 'Atomically confirms POS invoice, transitions inventory items AVAILABLE -> SOLD, creates SALE StockMovements, and sets invoice status to CONFIRMED.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Sales invoice confirmed successfully and inventory items marked SOLD' },
        400: { description: 'Invoice is already confirmed/cancelled, has no items, duplicate items, or items not AVAILABLE / branch mismatch' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.confirm permission' },
        404: { description: 'Sales invoice or inventory item not found' },
        409: { description: 'Conflict - Inventory item was concurrently sold or is no longer AVAILABLE' },
      },
    },
  },
  '/sales/invoices/{id}/cancel': {
    post: {
      summary: 'Cancel Sales Invoice',
      description: 'Transitions sales invoice status to CANCELLED. Preserves record for historical tracking.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Sales invoice cancelled successfully' },
        400: { description: 'Invoice is already cancelled' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.cancel permission' },
        404: { description: 'Sales invoice not found' },
      },
    },
  },
  '/sales/pos/inventory/{identifier}': {
    get: {
      summary: 'POS Scanning Inventory Lookup',
      description: 'Look up an AVAILABLE inventory item by itemCode, barcode, qrCode, or UUID id for POS billing.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, example: 'BC-ITM-DEL-01-2026-00001' },
      ],
      responses: {
        200: { description: 'Available inventory item details retrieved successfully' },
        400: { description: 'Identifier parameter missing' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.read permission' },
        404: { description: 'Inventory item not found or not in AVAILABLE status' },
      },
    },
  },
};
