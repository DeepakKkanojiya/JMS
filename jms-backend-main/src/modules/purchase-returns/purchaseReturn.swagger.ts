export const purchaseReturnSwaggerDocs = {
  '/purchase-returns': {
    post: {
      summary: 'Create Draft Purchase Return',
      description: 'Creates a draft purchase return for returning defective or excess stock to a vendor.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['vendorId', 'branchId', 'items'],
              properties: {
                purchaseBillId: { type: 'string', format: 'uuid' },
                purchaseOrderId: { type: 'string', format: 'uuid' },
                vendorId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                reason: { type: 'string', example: 'DEFECTIVE_JEWELLERY' },
                notes: { type: 'string', example: 'Defective clasp on gold necklace' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['itemName', 'quantity', 'grossWeight', 'netWeight', 'purchaseRate'],
                    properties: {
                      purchaseBillItemId: { type: 'string', format: 'uuid' },
                      inventoryItemId: { type: 'string', format: 'uuid' },
                      itemName: { type: 'string', example: '22K Gold Chain' },
                      quantity: { type: 'integer', example: 1 },
                      grossWeight: { type: 'number', example: 10.500 },
                      stoneWeight: { type: 'number', example: 0.500 },
                      netWeight: { type: 'number', example: 10.000 },
                      purchaseRate: { type: 'number', example: 6000.00 },
                      makingCharges: { type: 'number', example: 500.00 },
                      taxRate: { type: 'number', example: 3.0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Purchase return draft created successfully' },
        400: { description: 'Validation error or invalid item data' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_return.create permission' },
      },
    },
    get: {
      summary: 'List Purchase Returns',
      description: 'Returns paginated list of purchase returns with search, vendor, branch, and status filters.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PROCESSED', 'CANCELLED'] } },
      ],
      responses: {
        200: { description: 'Paginated purchase returns retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_return.read permission' },
      },
    },
  },
  '/purchase-returns/{id}': {
    get: {
      summary: 'Get Purchase Return Details',
      description: 'Returns complete details of a purchase return including line items and associated Vendor Debit Note.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase return details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Purchase return not found' },
      },
    },
    put: {
      summary: 'Update Draft Purchase Return',
      description: 'Updates notes or return reason for a DRAFT purchase return.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase return updated successfully' },
        400: { description: 'Cannot update non-DRAFT return' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/purchase-returns/{id}/submit': {
    post: {
      summary: 'Submit Purchase Return',
      description: 'Transitions purchase return from DRAFT to SUBMITTED status.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase return submitted successfully' },
        400: { description: 'Invalid state transition' },
      },
    },
  },
  '/purchase-returns/{id}/approve': {
    post: {
      summary: 'Approve Purchase Return',
      description: 'Transitions purchase return from SUBMITTED to APPROVED status.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase return approved successfully' },
        400: { description: 'Invalid state transition' },
      },
    },
  },
  '/purchase-returns/{id}/process': {
    post: {
      summary: 'Process Purchase Return & Issue Vendor Debit Note',
      description: 'Processes APPROVED purchase return. Changes inventory status to RETURNED_TO_VENDOR, logs PURCHASE_RETURN StockMovement, generates Vendor Debit Note (DN-YYYY-XXXXX), and adjusts Purchase Bill balance.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase return processed, inventory updated, and Debit Note generated successfully' },
        400: { description: 'Return must be in APPROVED status' },
        409: { description: 'Inventory item is not in AVAILABLE status' },
      },
    },
  },
  '/purchase-returns/{id}/cancel': {
    post: {
      summary: 'Cancel Purchase Return',
      description: 'Cancels DRAFT or SUBMITTED purchase return with mandatory cancellation reason.',
      tags: ['Purchase Returns & Debit Notes'],
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
                cancellationReason: { type: 'string', example: 'Vendor agreed to repair item locally' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Purchase return cancelled successfully' },
        400: { description: 'Cannot cancel APPROVED or PROCESSED return' },
      },
    },
  },
  '/vendor-debit-notes': {
    get: {
      summary: 'List Vendor Debit Notes',
      description: 'Returns paginated list of vendor debit notes.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Paginated debit notes retrieved successfully' },
      },
    },
  },
  '/vendor-debit-notes/{id}': {
    get: {
      summary: 'Get Vendor Debit Note Details',
      description: 'Returns single vendor debit note details by ID.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Debit note details retrieved successfully' },
      },
    },
  },
  '/vendors/{id}/debit-notes': {
    get: {
      summary: 'Get Vendor Debit Notes by Vendor ID',
      description: 'Returns all debit notes issued to a specific vendor.',
      tags: ['Purchase Returns & Debit Notes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Vendor debit notes retrieved successfully' },
      },
    },
  },
};
