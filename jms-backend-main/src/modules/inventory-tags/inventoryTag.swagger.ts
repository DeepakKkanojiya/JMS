export const inventoryTagSwaggerDocs = {
  '/inventory-tags': {
    get: {
      summary: 'Get paginated inventory tags list with search and filters',
      tags: ['Inventory Tags'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        { name: 'barcode', in: 'query', schema: { type: 'string' } },
        { name: 'qrCode', in: 'query', schema: { type: 'string' } },
        { name: 'inventoryItemId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'taggedAt', 'barcode', 'qrCode', 'isActive'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
      ],
      responses: {
        200: { description: 'Inventory tags retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/inventory-tags/barcode/{barcode}': {
    get: {
      summary: 'Direct lookup inventory item and product details by barcode',
      tags: ['Inventory Tags'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'barcode', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Inventory tag details retrieved by barcode' },
        401: { description: 'Unauthorized' },
        404: { description: 'Tag not found or is inactive' },
      },
    },
  },
  '/inventory-tags/qr/{qrCode}': {
    get: {
      summary: 'Direct lookup inventory item and product details by QR code',
      tags: ['Inventory Tags'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'qrCode', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Inventory tag details retrieved by QR code' },
        401: { description: 'Unauthorized' },
        404: { description: 'Tag not found or is inactive' },
      },
    },
  },
  '/inventory-items/{id}/tag': {
    post: {
      summary: 'Create or assign barcode/QR tag to inventory item',
      tags: ['Inventory Tags'],
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
                barcode: { type: 'string', example: 'BC-RING-00005' },
                qrCode: { type: 'string', example: 'QR-RING-00005' },
                rfidEpc: { type: 'string', nullable: true, example: null },
                isActive: { type: 'boolean', default: true },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Inventory tag created successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Inventory item not found' },
        409: { description: 'Conflict - Tag already exists for item or duplicate barcode/QR/RFID' },
      },
    },
    get: {
      summary: 'Get tag details by inventory item ID',
      tags: ['Inventory Tags'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory tag details retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Tag for item not found' },
      },
    },
    put: {
      summary: 'Update tag attributes',
      tags: ['Inventory Tags'],
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
                barcode: { type: 'string' },
                qrCode: { type: 'string' },
                rfidEpc: { type: 'string', nullable: true },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Inventory tag updated successfully' },
        404: { description: 'Tag for item not found' },
        409: { description: 'Conflict - Duplicate barcode/QR/RFID' },
      },
    },
  },
  '/inventory-items/{id}/tag/regenerate': {
    post: {
      summary: 'Regenerate barcode and QR code for inventory item',
      tags: ['Inventory Tags'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory tag regenerated successfully' },
        404: { description: 'Inventory item or tag not found' },
      },
    },
  },
  '/inventory-items/{id}/tag/status': {
    patch: {
      summary: 'Activate or deactivate tag',
      tags: ['Inventory Tags'],
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
              required: ['isActive'],
              properties: {
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Inventory tag status updated successfully' },
        404: { description: 'Tag for item not found' },
      },
    },
  },
};
