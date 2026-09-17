export const jobWorkSwaggerDocs = {
  '/job-work/orders': {
    post: {
      summary: 'Create Draft Job Work Order',
      description: 'Creates a draft job work order to assign jewellery manufacturing or alteration to a Karigar (artisan vendor).',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'branchId', 'vendorId', 'targetItemName'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                vendorId: { type: 'string', format: 'uuid' },
                targetItemName: { type: 'string', example: '22K Gold Bangle Set' },
                metalType: { type: 'string', example: 'GOLD' },
                purity: { type: 'string', example: '22K' },
                expectedDeliveryDate: { type: 'string', format: 'date-time' },
                agreedWastagePercent: { type: 'number', example: 1.5 },
                agreedMakingChargePerGram: { type: 'number', example: 350.00 },
                notes: { type: 'string', example: 'Custom antique polish pattern' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Job work order draft created successfully' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing job_work.create permission' },
      },
    },
    get: {
      summary: 'List Job Work Orders',
      description: 'Returns paginated list of job work orders with search, vendor, branch, and status filters.',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
      ],
      responses: {
        200: { description: 'Paginated job work orders retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/job-work/orders/{id}': {
    get: {
      summary: 'Get Job Work Order Details',
      description: 'Returns complete details of a job work order including issued raw materials and receipts.',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Job work order details retrieved successfully' },
        404: { description: 'Job work order not found' },
      },
    },
    put: {
      summary: 'Update Draft Job Work Order',
      description: 'Updates notes or parameters for a DRAFT job work order.',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Job work order updated successfully' },
        400: { description: 'Cannot update non-DRAFT order' },
      },
    },
  },
  '/job-work/orders/{id}/submit': {
    post: {
      summary: 'Submit Job Work Order',
      description: 'Transitions job work order from DRAFT to SUBMITTED status.',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Job work order submitted successfully' },
      },
    },
  },
  '/job-work/orders/{id}/assign': {
    post: {
      summary: 'Assign Job Work Order to Karigar',
      description: 'Transitions job work order from SUBMITTED to ASSIGNED status.',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Job work order assigned to Karigar successfully' },
      },
    },
  },
  '/job-work/orders/{id}/issue-material': {
    post: {
      summary: 'Issue Material to Karigar',
      description: 'Issues raw metal, gemstones, or inventory stock to Karigar. If inventory item is supplied, updates status to ISSUED_TO_KARIGAR and logs StockMovement.',
      tags: ['Karigar Job Work'],
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
              required: ['description', 'grossWeight', 'netWeight', 'purity', 'fineWeight'],
              properties: {
                itemType: { type: 'string', enum: ['RAW_METAL', 'LOOSE_STONE', 'INVENTORY_ITEM'] },
                inventoryItemId: { type: 'string', format: 'uuid' },
                description: { type: 'string', example: '24K Gold Fine Bullion Bar' },
                grossWeight: { type: 'number', example: 50.000 },
                stoneWeight: { type: 'number', example: 0.000 },
                netWeight: { type: 'number', example: 50.000 },
                purity: { type: 'string', example: '999' },
                fineWeight: { type: 'number', example: 49.950 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Material issued to Karigar successfully' },
        409: { description: 'Inventory item is not in AVAILABLE status' },
      },
    },
  },
  '/job-work/orders/{id}/receive': {
    post: {
      summary: 'Receive Finished Goods / Material from Karigar',
      description: 'Receives finished jewellery from Karigar, records actual wastage and making charges, and optionally creates new InventoryItem tag in AVAILABLE status.',
      tags: ['Karigar Job Work'],
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
              required: ['itemName', 'grossWeight', 'netWeight', 'purity', 'fineWeight'],
              properties: {
                itemName: { type: 'string', example: 'Finished 22K Gold Bangle Set' },
                grossWeight: { type: 'number', example: 48.500 },
                stoneWeight: { type: 'number', example: 0.500 },
                netWeight: { type: 'number', example: 48.000 },
                purity: { type: 'string', example: '22K' },
                fineWeight: { type: 'number', example: 44.000 },
                actualWastageWeight: { type: 'number', example: 0.750 },
                makingCharges: { type: 'number', example: 16800.00 },
                remarks: { type: 'string', example: 'Completed on schedule' },
                createInventoryItem: { type: 'boolean', example: true },
                productId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Finished goods received successfully' },
      },
    },
  },
  '/job-work/orders/{id}/cancel': {
    post: {
      summary: 'Cancel Job Work Order',
      description: 'Cancels job work order prior to material issuance with mandatory cancellation reason.',
      tags: ['Karigar Job Work'],
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
                cancellationReason: { type: 'string', example: 'Customer cancelled custom design order' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Job work order cancelled successfully' },
        400: { description: 'Cannot cancel order after materials have been issued' },
      },
    },
  },
  '/karigars/{id}/job-work-summary': {
    get: {
      summary: 'Get Karigar Job Work Ledger Summary',
      description: 'Returns total orders, active count, issued fine weight, received fine weight, wastage, net pending balance, and total making charges for a Karigar.',
      tags: ['Karigar Job Work'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Karigar summary retrieved successfully' },
      },
    },
  },
};
