export const thirdPartyGirviSwaggerDocs = {
  '/girvi/third-party/lenders': {
    post: {
      summary: 'Create Third-Party Lender',
      description: 'Creates a new external lender or finance company record.',
      tags: ['Third-Party Girvi Subsystem'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'lenderCode', 'name'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                lenderCode: { type: 'string', example: 'LDR-0001' },
                name: { type: 'string', example: 'Muthoot Finance' },
                contactPerson: { type: 'string', example: 'Rajesh Sharma' },
                mobile: { type: 'string', example: '9876543210' },
                email: { type: 'string', example: 'contact@muthoot.com' },
                address: { type: 'string', example: 'Main Market Branch, Jaipur' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Third-party lender created successfully' },
        400: { description: 'Validation error' },
        409: { description: 'Lender code already exists' },
      },
    },
    get: {
      summary: 'List Third-Party Lenders',
      description: 'Returns active third-party lenders for a company.',
      tags: ['Third-Party Girvi Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'companyId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Lenders retrieved successfully' },
      },
    },
  },
  '/girvi/third-party/loans': {
    post: {
      summary: 'Create Third-Party Girvi Record',
      description: 'Records an external third-party Girvi relationship and pledged collateral information.',
      tags: ['Third-Party Girvi Subsystem'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['companyId', 'branchId', 'customerId', 'thirdPartyLenderId', 'externalLoanNumber', 'dueDate', 'principalAmount'],
              properties: {
                companyId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                customerId: { type: 'string', format: 'uuid' },
                thirdPartyLenderId: { type: 'string', format: 'uuid' },
                externalLoanNumber: { type: 'string', example: 'MUT-2026-9988' },
                dueDate: { type: 'string', format: 'date-time' },
                principalAmount: { type: 'number', example: 100000.00 },
                valuationAmount: { type: 'number', example: 140000.00 },
                interestRate: { type: 'number', example: 1.50 },
                interestPeriod: { type: 'string', enum: ['MONTHLY', 'ANNUAL'], default: 'MONTHLY' },
                notes: { type: 'string', example: 'Third-party pledge via Muthoot' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Third-party Girvi created successfully' },
        409: { description: 'External loan number already exists for lender' },
      },
    },
    get: {
      summary: 'List Third-Party Girvis',
      description: 'Returns paginated third-party Girvi records.',
      tags: ['Third-Party Girvi Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED'] } },
      ],
      responses: {
        200: { description: 'Paginated third-party Girvis retrieved successfully' },
      },
    },
  },
  '/girvi/third-party/loans/{id}': {
    get: {
      summary: 'Get Third-Party Girvi Details',
      description: 'Retrieves details of a third-party Girvi record.',
      tags: ['Third-Party Girvi Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Third-party Girvi details retrieved successfully' },
        404: { description: 'Record not found' },
      },
    },
  },
  '/girvi/third-party/loans/{id}/approve': {
    post: {
      summary: 'Approve Third-Party Girvi',
      description: 'Activates a draft third-party Girvi record.',
      tags: ['Third-Party Girvi Subsystem'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Record approved successfully' },
      },
    },
  },
  '/girvi/third-party/loans/{id}/close': {
    post: {
      summary: 'Close Third-Party Girvi & Release Collateral',
      description: 'Closes an active third-party Girvi relationship and releases pledged collateral.',
      tags: ['Third-Party Girvi Subsystem'],
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
              required: ['closureReason'],
              properties: {
                closureReason: { type: 'string', example: 'Loan closed with external lender' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Record closed and collateral released successfully' },
      },
    },
  },
};
