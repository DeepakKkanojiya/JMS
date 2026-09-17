import { prisma } from '../database';
import { Prisma, MetalType } from '../generated/prisma';

export interface CreateSalesInvoiceMetalRateData {
  salesInvoiceId: string;
  metalRateId?: string | null;
  metalType: MetalType;
  purity: string;
  ratePerGram: number | Prisma.Decimal;
  lockedAt?: Date;
}

export class SalesInvoiceMetalRateRepository {
  private defaultInclude = {
    salesInvoice: {
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        branchId: true,
      },
    },
    metalRate: true,
  };

  async create(data: CreateSalesInvoiceMetalRateData, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.salesInvoiceMetalRate.create({
      data: {
        salesInvoiceId: data.salesInvoiceId,
        metalRateId: data.metalRateId || null,
        metalType: data.metalType,
        purity: data.purity,
        ratePerGram: data.ratePerGram,
        lockedAt: data.lockedAt || new Date(),
      },
      include: this.defaultInclude,
    });
  }

  async findBySalesInvoiceId(salesInvoiceId: string) {
    return prisma.salesInvoiceMetalRate.findUnique({
      where: { salesInvoiceId },
      include: this.defaultInclude,
    });
  }
}

export const salesInvoiceMetalRateRepository = new SalesInvoiceMetalRateRepository();
