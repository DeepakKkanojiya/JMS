export const purchaseBillSwaggerDocs = {
  '/purchase-bills': {
    post: {
      summary: 'Create Draft Purchase Bill',
      description: 'Creates a new purchase bill in DRAFT status against received stock from a purchase order.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['purchaseOrderId', 'vendorId', 'branchId', 'items'],
              properties: {
                purchaseOrderId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                vendorId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
                branchId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174002' },
                billDate: { type: 'string', format: 'date-time', example: '2026-08-20T10:00:00.000Z' },
                dueDate: { type: 'string', format: 'date-time', example: '2026-09-20T18:00:00.000Z' },
                discountAmount: { type: 'number', example: 100.00 },
                notes: { type: 'string', example: 'Procurement invoice for August stock intake' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['itemName', 'quantity', 'purchaseRate'],
                    properties: {
                      purchaseOrderItemId: { type: 'string', format: 'uuid' },
                      purchaseReceiptItemId: { type: 'string', format: 'uuid' },
                      inventoryItemId: { type: 'string', format: 'uuid' },
                      itemName: { type: 'string', example: '22K Gold Bangle' },
                      description: { type: 'string', example: 'Item description' },
                      quantity: { type: 'integer', example: 2 },
                      grossWeight: { type: 'number', example: 20.000 },
                      stoneWeight: { type: 'number', example: 0.500 },
                      netWeight: { type: 'number', example: 19.500 },
                      purchaseRate: { type: 'number', example: 6800.00 },
                      makingCharges: { type: 'number', example: 1000.00 },
                      discountAmount: { type: 'number', example: 50.00 },
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
        201: { description: 'Purchase bill created successfully in DRAFT status' },
        400: { description: 'Validation error or invalid PO/vendor/branch status' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.create permission' },
        404: { description: 'PO, Vendor, or Branch not found' },
        409: { description: 'Conflict - Requested quantity exceeds billable limit or inventory item already billed' },
      },
    },
    get: {
      summary: 'List Purchase Bills',
      description: 'Returns paginated list of purchase bills with search, vendor, branch, PO, status, and date range filters.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'purchaseOrderId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'] } },
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'billNumber', 'billDate', 'grandTotal', 'outstandingAmount'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Paginated purchase bills list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.read permission' },
      },
    },
  },
  '/purchase-bills/{id}': {
    get: {
      summary: 'Get Purchase Bill Details',
      description: 'Returns complete purchase bill details by ID including line items, vendor details, and branch showroom.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase bill details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.read permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
    put: {
      summary: 'Update Draft Purchase Bill',
      description: 'Updates a DRAFT purchase bill and recalculates line items and totals. Bills that are SUBMITTED, APPROVED, or CANCELLED cannot be modified.',
      tags: ['Purchase Bills & Costing'],
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
                dueDate: { type: 'string', format: 'date-time' },
                discountAmount: { type: 'number' },
                notes: { type: 'string' },
                items: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Draft purchase bill updated successfully' },
        400: { description: 'Validation error or bill is not in DRAFT status' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.update permission' },
        404: { description: 'Purchase bill not found' },
        409: { description: 'Conflict - Over-billing requested' },
      },
    },
  },
  '/purchase-bills/{id}/submit': {
    post: {
      summary: 'Submit Purchase Bill',
      description: 'Submits a DRAFT purchase bill for approval (DRAFT -> SUBMITTED).',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase bill submitted successfully' },
        400: { description: 'Invalid state transition' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.submit permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
  },
  '/purchase-bills/{id}/approve': {
    post: {
      summary: 'Approve Purchase Bill',
      description: 'Approves a SUBMITTED purchase bill (SUBMITTED -> APPROVED). Once approved, the bill is immutable.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase bill approved successfully' },
        400: { description: 'Invalid state transition' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.approve permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
  },
  '/purchase-bills/{id}/cancel': {
    post: {
      summary: 'Cancel Purchase Bill',
      description: 'Cancels a DRAFT or SUBMITTED purchase bill with a mandatory cancellation reason.',
      tags: ['Purchase Bills & Costing'],
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
                cancellationReason: { type: 'string', example: 'Vendor issued corrected revised bill' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Purchase bill cancelled successfully' },
        400: { description: 'Missing cancellation reason or invalid state transition' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.cancel permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
  },
  '/purchase-bills/{id}/summary': {
    get: {
      summary: 'Get Purchase Bill Financial Summary',
      description: 'Returns subtotal, discount, tax, grand total, total paid, outstanding amount, and status.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Bill summary retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.read permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
  },
  '/purchases/{id}/bills': {
    get: {
      summary: 'Get Purchase Bills for a Purchase Order',
      description: 'Returns all purchase bills created against the specified Purchase Order.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase bills for purchase order retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.read permission' },
        404: { description: 'Purchase Order not found' },
      },
    },
  },
  '/vendors/{id}/purchase-bills': {
    get: {
      summary: 'Get Purchase Bills for a Vendor',
      description: 'Returns all purchase bills associated with the specified vendor.',
      tags: ['Purchase Bills & Costing'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase bills for vendor retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing purchase_bill.read permission' },
        404: { description: 'Vendor not found' },
      },
    },
  },
};
