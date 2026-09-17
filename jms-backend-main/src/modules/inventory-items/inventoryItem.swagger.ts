export const inventoryItemSwaggerDocs = {
  '/inventory-items': {
    post: {
      summary: 'Create a new physical inventory item and tag',
      tags: ['Inventory Items'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId', 'branchId', 'itemCode', 'grossWeight', 'netWeight', 'purity'],
              properties: {
                productId: { type: 'string', format: 'uuid', example: '33333333-3333-4333-a333-333333333331' },
                branchId: { type: 'string', format: 'uuid', example: '22222222-2222-4222-a222-222222222221' },
                itemCode: { type: 'string', example: 'INV-RING-00002' },
                grossWeight: { type: 'number', example: 5.45 },
                netWeight: { type: 'number', example: 5.45 },
                stoneWeight: { type: 'number', example: 0.0 },
                purity: { type: 'string', example: '22K' },
                status: { type: 'string', example: 'AVAILABLE' },
                barcode: { type: 'string', example: 'BC-RING-00002' },
                qrCode: { type: 'string', example: 'QR-RING-00002' },
                rfidEpc: { type: 'string', nullable: true, example: null },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Inventory item created successfully' },
        400: { description: 'Validation error (e.g. grossWeight < netWeight)' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing inventory_item.create permission' },
        404: { description: 'Product or Branch not found' },
        409: { description: 'Conflict - Duplicate itemCode, barcode, QR, or RFID' },
      },
    },
    get: {
      summary: 'Get paginated inventory items list with filters and search',
      tags: ['Inventory Items'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'productId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'purity', in: 'query', schema: { type: 'string' } },
        { name: 'metalType', in: 'query', schema: { type: 'string' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'itemCode', 'grossWeight', 'netWeight', 'purity', 'status'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
      ],
      responses: {
        200: { description: 'Inventory items retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/inventory-items/{id}': {
    get: {
      summary: 'Get single inventory item details',
      tags: ['Inventory Items'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory item details retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Inventory item not found' },
      },
    },
    put: {
      summary: 'Update inventory item attributes or status',
      tags: ['Inventory Items'],
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
                branchId: { type: 'string', format: 'uuid' },
                grossWeight: { type: 'number', example: 5.50 },
                netWeight: { type: 'number', example: 5.45 },
                stoneWeight: { type: 'number', example: 0.05 },
                purity: { type: 'string', example: '22K' },
                status: { type: 'string', example: 'AVAILABLE' },
                barcode: { type: 'string' },
                qrCode: { type: 'string' },
                rfidEpc: { type: 'string', nullable: true },
                adjustmentReason: { type: 'string', example: 'Weight calibration update' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Inventory item updated successfully' },
        400: { description: 'Validation error' },
        404: { description: 'Inventory item not found' },
      },
    },
    delete: {
      summary: 'Delete inventory item (audit-protected)',
      tags: ['Inventory Items'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory item deleted successfully' },
        404: { description: 'Inventory item not found' },
        409: { description: 'Conflict - Cannot delete item with historical stock movements or adjustments' },
      },
    },
  },
  '/inventory-items/{id}/history': {
    get: {
      summary: 'Get inventory item stock movements and adjustments audit history',
      tags: ['Inventory Items'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory item history retrieved successfully' },
        404: { description: 'Inventory item not found' },
      },
    },
  },
};
