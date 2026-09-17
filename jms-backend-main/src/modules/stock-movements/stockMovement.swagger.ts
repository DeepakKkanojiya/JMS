export const stockMovementSwaggerDocs = {
  '/stock-movements': {
    post: {
      summary: 'Record a new physical stock movement (immutable audit log entry)',
      tags: ['Stock Movements'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['inventoryItemId', 'movementType'],
              properties: {
                inventoryItemId: { type: 'string', format: 'uuid', example: '66666666-6666-4666-a666-666666666661' },
                fromBranchId: { type: 'string', format: 'uuid', nullable: true, example: '22222222-2222-4222-a222-222222222221' },
                toBranchId: { type: 'string', format: 'uuid', nullable: true, example: '22222222-2222-4222-a222-222222222222' },
                movementType: {
                  type: 'string',
                  enum: [
                    'STOCK_IN',
                    'STOCK_OUT',
                    'TRANSFER',
                    'ADJUSTMENT',
                    'SALE',
                    'SALE_RETURN',
                    'PURCHASE',
                    'PURCHASE_RETURN',
                    'REPAIR_OUT',
                    'REPAIR_IN',
                    'APPROVAL_OUT',
                    'APPROVAL_RETURN',
                  ],
                  example: 'STOCK_IN',
                },
                referenceType: { type: 'string', nullable: true, example: 'MANUAL_INVENTORY' },
                referenceId: { type: 'string', nullable: true, example: 'REF-2026-001' },
                remarks: { type: 'string', nullable: true, example: 'Initial showroom stock intake' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Stock movement recorded successfully' },
        400: { description: 'Validation error or invalid branch/movement data' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing stock_movement.create permission' },
        404: { description: 'Inventory item or Branch not found' },
      },
    },
    get: {
      summary: 'Get paginated stock movements audit ledger with search and filters',
      tags: ['Stock Movements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'inventoryItemId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'fromBranchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'toBranchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'movementType', in: 'query', schema: { type: 'string' } },
        { name: 'referenceType', in: 'query', schema: { type: 'string' } },
        { name: 'referenceId', in: 'query', schema: { type: 'string' } },
        { name: 'performedBy', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'movementType', 'referenceType', 'inventoryItemId'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
      ],
      responses: {
        200: { description: 'Stock movements retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing stock_movement.read permission' },
      },
    },
  },
  '/stock-movements/{id}': {
    get: {
      summary: 'Get single stock movement audit details',
      tags: ['Stock Movements'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Stock movement details retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Stock movement not found' },
      },
    },
  },
};
