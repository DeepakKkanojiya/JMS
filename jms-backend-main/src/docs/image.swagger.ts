export const imageSwaggerDocs = {
  '/products/{productId}/images': {
    post: {
      tags: ['Product Images'],
      summary: 'Upload generic jewellery product design image',
      description: 'Allowed Roles: ADMIN, OWNER, MANAGER, STAFF. Uploads a product design/master image.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of the target product master',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['image'],
              properties: {
                image: { type: 'string', format: 'binary', description: 'Image file (JPEG, PNG, WEBP, max 5MB)' },
                altText: { type: 'string', example: 'Front view of 22K Gold Diamond Necklace' },
                isPrimary: { type: 'boolean', example: true },
                sortOrder: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Product image uploaded successfully' },
        400: { description: 'Bad Request - Invalid file or parameter' },
        401: { description: 'Unauthorized - Missing or invalid token' },
        403: { description: 'Forbidden - Insufficient permissions' },
        404: { description: 'Not Found - Product not found' },
        413: { description: 'Payload Too Large - File exceeds 5MB limit' },
        415: { description: 'Unsupported Media Type - Only JPEG, PNG, WEBP supported' },
      },
    },
    get: {
      tags: ['Product Images'],
      summary: 'Get all design images for a product',
      description: 'Allowed Roles: ADMIN, OWNER, MANAGER, STAFF, USER. Returns ordered list of design images.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: { description: 'List of product images retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Product not found' },
      },
    },
  },
  '/products/{productId}/images/{imageId}': {
    put: {
      tags: ['Product Images'],
      summary: 'Update product image metadata',
      description: 'Allowed Roles: ADMIN, OWNER, MANAGER. Updates altText, isPrimary, sortOrder.',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'productId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                altText: { type: 'string' },
                isPrimary: { type: 'boolean' },
                sortOrder: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Product image updated successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Product or image not found' },
      },
    },
    delete: {
      tags: ['Product Images'],
      summary: 'Delete product image',
      description: 'Allowed Roles: ADMIN, OWNER. Deletes DB record and storage file.',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'productId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Product image deleted successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Product or image not found' },
      },
    },
  },
  '/inventory-items/{inventoryItemId}/images': {
    post: {
      tags: ['Inventory Item Images'],
      summary: 'Upload photograph of physical jewellery item',
      description: 'Allowed Roles: ADMIN, OWNER, MANAGER, STAFF. Uploads physical item photograph.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'inventoryItemId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of physical inventory item',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['image'],
              properties: {
                image: { type: 'string', format: 'binary', description: 'Photograph (JPEG, PNG, WEBP, max 5MB)' },
                altText: { type: 'string', example: 'Actual photograph of tagged item #JMS-ITEM-001' },
                isPrimary: { type: 'boolean', example: true },
                sortOrder: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Inventory item image uploaded successfully' },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Inventory item not found' },
      },
    },
    get: {
      tags: ['Inventory Item Images'],
      summary: 'Get all physical item photographs',
      description: 'Allowed Roles: ADMIN, OWNER, MANAGER, STAFF. Returns ordered list of item photographs.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'inventoryItemId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: { description: 'List of inventory item images retrieved successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Inventory item not found' },
      },
    },
  },
  '/inventory-items/{inventoryItemId}/images/{imageId}': {
    put: {
      tags: ['Inventory Item Images'],
      summary: 'Update inventory item image metadata',
      description: 'Allowed Roles: ADMIN, OWNER, MANAGER. Updates altText, isPrimary, sortOrder.',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'inventoryItemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                altText: { type: 'string' },
                isPrimary: { type: 'boolean' },
                sortOrder: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Inventory item image updated successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Inventory item or image not found' },
      },
    },
    delete: {
      tags: ['Inventory Item Images'],
      summary: 'Delete inventory item image',
      description: 'Allowed Roles: ADMIN, OWNER. Deletes DB record and storage file.',
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'inventoryItemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory item image deleted successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Inventory item or image not found' },
      },
    },
  },
};
