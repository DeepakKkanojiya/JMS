export const inventoryTransferSwaggerDocs = {
  '/inventory-transfers': {
    post: {
      summary: 'Create a new branch stock transfer request',
      tags: ['Inventory Transfers'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['inventoryItemId', 'toBranchId'],
              properties: {
                inventoryItemId: { type: 'string', format: 'uuid', example: '66666666-6666-4666-a666-666666666661' },
                toBranchId: { type: 'string', format: 'uuid', example: '22222222-2222-4222-a222-222222222222' },
                fromBranchId: { type: 'string', format: 'uuid', example: '22222222-2222-4222-a222-222222222221' },
                remarks: { type: 'string', example: 'Transferring ring item to main showroom branch' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Transfer request created successfully' },
        400: { description: 'Bad Request - Item ineligible, same source & destination, or mismatch' },
        401: { description: 'Unauthorized' },
        404: { description: 'Item or branch not found' },
        409: { description: 'Conflict - Active transfer already exists for item' },
      },
    },
    get: {
      summary: 'Get paginated list of inventory transfers with search and filters',
      tags: ['Inventory Transfers'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'DISPATCHED', 'RECEIVED', 'CANCELLED'] } },
        { name: 'fromBranchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'toBranchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'inventoryItemId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'transferCode', in: 'query', schema: { type: 'string' } },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'transferCode', 'status', 'dispatchedAt', 'receivedAt'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
      ],
      responses: {
        200: { description: 'Transfers retrieved successfully' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/inventory-transfers/{id}': {
    get: {
      summary: 'Get transfer request details by ID',
      tags: ['Inventory Transfers'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Transfer details retrieved successfully' },
        404: { description: 'Transfer request not found' },
      },
    },
  },
  '/inventory-transfers/{id}/approve': {
    post: {
      summary: 'Approve a pending transfer request',
      tags: ['Inventory Transfers'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Transfer request approved successfully' },
        400: { description: 'Bad Request - Transfer is not in REQUESTED status' },
        404: { description: 'Transfer request not found' },
      },
    },
  },
  '/inventory-transfers/{id}/reject': {
    post: {
      summary: 'Reject a pending transfer request',
      tags: ['Inventory Transfers'],
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
              required: ['rejectionReason'],
              properties: {
                rejectionReason: { type: 'string', example: 'Destination branch is out of display capacity' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Transfer request rejected successfully' },
        400: { description: 'Bad Request - Transfer is not in REQUESTED status' },
        404: { description: 'Transfer request not found' },
      },
    },
  },
  '/inventory-transfers/{id}/dispatch': {
    post: {
      summary: 'Dispatch an approved transfer request (sets item in-transit & logs StockMovement)',
      tags: ['Inventory Transfers'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Transfer request dispatched successfully' },
        400: { description: 'Bad Request - Transfer is not in APPROVED status' },
        404: { description: 'Transfer request not found' },
      },
    },
  },
  '/inventory-transfers/{id}/receive': {
    post: {
      summary: 'Receive a dispatched transfer request (updates item branchId & restores status to AVAILABLE)',
      tags: ['Inventory Transfers'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Transfer request received successfully' },
        400: { description: 'Bad Request - Transfer is not in DISPATCHED status' },
        404: { description: 'Transfer request not found' },
      },
    },
  },
};
