export const metalRateSwaggerDocs = {
  '/metal-rates': {
    post: {
      summary: 'Create Metal Rate',
      description: 'Creates a new daily or period-bound metal rate.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'metalType', 'purity', 'ratePerGram', 'effectiveFrom'],
              properties: {
                companyId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                metalType: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'], example: 'GOLD' },
                purity: { type: 'string', example: '22K' },
                ratePerGram: { type: 'number', example: 6850.0 },
                effectiveFrom: { type: 'string', format: 'date-time', example: '2026-08-14T10:00:00.000Z' },
                effectiveTo: { type: 'string', format: 'date-time', nullable: true, example: null },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Metal rate created successfully' },
        400: { description: 'Validation Error or non-positive rate' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.create permission' },
        404: { description: 'Company not found' },
        409: { description: 'Active rate overlap detected' },
      },
    },
    get: {
      summary: 'List Metal Rates',
      description: 'Returns paginated list of metal rates with search and filters.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'metalType', in: 'query', schema: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] } },
        { name: 'purity', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'effectiveFrom', 'effectiveTo', 'ratePerGram', 'metalType', 'purity'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Paginated metal rates list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.read permission' },
      },
    },
  },
  '/metal-rates/current': {
    get: {
      summary: 'Get Current Applicable Metal Rate',
      description: 'Resolves active rate for specified company, metal type, purity, and timestamp.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'metalType', in: 'query', required: true, schema: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] } },
        { name: 'purity', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'at', in: 'query', schema: { type: 'string', format: 'date-time' } },
      ],
      responses: {
        200: { description: 'Current active rate resolved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.read permission' },
        404: { description: 'No active rate found' },
      },
    },
  },
  '/metal-rates/history': {
    get: {
      summary: 'Get Metal Rate History',
      description: 'Returns historical rate records with sorting and filters.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'metalType', in: 'query', schema: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] } },
        { name: 'purity', in: 'query', schema: { type: 'string' } },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'sortBy', in: 'query', schema: { type: 'string' } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Rate history retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.read permission' },
      },
    },
  },
  '/metal-rates/calculate': {
    post: {
      summary: 'Calculate Metal Value',
      description: 'Calculates metal value = netWeight * ratePerGram.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'metalType', 'purity', 'netWeight'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                metalType: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] },
                purity: { type: 'string', example: '22K' },
                netWeight: { type: 'number', example: 10.25 },
                at: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Metal value calculated successfully' },
        400: { description: 'Validation Error or non-positive weight' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.read permission' },
        404: { description: 'Active rate not found' },
      },
    },
  },
  '/metal-rates/{id}': {
    get: {
      summary: 'Get Metal Rate Details',
      description: 'Returns single metal rate details by ID.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Metal rate details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.read permission' },
        404: { description: 'Metal rate not found' },
      },
    },
    put: {
      summary: 'Update Metal Rate',
      description: 'Updates rate per gram or closing timestamp. Master identity fields cannot be mutated.',
      tags: ['Metal Rate Engine'],
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
                ratePerGram: { type: 'number', example: 6900.0 },
                effectiveTo: { type: 'string', format: 'date-time', nullable: true },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Metal rate updated successfully' },
        400: { description: 'Validation Error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.update permission' },
        404: { description: 'Metal rate not found' },
        409: { description: 'Overlap detected' },
      },
    },
  },
  '/metal-rates/{id}/deactivate': {
    post: {
      summary: 'Deactivate Metal Rate',
      description: 'Soft-deactivates metal rate (isActive = false). Preserves record permanently.',
      tags: ['Metal Rate Engine'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Metal rate deactivated successfully' },
        400: { description: 'Metal rate already inactive' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing metal_rate.update permission' },
        404: { description: 'Metal rate not found' },
      },
    },
  },
  '/sales/invoices/{id}/lock-metal-rate': {
    post: {
      summary: 'Lock Invoice Metal Rate',
      description: 'Locks current metal rate snapshot on DRAFT sales invoice.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Metal rate locked for invoice successfully' },
        400: { description: 'Invoice is not DRAFT' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.update permission' },
        404: { description: 'Invoice or rate not found' },
        409: { description: 'Metal rate is already locked for this invoice' },
      },
    },
  },
  '/sales/invoices/{id}/metal-rate': {
    get: {
      summary: 'Get Invoice Locked Metal Rate',
      description: 'Returns locked metal rate snapshot for sales invoice.',
      tags: ['Sales Invoices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Locked metal rate snapshot retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing sales_invoice.read permission' },
        404: { description: 'Invoice or locked rate snapshot not found' },
      },
    },
  },
};
