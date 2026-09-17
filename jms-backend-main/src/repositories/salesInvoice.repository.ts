import { prisma } from '../database';
import { Prisma, SalesInvoiceStatus } from '../generated/prisma';

export interface CreateSalesInvoiceItemData {
  inventoryItemId: string;
  quantity?: number;
  unitPrice: number | Prisma.Decimal;
  discountAmount?: number | Prisma.Decimal;
  taxAmount?: number | Prisma.Decimal;
  lineTotal: number | Prisma.Decimal;
}

export interface CreateSalesInvoiceData {
  invoiceNumber: string;
  customerId: string;
  branchId: string;
  salespersonId?: string | null;
  status?: SalesInvoiceStatus;
  invoiceDate?: Date;
  subtotal: number | Prisma.Decimal;
  discountAmount?: number | Prisma.Decimal;
  taxAmount?: number | Prisma.Decimal;
  grandTotal: number | Prisma.Decimal;
  notes?: string | null;
  createdByUserId?: string | null;
  items: CreateSalesInvoiceItemData[];
}

export interface UpdateSalesInvoiceData {
  customerId?: string;
  branchId?: string;
  salespersonId?: string | null;
  status?: SalesInvoiceStatus;
  subtotal?: number | Prisma.Decimal;
  discountAmount?: number | Prisma.Decimal;
  taxAmount?: number | Prisma.Decimal;
  grandTotal?: number | Prisma.Decimal;
  exchangeCredit?: number | Prisma.Decimal;
  totalPaid?: number | Prisma.Decimal;
  outstandingAmount?: number | Prisma.Decimal;
  paymentStatus?: string;
  notes?: string | null;
  updatedByUserId?: string | null;
  items?: CreateSalesInvoiceItemData[];
}

export interface SalesInvoiceQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  customerId?: string;
  salespersonId?: string;
  status?: SalesInvoiceStatus | string;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'invoiceNumber' | 'invoiceDate' | 'grandTotal';
  sortOrder?: 'asc' | 'desc';
}

function mapSalesInvoice(invoice: any) {
  if (!invoice) return null;
  if (invoice.salesperson) {
    invoice.salesperson.designation = invoice.salesperson.branchAssignments?.[0]?.designation || null;
    delete invoice.salesperson.branchAssignments;
  }
  if (invoice.items) {
    invoice.items = invoice.items.map((item: any) => {
      if (item.inventoryItem) {
        const activeTag = item.inventoryItem.tags?.find((t: any) => t.isActive) || item.inventoryItem.tags?.[0] || null;
        item.inventoryItem.inventoryTag = activeTag;
      }
      return item;
    });
  }
  return invoice;
}

export class SalesInvoiceRepository {
  private defaultInclude = {
    customer: {
      select: {
        id: true,
        customerCode: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        customerType: true,
      },
    },
    branch: {
      select: {
        id: true,
        companyId: true,
        branchCode: true,
        name: true,
        city: true,
      },
    },
    salesperson: {
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        branchAssignments: {
          where: { isPrimary: true, effectiveTo: null },
          select: { designation: true }
        }
      },
    },
    items: {
      include: {
        inventoryItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                metalType: true,
                purity: true,
              },
            },
            tags: true,
          },
        },
      },
    },
  };

  async create(data: CreateSalesInvoiceData, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const { items, createdByUserId, ...invoiceData } = data;

    const invoice = await client.salesInvoice.create({
      data: {
        ...invoiceData,
        createdByUserId: createdByUserId || null,
        items: {
          create: items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? 0,
            taxAmount: item.taxAmount ?? 0,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: this.defaultInclude,
    });
    return mapSalesInvoice(invoice);
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const invoice = await client.salesInvoice.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
    return mapSalesInvoice(invoice);
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const invoice = await prisma.salesInvoice.findUnique({
      where: { invoiceNumber },
      include: this.defaultInclude,
    });
    return mapSalesInvoice(invoice);
  }

  async findAll(options: SalesInvoiceQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.branchId) {
      where.branchId = options.branchId;
    }
    if (options.customerId) {
      where.customerId = options.customerId;
    }
    if (options.salespersonId) {
      where.salespersonId = options.salespersonId;
    }
    if (options.status) {
      where.status = options.status;
    }
    if (options.fromDate || options.toDate) {
      where.invoiceDate = {};
      if (options.fromDate) {
        where.invoiceDate.gte = options.fromDate;
      }
      if (options.toDate) {
        where.invoiceDate.lte = options.toDate;
      }
    }
    if (options.search) {
      const search = options.search.trim();
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search } } },
      ];
    }

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const [invoices, total] = await Promise.all([
      prisma.salesInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.defaultInclude,
      }),
      prisma.salesInvoice.count({ where }),
    ]);

    return {
      data: invoices.map(mapSalesInvoice),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateSalesInvoiceData, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const { items, updatedByUserId, ...invoiceData } = data;

    const invoice = await client.salesInvoice.update({
      where: { id },
      data: {
        ...invoiceData,
        ...(updatedByUserId !== undefined && { updatedByUserId }),
      },
      include: this.defaultInclude,
    });
    return mapSalesInvoice(invoice);
  }

  async updateStatus(id: string, status: SalesInvoiceStatus, updatedBy?: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const invoice = await client.salesInvoice.update({
      where: { id },
      data: {
        status,
        updatedByUserId: updatedBy || null,
      },
      include: this.defaultInclude,
    });
    return mapSalesInvoice(invoice);
  }

  async findItemsByInvoiceId(salesInvoiceId: string) {
    const items = await prisma.salesInvoiceItem.findMany({
      where: { salesInvoiceId },
      include: {
        inventoryItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                metalType: true,
                purity: true,
              },
            },
            tags: true,
          },
        },
      },
    });
    return items.map((item: any) => {
      if (item.inventoryItem) {
        const activeTag = item.inventoryItem.tags?.find((t: any) => t.isActive) || item.inventoryItem.tags?.[0] || null;
        item.inventoryItem.inventoryTag = activeTag;
      }
      return item;
    });
  }

  async countInvoices(): Promise<number> {
    return prisma.salesInvoice.count();
  }
}

export const salesInvoiceRepository = new SalesInvoiceRepository();
