import { prisma } from '../database';
import { Prisma, VendorPaymentMethod, VendorPaymentStatus, PurchaseBillStatus } from '../generated/prisma';

export interface CreateVendorPaymentData {
  purchaseBillId: string;
  vendorId: string;
  branchId: string;
  paymentNumber: string;
  paymentMethod: VendorPaymentMethod;
  amount: Prisma.Decimal | number | string;
  status?: VendorPaymentStatus;
  transactionReference?: string | null;
  paymentDate?: Date | string;
  remarks?: string | null;
  receivedBy?: string | null;
  processedBy?: string | null;
}

export interface VendorPaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  purchaseBillId?: string;
  branchId?: string;
  companyId?: string;
  paymentMethod?: VendorPaymentMethod;
  status?: VendorPaymentStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class VendorPaymentRepository {
  async create(data: CreateVendorPaymentData, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorPayment.create({
      data: {
        purchaseBillId: data.purchaseBillId,
        vendorId: data.vendorId,
        branchId: data.branchId,
        paymentNumber: data.paymentNumber,
        paymentMethod: data.paymentMethod,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || VendorPaymentStatus.COMPLETED,
        transactionReference: data.transactionReference || null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        remarks: data.remarks || null,
        receivedBy: data.receivedBy || null,
        processedBy: data.processedBy || null,
      },
      include: {
        purchaseBill: true,
        vendor: true,
        branch: { include: { company: true } },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorPayment.findUnique({
      where: { id },
      include: {
        purchaseBill: {
          include: {
            purchaseOrder: true,
          },
        },
        vendor: true,
        branch: { include: { company: true } },
      },
    });
  }

  async findByPaymentNumber(paymentNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorPayment.findUnique({
      where: { paymentNumber },
      include: {
        purchaseBill: true,
        vendor: true,
        branch: { include: { company: true } },
      },
    });
  }

  async findByPurchaseBillId(purchaseBillId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorPayment.findMany({
      where: { purchaseBillId },
      include: {
        vendor: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVendorId(vendorId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorPayment.findMany({
      where: { vendorId },
      include: {
        purchaseBill: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(options: VendorPaymentQueryParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const rawPage = options.page ? Number(options.page) : 1;
    const rawLimit = options.limit ? Number(options.limit) : 10;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VendorPaymentWhereInput = {};

    if (options.vendorId) {
      where.vendorId = options.vendorId;
    }

    if (options.purchaseBillId) {
      where.purchaseBillId = options.purchaseBillId;
    }

    if (options.branchId) {
      where.branchId = options.branchId;
    }

    if (options.companyId) {
      where.branch = { companyId: options.companyId };
    }

    if (options.paymentMethod) {
      where.paymentMethod = options.paymentMethod;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.fromDate || options.toDate) {
      where.paymentDate = {};
      if (options.fromDate) {
        where.paymentDate.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        where.paymentDate.lte = new Date(options.toDate);
      }
    }

    if (options.search) {
      where.OR = [
        { paymentNumber: { contains: options.search, mode: 'insensitive' } },
        { transactionReference: { contains: options.search, mode: 'insensitive' } },
        { remarks: { contains: options.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: options.search, mode: 'insensitive' } } },
        { purchaseBill: { billNumber: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'paymentNumber', 'paymentDate', 'amount'];
    const sortBy = options.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.vendorPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          purchaseBill: true,
          vendor: true,
          branch: { include: { company: true } },
        },
      }),
      client.vendorPayment.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCompletedPaymentTotal(purchaseBillId: string, tx?: Prisma.TransactionClient): Promise<Prisma.Decimal> {
    const client = tx || prisma;
    const result = await client.vendorPayment.aggregate({
      where: {
        purchaseBillId,
        status: VendorPaymentStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || new Prisma.Decimal(0);
  }

  async getPaymentSummary(purchaseBillId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const bill = await client.purchaseBill.findUnique({
      where: { id: purchaseBillId },
      select: {
        grandTotal: true,
        totalPaid: true,
        outstandingAmount: true,
        status: true,
      },
    });

    if (!bill) return null;

    const completedPayments = await client.vendorPayment.findMany({
      where: {
        purchaseBillId,
        status: VendorPaymentStatus.COMPLETED,
      },
    });

    let cashTotal = new Prisma.Decimal(0);
    let cardTotal = new Prisma.Decimal(0);
    let upiTotal = new Prisma.Decimal(0);
    let bankTransferTotal = new Prisma.Decimal(0);
    let chequeTotal = new Prisma.Decimal(0);

    for (const p of completedPayments) {
      const amt = new Prisma.Decimal(p.amount);
      switch (p.paymentMethod) {
        case VendorPaymentMethod.CASH:
          cashTotal = cashTotal.add(amt);
          break;
        case VendorPaymentMethod.CARD:
          cardTotal = cardTotal.add(amt);
          break;
        case VendorPaymentMethod.UPI:
          upiTotal = upiTotal.add(amt);
          break;
        case VendorPaymentMethod.BANK_TRANSFER:
          bankTransferTotal = bankTransferTotal.add(amt);
          break;
        case VendorPaymentMethod.CHEQUE:
          chequeTotal = chequeTotal.add(amt);
          break;
      }
    }

    return {
      grandTotal: bill.grandTotal,
      totalPaid: bill.totalPaid,
      outstandingAmount: bill.outstandingAmount,
      paymentStatus: bill.status,
      cashTotal: cashTotal.toDecimalPlaces(2),
      cardTotal: cardTotal.toDecimalPlaces(2),
      upiTotal: upiTotal.toDecimalPlaces(2),
      bankTransferTotal: bankTransferTotal.toDecimalPlaces(2),
      chequeTotal: chequeTotal.toDecimalPlaces(2),
    };
  }

  async reverse(
    id: string,
    data: { reversedBy: string; reversalReason: string; reversedAt?: Date },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.vendorPayment.update({
      where: { id },
      data: {
        status: VendorPaymentStatus.REVERSED,
        reversedBy: data.reversedBy,
        reversalReason: data.reversalReason,
        reversedAt: data.reversedAt || new Date(),
      },
      include: {
        purchaseBill: true,
        vendor: true,
        branch: true,
      },
    });
  }

  async getVendorPayableSummary(vendorId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;

    const bills = await client.purchaseBill.findMany({
      where: {
        vendorId,
        status: { not: PurchaseBillStatus.CANCELLED },
      },
      select: {
        id: true,
        grandTotal: true,
        totalPaid: true,
        outstandingAmount: true,
        status: true,
        dueDate: true,
      },
    });

    let totalBilled = new Prisma.Decimal(0);
    let totalPaid = new Prisma.Decimal(0);
    let totalOutstanding = new Prisma.Decimal(0);

    let partiallyPaidBills = 0;
    let fullyPaidBills = 0;
    let overdueBills = 0;
    const now = new Date();

    for (const b of bills) {
      totalBilled = totalBilled.add(new Prisma.Decimal(b.grandTotal));
      totalPaid = totalPaid.add(new Prisma.Decimal(b.totalPaid));
      const outDec = new Prisma.Decimal(b.outstandingAmount);
      totalOutstanding = totalOutstanding.add(outDec);

      if (b.status === PurchaseBillStatus.PARTIALLY_PAID) {
        partiallyPaidBills++;
      } else if (b.status === PurchaseBillStatus.PAID) {
        fullyPaidBills++;
      }

      if (outDec.gt(0) && b.dueDate && new Date(b.dueDate) < now) {
        overdueBills++;
      }
    }

    return {
      totalApprovedBills: bills.length,
      totalBilled: totalBilled.toDecimalPlaces(2),
      totalPaid: totalPaid.toDecimalPlaces(2),
      totalOutstanding: totalOutstanding.toDecimalPlaces(2),
      partiallyPaidBills,
      fullyPaidBills,
      overdueBills,
    };
  }
}

export const vendorPaymentRepository = new VendorPaymentRepository();
