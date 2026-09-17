import { prisma } from '../database';
import { Prisma, PaymentMethod, PaymentStatus } from '../generated/prisma';

export interface CreateSalesPaymentInput {
  salesInvoiceId: string;
  paymentNumber: string;
  paymentMethod: PaymentMethod;
  amount: Prisma.Decimal | number | string;
  status?: PaymentStatus;
  transactionReference?: string | null;
  paymentDate?: Date | string;
  remarks?: string | null;
  receivedBy?: string | null;
}

export interface ReverseSalesPaymentInput {
  reversedBy: string;
  reversalReason: string;
  reversedAt?: Date;
}

export interface SalesPaymentQueryParams {
  page?: number;
  limit?: number;
  salesInvoiceId?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SalesPaymentRepository {
  /**
   * Create a new sales payment inside a transaction or standard client.
   */
  async create(data: CreateSalesPaymentInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesPayment.create({
      data: {
        salesInvoiceId: data.salesInvoiceId,
        paymentNumber: data.paymentNumber,
        paymentMethod: data.paymentMethod,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || PaymentStatus.COMPLETED,
        transactionReference: data.transactionReference || null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        remarks: data.remarks || null,
        receivedBy: data.receivedBy || null,
      },
      include: {
        salesInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            grandTotal: true,
            totalPaid: true,
            outstandingAmount: true,
            paymentStatus: true,
          },
        },
      },
    });
  }

  /**
   * Find single payment by ID.
   */
  async findById(id: string) {
    return prisma.salesPayment.findUnique({
      where: { id },
      include: {
        salesInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            grandTotal: true,
            totalPaid: true,
            outstandingAmount: true,
            paymentStatus: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                mobile: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find single payment by paymentNumber.
   */
  async findByPaymentNumber(paymentNumber: string) {
    return prisma.salesPayment.findUnique({
      where: { paymentNumber },
    });
  }

  /**
   * Calculate total completed payments for an invoice inside transaction or standard client.
   */
  async getCompletedPaymentTotal(salesInvoiceId: string, tx?: Prisma.TransactionClient): Promise<Prisma.Decimal> {
    const client = tx || prisma;
    const result = await client.salesPayment.aggregate({
      where: {
        salesInvoiceId,
        status: PaymentStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || new Prisma.Decimal(0);
  }

  /**
   * Find all payments with pagination, filters, and search.
   */
  async findAll(params: SalesPaymentQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SalesPaymentWhereInput = {};

    if (params.salesInvoiceId) {
      where.salesInvoiceId = params.salesInvoiceId;
    }

    if (params.paymentMethod) {
      where.paymentMethod = params.paymentMethod;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.dateFrom || params.dateTo) {
      where.paymentDate = {};
      if (params.dateFrom) where.paymentDate.gte = new Date(params.dateFrom);
      if (params.dateTo) where.paymentDate.lte = new Date(params.dateTo);
    }

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { paymentNumber: { contains: term, mode: 'insensitive' } },
        { transactionReference: { contains: term, mode: 'insensitive' } },
        { remarks: { contains: term, mode: 'insensitive' } },
        { salesInvoice: { invoiceNumber: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const sortBy = params.sortBy && ['createdAt', 'paymentDate', 'amount', 'paymentNumber'].includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      prisma.salesPayment.count({ where }),
      prisma.salesPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          salesInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
              grandTotal: true,
              paymentStatus: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get payments for specific sales invoice.
   */
  async findByInvoiceId(salesInvoiceId: string, params: SalesPaymentQueryParams = {}) {
    return this.findAll({ ...params, salesInvoiceId });
  }

  /**
   * Get detailed payment summary breakdown by payment method for an invoice.
   */
  async getPaymentSummary(salesInvoiceId: string) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { id: salesInvoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        grandTotal: true,
        totalPaid: true,
        outstandingAmount: true,
        paymentStatus: true,
      },
    });

    if (!invoice) return null;

    const payments = await prisma.salesPayment.findMany({
      where: {
        salesInvoiceId,
        status: PaymentStatus.COMPLETED,
      },
    });

    let cash = new Prisma.Decimal(0);
    let card = new Prisma.Decimal(0);
    let upi = new Prisma.Decimal(0);
    let bankTransfer = new Prisma.Decimal(0);
    let cheque = new Prisma.Decimal(0);

    for (const p of payments) {
      const amt = new Prisma.Decimal(p.amount);
      if (p.paymentMethod === PaymentMethod.CASH) cash = cash.add(amt);
      else if (p.paymentMethod === PaymentMethod.CARD) card = card.add(amt);
      else if (p.paymentMethod === PaymentMethod.UPI) upi = upi.add(amt);
      else if (p.paymentMethod === PaymentMethod.BANK_TRANSFER) bankTransfer = bankTransfer.add(amt);
      else if (p.paymentMethod === PaymentMethod.CHEQUE) cheque = cheque.add(amt);
    }

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      grandTotal: invoice.grandTotal.toFixed(2),
      totalPaid: invoice.totalPaid.toFixed(2),
      outstandingAmount: invoice.outstandingAmount.toFixed(2),
      paymentStatus: invoice.paymentStatus,
      payments: {
        cash: cash.toFixed(2),
        card: card.toFixed(2),
        upi: upi.toFixed(2),
        bankTransfer: bankTransfer.toFixed(2),
        cheque: cheque.toFixed(2),
      },
    };
  }

  /**
   * Mark payment status as REVERSED inside a transaction client or default prisma.
   */
  async reverse(id: string, input: ReverseSalesPaymentInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesPayment.update({
      where: { id },
      data: {
        status: PaymentStatus.REVERSED,
        reversedAt: input.reversedAt || new Date(),
        reversedBy: input.reversedBy,
        reversalReason: input.reversalReason,
      },
      include: {
        salesInvoice: true,
      },
    });
  }
}

export const salesPaymentRepository = new SalesPaymentRepository();
