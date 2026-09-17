export const approvalSwaggerDocs = {
  '/approvals': {
    post: {
      summary: 'Create Sell on Approval Slip',
      description: 'Creates a new Sell on Approval slip with item details.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'branchId', 'customerId', 'dueDate', 'items'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                customerId: { type: 'string', format: 'uuid' },
                salespersonId: { type: 'string', format: 'uuid' },
                dueDate: { type: 'string', format: 'date-time' },
                notes: { type: 'string', example: 'Approval for wedding selection' },
                requiredDepositAmount: { type: 'number', example: 50000.0 },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['inventoryItemId'],
                    properties: {
                      inventoryItemId: { type: 'string', format: 'uuid' },
                      quantity: { type: 'integer', default: 1 },
                      unitPrice: { type: 'number', example: 45000.0 },
                      notes: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Approval slip created successfully' },
        400: { description: 'Validation error' },
      },
    },
    get: {
      summary: 'List Sell on Approval Slips',
      description: 'Returns paginated Sell on Approval slips.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ISSUED', 'WITH_CUSTOMER', 'RETURNED', 'PURCHASED', 'EXPIRED', 'CANCELLED'] } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'customerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'salespersonId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Paginated approval slips retrieved successfully' },
      },
    },
  },
  '/approvals/reports/summary': {
    get: {
      summary: 'Get Approval Summary Metrics Report',
      description: 'Returns read-only aggregated summary metrics across all approval slips, values, and deposits.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Aggregated approval summary metrics retrieved successfully' },
      },
    },
  },
  '/approvals/reports/register': {
    get: {
      summary: 'Get Approval Register Report',
      description: 'Returns paginated and filterable detailed approval register.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'customerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ISSUED', 'WITH_CUSTOMER', 'RETURNED', 'PURCHASED', 'EXPIRED', 'CANCELLED'] } },
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'isOverdue', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: { description: 'Approval register retrieved successfully' },
      },
    },
  },
  '/approvals/reports/inventory': {
    get: {
      summary: 'Get Inventory on Approval Report',
      description: 'Returns read-only report of physical jewellery currently locked under ON_APPROVAL status.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Inventory on approval report retrieved successfully' },
      },
    },
  },
  '/approvals/reports/deposits': {
    get: {
      summary: 'Get Approval Deposit Ledger Report',
      description: 'Returns read-only deposit ledger including completed and reversed records with summary totals.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'customerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Deposit ledger report retrieved successfully' },
      },
    },
  },
  '/approvals/reports/returns-purchases': {
    get: {
      summary: 'Get Return vs Purchase Conversion Report',
      description: 'Returns comparative reporting of returned vs purchased approvals with conversion rates.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Return vs purchase report retrieved successfully' },
      },
    },
  },
  '/approvals/reports/customer/{customerId}': {
    get: {
      summary: 'Get Customer 360 Approval History',
      description: 'Returns customer-level approval history including active slips, total deposits, and purchase invoices.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'customerId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Customer approval history retrieved successfully' },
        404: { description: 'Customer not found' },
      },
    },
  },
  '/approvals/reports/ageing': {
    get: {
      summary: 'Get Approval Ageing & Overdue Report',
      description: 'Returns active approvals grouped into ageing buckets (Current, 1-7 days, 8-30 days, 31-60 days, 60+ days overdue).',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Ageing report retrieved successfully' },
      },
    },
  },
  '/approvals/{id}/audit-trail': {
    get: {
      summary: 'Get 360-Degree Approval Audit Trail',
      description: 'Returns chronological event timeline for an approval slip synthesized from approval, inventory, deposit, and invoice ledgers.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Audit trail retrieved successfully' },
        404: { description: 'Approval not found' },
      },
    },
  },
  '/approvals/{id}': {
    get: {
      summary: 'Get Approval Slip Details',
      description: 'Retrieves details of a Sell on Approval slip by ID.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Approval slip details retrieved successfully' },
        404: { description: 'Approval record not found' },
      },
    },
    put: {
      summary: 'Update Draft Approval Slip',
      description: 'Updates a draft Sell on Approval slip.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Approval slip updated successfully' },
      },
    },
  },
  '/approvals/{id}/issue': {
    post: {
      summary: 'Issue Approval Slip',
      description: 'Issues a draft Sell on Approval slip to the customer and locks inventory (AVAILABLE -> ON_APPROVAL).',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Approval slip issued successfully' },
        400: { description: 'Invalid state or item unavailable' },
        409: { description: 'Concurrency conflict or item already locked' },
      },
    },
  },
  '/approvals/{id}/cancel': {
    post: {
      summary: 'Cancel Draft Approval Slip',
      description: 'Cancels a draft Sell on Approval slip.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Approval slip cancelled successfully' },
      },
    },
  },
  '/approvals/{id}/return': {
    post: {
      summary: 'Return Customer Jewellery on Approval',
      description: 'Processes customer jewellery return, transitioning items ON_APPROVAL -> AVAILABLE and logging APPROVAL_RETURN stock movements.',
      tags: ['Sell on Approval Subsystem'],
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
                returnReason: { type: 'string', example: 'Customer selected alternative design' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Approval items returned to inventory successfully' },
        400: { description: 'Invalid approval status or not issued' },
        409: { description: 'Concurrency conflict or item no longer on approval' },
      },
    },
  },
  '/approvals/{id}/purchase': {
    post: {
      summary: 'Confirm Purchase Conversion for Approval Slip',
      description: 'Converts an approval slip to a completed Sales Invoice, transitioning items ON_APPROVAL -> SOLD, creating SALE stock movements, and applying deposit credit.',
      tags: ['Sell on Approval Subsystem'],
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
                discountAmount: { type: 'number', example: 2000.0 },
                notes: { type: 'string', example: 'Customer confirmed purchase after 3 days' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Approval converted to confirmed Sales Invoice successfully' },
        400: { description: 'Invalid approval status or missing prerequisites' },
        409: { description: 'Concurrency conflict or item no longer on approval' },
      },
    },
  },
  '/approvals/{id}/deposits': {
    post: {
      summary: 'Record Approval Security Deposit Payment',
      description: 'Records a security deposit payment against an issued Sell on Approval slip.',
      tags: ['Sell on Approval Subsystem'],
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
              required: ['paymentMethod', 'amount'],
              properties: {
                paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] },
                amount: { type: 'number', example: 25000.0 },
                transactionReference: { type: 'string', example: 'UPI-TXN-998877' },
                paymentDate: { type: 'string', format: 'date-time' },
                remarks: { type: 'string', example: 'Initial 50% security deposit' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Approval deposit payment recorded successfully' },
        400: { description: 'Validation error or invalid approval status' },
        409: { description: 'Overpayment conflict or deposit already fully paid' },
      },
    },
    get: {
      summary: 'List Deposits for Approval Slip',
      description: 'Returns all security deposit payments for a specific approval slip.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Deposits retrieved successfully' },
      },
    },
  },
  '/approvals/{id}/deposit-summary': {
    get: {
      summary: 'Get Approval Deposit Financial Summary',
      description: 'Returns backend-authoritative deposit summary (required, completed, reversed, outstanding, depositStatus).',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Deposit summary calculated successfully' },
      },
    },
  },
  '/approval-deposits': {
    get: {
      summary: 'Global Approval Deposit Ledger',
      description: 'Returns paginated global deposit ledger with search and filters.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'] } },
        { name: 'paymentMethod', in: 'query', schema: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] } },
      ],
      responses: {
        200: { description: 'Deposit ledger retrieved successfully' },
      },
    },
  },
  '/approval-deposits/{id}': {
    get: {
      summary: 'Get Approval Deposit Details',
      description: 'Retrieves details of a specific approval deposit payment.',
      tags: ['Sell on Approval Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Deposit details retrieved successfully' },
        404: { description: 'Deposit record not found' },
      },
    },
  },
  '/approval-deposits/{id}/reverse': {
    post: {
      summary: 'Reverse Approval Deposit Payment',
      description: 'Reverses a completed approval deposit payment with mandatory reason.',
      tags: ['Sell on Approval Subsystem'],
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
              required: ['reversalReason'],
              properties: {
                reversalReason: { type: 'string', example: 'Customer cancelled selection before taking delivery' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Deposit payment reversed successfully' },
        400: { description: 'Deposit already reversed or invalid reason' },
      },
    },
  },
};
