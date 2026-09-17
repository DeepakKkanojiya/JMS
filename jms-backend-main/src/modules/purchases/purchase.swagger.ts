export const purchaseSwaggerDocs = {
  '/purchases': {
    post: {
      summary: 'Create Draft Purchase Order',
      description: 'Creates a new procurement purchase order in DRAFT status with jewellery line items and authoritative server-side calculations.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['vendorId', 'branchId', 'items'],
              properties: {
                vendorId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                branchId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
                orderDate: { type: 'string', format: 'date-time', example: '2026-08-18T10:00:00.000Z' },
                expectedDeliveryDate: { type: 'string', format: 'date-time', example: '2026-08-25T18:00:00.000Z' },
                notes: { type: 'string', example: '22K Gold Bangles and Necklace bulk order' },
                termsConditions: { type: 'string', example: 'Payment within 30 days of physical delivery & purity verification' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['metalType', 'purity', 'itemName', 'grossWeight', 'netWeight', 'expectedRate'],
                    properties: {
                      productId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
                      metalType: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'], example: 'GOLD' },
                      purity: { type: 'string', example: '22K' },
                      itemName: { type: 'string', example: '22K Traditional Gold Bangle' },
                      description: { type: 'string', example: 'Handcrafted floral design' },
                      orderedQuantity: { type: 'integer', example: 5 },
                      grossWeight: { type: 'number', example: 50.000 },
                      netWeight: { type: 'number', example: 48.500 },
                      stoneWeight: { type: 'number', example: 1.500 },
                      expectedRate: { type: 'number', example: 6850.00 },
                      makingCharges: { type: 'number', example: 2500.00 },
                      taxRate: { type: 'number', example: 3.00 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Purchase order created successfully in DRAFT status' },
        400: { description: 'Validation error or invalid branch/vendor status' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.create permission' },
        404: { description: 'Branch or Vendor not found' },
      },
    },
    get: {
      summary: 'List Purchase Orders',
      description: 'Returns paginated list of purchase orders with search, vendor, branch, status, and date range filters.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVING', 'COMPLETED', 'CANCELLED'] } },
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'purchaseOrderNumber', 'orderDate', 'grandTotal'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Paginated purchase orders list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.read permission' },
      },
    },
  },
  '/purchases/{id}': {
    get: {
      summary: 'Get Purchase Order Details',
      description: 'Returns complete purchase order details by ID including line items, vendor details, and branch showroom.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase order details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.read permission' },
        404: { description: 'Purchase order not found' },
      },
    },
    put: {
      summary: 'Update Draft Purchase Order',
      description: 'Updates a DRAFT purchase order and recalculates line items and totals. Orders that are SUBMITTED, APPROVED, or CANCELLED cannot be modified.',
      tags: ['Purchases & Procurement'],
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
                vendorId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                orderDate: { type: 'string', format: 'date-time' },
                expectedDeliveryDate: { type: 'string', format: 'date-time' },
                notes: { type: 'string' },
                termsConditions: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['metalType', 'purity', 'itemName', 'grossWeight', 'netWeight', 'expectedRate'],
                    properties: {
                      productId: { type: 'string', format: 'uuid' },
                      metalType: { type: 'string', enum: ['GOLD', 'SILVER', 'PLATINUM'] },
                      purity: { type: 'string' },
                      itemName: { type: 'string' },
                      description: { type: 'string' },
                      orderedQuantity: { type: 'integer' },
                      grossWeight: { type: 'number' },
                      netWeight: { type: 'number' },
                      stoneWeight: { type: 'number' },
                      expectedRate: { type: 'number' },
                      makingCharges: { type: 'number' },
                      taxRate: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Draft purchase order updated successfully' },
        400: { description: 'Validation error or invalid status for editing' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.update permission' },
        404: { description: 'Purchase order not found' },
      },
    },
  },
  '/purchases/{id}/submit': {
    post: {
      summary: 'Submit Draft Purchase Order for Approval',
      description: 'Transitions purchase order from DRAFT to SUBMITTED status and locks normal edits.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase order submitted for approval successfully' },
        400: { description: 'Current status is not DRAFT or order has no line items' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.submit permission' },
        404: { description: 'Purchase order not found' },
      },
    },
  },
  '/purchases/{id}/approve': {
    post: {
      summary: 'Approve Submitted Purchase Order',
      description: 'Transitions purchase order from SUBMITTED to APPROVED status.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase order approved successfully' },
        400: { description: 'Current status is not SUBMITTED' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.approve permission' },
        404: { description: 'Purchase order not found' },
      },
    },
  },
  '/purchases/{id}/cancel': {
    post: {
      summary: 'Cancel Purchase Order',
      description: 'Cancels a DRAFT, SUBMITTED, or APPROVED purchase order with a mandatory cancellation reason.',
      tags: ['Purchases & Procurement'],
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
                cancellationReason: { type: 'string', example: 'Supplier out of stock / pricing mismatch' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Purchase order cancelled successfully' },
        400: { description: 'Order already cancelled, receiving, or completed' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.cancel permission' },
        404: { description: 'Purchase order not found' },
      },
    },
  },
  '/purchases/{id}/receive': {
    post: {
      summary: 'Receive Items & Generate Inventory',
      description: 'Receives physical jewellery items against an APPROVED or RECEIVING purchase order, generating unique inventory items, barcodes, and stock movements.',
      tags: ['Purchases & Procurement'],
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
              required: ['items'],
              properties: {
                receivedDate: { type: 'string', format: 'date-time', example: '2026-08-19T10:00:00.000Z' },
                remarks: { type: 'string', example: 'Received initial partial delivery' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['purchaseOrderItemId', 'receivedQuantity', 'grossWeight', 'netWeight', 'purchaseRate'],
                    properties: {
                      purchaseOrderItemId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174004' },
                      receivedQuantity: { type: 'integer', example: 1 },
                      grossWeight: { type: 'number', example: 10.500 },
                      netWeight: { type: 'number', example: 10.200 },
                      stoneWeight: { type: 'number', example: 0.300 },
                      purchaseRate: { type: 'number', example: 6800.00 },
                      makingCharges: { type: 'number', example: 500.00 },
                      taxRate: { type: 'number', example: 3.00 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Purchase items received and inventory items generated successfully' },
        400: { description: 'Validation error or exceeding remaining quantities' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.receive permission' },
        404: { description: 'Purchase order not found' },
      },
    },
  },
  '/purchases/{id}/receipts': {
    get: {
      summary: 'Get Receipts for Purchase Order',
      description: 'Returns list of all purchase receipts created for a specific purchase order.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase order receipts list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.receipt.read permission' },
      },
    },
  },
  '/purchases/{id}/receipts/{receiptId}': {
    get: {
      summary: 'Get Specific Purchase Order Receipt',
      description: 'Returns details of a specific purchase receipt belonging to a purchase order.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'receiptId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Receipt details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.receipt.read permission' },
        404: { description: 'Receipt not found' },
      },
    },
  },
  '/purchase-receipts': {
    get: {
      summary: 'List All Purchase Receipts',
      description: 'Returns paginated list of purchase receipts across all purchase orders.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'purchaseOrderId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'purchaseReceiptNumber', 'receivedDate', 'grandTotal'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Purchase receipts list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.receipt.read permission' },
      },
    },
  },
  '/purchase-receipts/{id}': {
    get: {
      summary: 'Get Purchase Receipt Details',
      description: 'Returns complete purchase receipt details by receipt ID including items and generated inventory barcode tags.',
      tags: ['Purchases & Procurement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase receipt details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase.receipt.read permission' },
        404: { description: 'Purchase receipt not found' },
      },
    },
  },
};
