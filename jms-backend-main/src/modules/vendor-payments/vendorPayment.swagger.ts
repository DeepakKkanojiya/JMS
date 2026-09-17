export const vendorPaymentSwaggerDocs = {
  '/purchase-bills/{id}/payments': {
    post: {
      summary: 'Create Vendor Payment against Purchase Bill',
      description: 'Records a financial settlement payment against an APPROVED or PARTIALLY_PAID purchase bill. Supports CASH, CARD, UPI, BANK_TRANSFER, CHEQUE.',
      tags: ['Vendor Payments & Settlement'],
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
              required: ['vendorId', 'branchId', 'amount', 'paymentMethod'],
              properties: {
                vendorId: { type: 'string', format: 'uuid' },
                branchId: { type: 'string', format: 'uuid' },
                amount: { type: 'number', example: 50000.00 },
                paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'], example: 'BANK_TRANSFER' },
                transactionReference: { type: 'string', example: 'TXN-99887766' },
                paymentDate: { type: 'string', format: 'date-time' },
                remarks: { type: 'string', example: 'Part payment via bank transfer' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Vendor payment processed successfully' },
        400: { description: 'Validation error or bill is not in APPROVED/PARTIALLY_PAID status' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.create permission' },
        404: { description: 'Purchase bill, vendor, or branch not found' },
        409: { description: 'Conflict - Payment amount exceeds remaining outstanding balance' },
      },
    },
    get: {
      summary: 'Get Payment History for a Purchase Bill',
      description: 'Returns all vendor payment records associated with the specified Purchase Bill.',
      tags: ['Vendor Payments & Settlement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Purchase bill payment history retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.read permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
  },
  '/purchase-bills/{id}/payment-summary': {
    get: {
      summary: 'Get Payment Summary for a Purchase Bill',
      description: 'Returns grand total, total paid, outstanding amount, status, and method breakdown (Cash, Card, UPI, Bank Transfer, Cheque).',
      tags: ['Vendor Payments & Settlement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Payment summary retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.read permission' },
        404: { description: 'Purchase bill not found' },
      },
    },
  },
  '/vendor-payments': {
    get: {
      summary: 'List Vendor Payments',
      description: 'Returns paginated list of vendor payments with search, vendor, bill, branch, method, status, and date range filters.',
      tags: ['Vendor Payments & Settlement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'purchaseBillId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        { name: 'paymentMethod', in: 'query', schema: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE'] } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'] } },
        { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'paymentNumber', 'paymentDate', 'amount'] } },
        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
      ],
      responses: {
        200: { description: 'Paginated vendor payments list retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.read permission' },
      },
    },
  },
  '/vendor-payments/{id}': {
    get: {
      summary: 'Get Vendor Payment Details',
      description: 'Returns complete details for a single vendor payment by ID.',
      tags: ['Vendor Payments & Settlement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Vendor payment details retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.read permission' },
        404: { description: 'Vendor payment not found' },
      },
    },
  },
  '/vendor-payments/{id}/reverse': {
    post: {
      summary: 'Reverse Completed Vendor Payment',
      description: 'Reverses a COMPLETED vendor payment with mandatory reversal reason. Automatically recalculates purchase bill total paid and status.',
      tags: ['Vendor Payments & Settlement'],
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
                reversalReason: { type: 'string', example: 'Duplicate transaction recorded' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Vendor payment reversed successfully' },
        400: { description: 'Payment is not in COMPLETED status or missing reversal reason' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.reverse permission' },
        404: { description: 'Vendor payment not found' },
      },
    },
  },
  '/vendors/{id}/payments': {
    get: {
      summary: 'Get Vendor Payment History',
      description: 'Returns all payment records for a vendor across all purchase bills.',
      tags: ['Vendor Payments & Settlement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Vendor payment history retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.read permission' },
        404: { description: 'Vendor not found' },
      },
    },
  },
  '/vendors/{id}/payable-summary': {
    get: {
      summary: 'Get Vendor Payable Summary',
      description: 'Returns aggregate stats for vendor: total approved bills, total billed, total paid, total outstanding, partially paid count, fully paid count, overdue count.',
      tags: ['Vendor Payments & Settlement'],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Vendor payable summary retrieved successfully' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - Missing vendor_payment.read permission' },
        404: { description: 'Vendor not found' },
      },
    },
  },
};
