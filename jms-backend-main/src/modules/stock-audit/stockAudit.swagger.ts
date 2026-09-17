export const stockAuditSwaggerDocs = {
  '/stock-audits': {
    post: {
      summary: 'Create Stock Audit Session',
      description: 'Creates a new IN_PROGRESS Stock Audit session and snapshots expected branch inventory.',
      tags: ['Stock Audit & Reconciliation'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'branchId'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                categoryId: { type: 'string', format: 'uuid' },
                notes: { type: 'string', example: 'Q3 Physical Inventory Audit' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Stock audit session created successfully' },
        400: { description: 'Validation error' },
        409: { description: 'Active Stock Audit session already IN_PROGRESS for branch' },
      },
    },
    get: {
      summary: 'List Stock Audit Sessions',
      description: 'Returns paginated list of Stock Audit sessions.',
      tags: ['Stock Audit & Reconciliation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['IN_PROGRESS', 'SUBMITTED', 'RECONCILED', 'CANCELLED'] } },
      ],
      responses: {
        200: { description: 'Paginated stock audit sessions retrieved successfully' },
      },
    },
  },
  '/stock-audits/{id}': {
    get: {
      summary: 'Get Stock Audit Session Details',
      description: 'Returns details of a Stock Audit session including scanned items.',
      tags: ['Stock Audit & Reconciliation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Stock audit session details retrieved successfully' },
      },
    },
  },
  '/stock-audits/{id}/scan': {
    post: {
      summary: 'Scan Item into Audit Session',
      description: 'Scans an item by Barcode, RFID EPC, or Item ID. Evaluates MATCHED, UNEXPECTED, or WEIGHT_MISMATCH status.',
      tags: ['Stock Audit & Reconciliation'],
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
              required: ['identifier'],
              properties: {
                identifier: { type: 'string', example: 'TAG-123456789' },
                scannedGrossWeight: { type: 'number', example: 10.500 },
                scannedNetWeight: { type: 'number', example: 10.000 },
                remarks: { type: 'string', example: 'Verified physical item' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Audit item scanned successfully' },
      },
    },
  },
  '/stock-audits/{id}/submit': {
    post: {
      summary: 'Submit Stock Audit Session',
      description: 'Submits Stock Audit session and identifies all MISSING expected items.',
      tags: ['Stock Audit & Reconciliation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Stock audit session submitted successfully' },
      },
    },
  },
  '/stock-audits/{id}/reconcile': {
    post: {
      summary: 'Reconcile Stock Audit Session',
      description: 'Reconciles session: marks MISSING items as AUDIT_MISSING, logs STOCKTAKE_MISSING movement logs, adjusts weight mismatches, and completes session.',
      tags: ['Stock Audit & Reconciliation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Stock audit session reconciled and inventory adjusted successfully' },
      },
    },
  },
  '/stock-audits/{id}/cancel': {
    post: {
      summary: 'Cancel Stock Audit Session',
      description: 'Cancels Stock Audit session with mandatory cancellation reason.',
      tags: ['Stock Audit & Reconciliation'],
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
              required: ['cancellationReason'],
              properties: {
                cancellationReason: { type: 'string', example: 'Audit postponed due to store maintenance' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Stock audit session cancelled successfully' },
      },
    },
  },
  '/stock-audits/{id}/discrepancies': {
    get: {
      summary: 'Get Audit Discrepancy Report',
      description: 'Returns list of missing, unexpected, and weight mismatch items for an audit session.',
      tags: ['Stock Audit & Reconciliation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Audit discrepancy report retrieved successfully' },
      },
    },
  },
};
