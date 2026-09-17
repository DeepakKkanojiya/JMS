export const girviSwaggerDocs = {
  '/girvi/loans': {
    post: {
      summary: 'Create Self Girvi Loan',
      description: 'Creates a new Self Girvi collateral loan for a customer with pledged inventory items or jewellery snapshots.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'branchId', 'customerId', 'dueDate', 'principalAmount'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                customerId: { type: 'string', format: 'uuid' },
                dueDate: { type: 'string', format: 'date-time' },
                principalAmount: { type: 'number', example: 50000.00 },
                valuationAmount: { type: 'number', example: 65000.00 },
                interestRate: { type: 'number', example: 1.50 },
                interestPeriod: { type: 'string', enum: ['MONTHLY', 'ANNUAL'], default: 'MONTHLY' },
                notes: { type: 'string', example: 'Gold necklace pledged for 6 months' },
                documentRef: { type: 'string', example: 'DOC-GIRVI-2026-001' },
                collaterals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['itemName', 'grossWeight', 'netWeight'],
                    properties: {
                      inventoryItemId: { type: 'string', format: 'uuid' },
                      itemName: { type: 'string', example: '22K Gold Chain' },
                      metalType: { type: 'string', example: 'GOLD' },
                      purity: { type: 'string', example: '22K' },
                      grossWeight: { type: 'number', example: 15.500 },
                      stoneWeight: { type: 'number', example: 0.500 },
                      netWeight: { type: 'number', example: 15.000 },
                      valuedAmount: { type: 'number', example: 65000.00 },
                      barcode: { type: 'string', example: 'BC100234' },
                      rfidEpc: { type: 'string', example: 'E2003411' },
                      imageUrl: { type: 'string', example: '/uploads/girvi/item1.jpg' },
                      remarks: { type: 'string', example: 'Slight scratch near hook' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Girvi loan created successfully' },
        400: { description: 'Validation error' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing girvi.create permission' },
      },
    },
    get: {
      summary: 'List Girvi Loans',
      description: 'Returns paginated list of Girvi loans with search, branch, customer, and status filters.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'customerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'RENEWED', 'CLOSED', 'DEFAULTED', 'CANCELLED'] } },
      ],
      responses: {
        200: { description: 'Paginated Girvi loans retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/girvi/loans/{id}': {
    get: {
      summary: 'Get Girvi Loan Details',
      description: 'Retrieves complete details of a Girvi loan including customer and pledged collateral items.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Girvi loan details retrieved successfully' },
        404: { description: 'Girvi loan not found' },
      },
    },
    put: {
      summary: 'Update Girvi Loan',
      description: 'Updates details of an active/draft Girvi loan.',
      tags: ['Girvi Pawning Subsystem'],
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
                principalAmount: { type: 'number' },
                valuationAmount: { type: 'number' },
                interestRate: { type: 'number' },
                interestPeriod: { type: 'string', enum: ['MONTHLY', 'ANNUAL'] },
                notes: { type: 'string' },
                documentRef: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Girvi loan updated successfully' },
        400: { description: 'Bad request or invalid status' },
        404: { description: 'Girvi loan not found' },
      },
    },
  },
  '/girvi/loans/{id}/financial-summary': {
    get: {
      summary: 'Get Loan Financial Summary & Accrued Interest',
      description: 'Calculates real-time interest accrual, outstanding principal/interest, total outstanding, and overdue days.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'asOfDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
      ],
      responses: {
        200: { description: 'Financial summary retrieved successfully' },
        404: { description: 'Girvi loan not found' },
      },
    },
  },
  '/girvi/collections': {
    post: {
      summary: 'Record Girvi Collection (Payment Receipt)',
      description: 'Records an atomic interest and principal payment collection for a Girvi loan.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['girviLoanId', 'paymentMethod', 'amount'],
              properties: {
                girviLoanId: { type: 'string', format: 'uuid' },
                paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] },
                amount: { type: 'number', example: 5000.00 },
                principalAmount: { type: 'number', example: 3000.00 },
                interestAmount: { type: 'number', example: 2000.00 },
                transactionReference: { type: 'string', example: 'UPI-REF-998877' },
                remarks: { type: 'string', example: 'Partial interest & principal collection' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Girvi collection recorded successfully' },
        400: { description: 'Validation or amount mismatch error' },
        409: { description: 'Over-collection guard triggered' },
      },
    },
    get: {
      summary: 'List Girvi Collections',
      description: 'Returns paginated list of Girvi collections across loans.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'girviLoanId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['COMPLETED', 'REVERSED'] } },
      ],
      responses: {
        200: { description: 'Paginated collections retrieved successfully' },
      },
    },
  },
  '/girvi/collections/{id}/reverse': {
    post: {
      summary: 'Reverse Girvi Collection',
      description: 'Reverses a completed Girvi collection with mandatory reversal reason.',
      tags: ['Girvi Pawning Subsystem'],
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
                reversalReason: { type: 'string', example: 'Payment entered against wrong loan ID' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Collection reversed successfully' },
        400: { description: 'Collection already reversed or missing reason' },
      },
    },
  },
  '/girvi/loans/{id}/renew': {
    post: {
      summary: 'Renew Girvi Loan',
      description: 'Renews an active/overdue loan, extends due date, and logs immutable GirviRenewal record.',
      tags: ['Girvi Pawning Subsystem'],
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
              required: ['newDueDate'],
              properties: {
                newDueDate: { type: 'string', format: 'date-time' },
                remarks: { type: 'string', example: 'Extended for 6 additional months after interest payment' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Girvi loan renewed successfully' },
        400: { description: 'Invalid new due date or status' },
      },
    },
  },
  '/girvi/overdue-loans': {
    get: {
      summary: 'List Overdue Loans',
      description: 'Retrieves active/renewed Girvi loans that are overdue or due-soon with financial metrics.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'daysThreshold', in: 'query', schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Overdue loans retrieved successfully' },
      },
    },
  },
  '/girvi/loans/{id}/settle': {
    post: {
      summary: 'Settle Girvi Loan & Release Jewellery',
      description: 'Settles remaining principal + interest balance, releases pledged collateral items, restores inventory items to AVAILABLE status, and closes the loan.',
      tags: ['Girvi Pawning Subsystem'],
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
              required: ['paymentMethod'],
              properties: {
                paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] },
                totalSettlementAmount: { type: 'number', example: 52500.00 },
                principalSettled: { type: 'number', example: 50000.00 },
                interestSettled: { type: 'number', example: 2500.00 },
                transactionReference: { type: 'string', example: 'SETTLE-BANK-9988' },
                remarks: { type: 'string', example: 'Full settlement paid by customer' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Girvi loan settled and collateral jewellery released successfully' },
        400: { description: 'Settlement amount mismatch or invalid loan state' },
        409: { description: 'Girvi loan already closed/settled' },
      },
    },
  },
  '/girvi/settlements': {
    get: {
      summary: 'List Girvi Settlements',
      description: 'Returns paginated list of Girvi loan settlements.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Paginated settlements retrieved successfully' },
      },
    },
  },
  '/girvi/settlements/{id}': {
    get: {
      summary: 'Get Settlement Details by ID',
      description: 'Retrieves complete details of a Girvi settlement record.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Settlement details retrieved successfully' },
        404: { description: 'Settlement not found' },
      },
    },
  },
  '/girvi/loans/{id}/released-collateral': {
    get: {
      summary: 'Get Released Collateral Items',
      description: 'Retrieves pledged collateral items that have been released to customer.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Released collateral items retrieved successfully' },
      },
    },
  },
  '/girvi/loans/{id}/audit-trail': {
    get: {
      summary: 'Get 360-Degree Girvi Loan Audit Trail',
      description: 'Retrieves complete chronological timeline of events (creation, approval, collection, reversal, renewal, settlement, release, cancellation) for a Girvi loan.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
      ],
      responses: {
        200: { description: 'Chronological audit trail retrieved successfully' },
      },
    },
  },
  '/girvi/reports/portfolio': {
    get: {
      summary: 'Get Girvi Portfolio Summary Report',
      description: 'Returns portfolio financial metrics (active loans, principal issued, accrued interest, collected payments, portfolio outstanding).',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Portfolio report retrieved successfully' },
      },
    },
  },
  '/girvi/reports/overdue-aging': {
    get: {
      summary: 'Get Overdue Aging Analysis Report',
      description: 'Buckets active Girvi loans into 0-30, 31-60, 61-90, and 90+ days overdue aging categories.',
      tags: ['Girvi Pawning Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Overdue aging report retrieved successfully' },
      },
    },
  },
};


