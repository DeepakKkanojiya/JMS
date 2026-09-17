import { prisma } from '../database';
import { Prisma, PurchaseReturnStatus, DebitNoteStatus } from '../generated/prisma';

export interface CreatePurchaseReturnItemInput {
  purchaseBillItemId?: string | null;
  inventoryItemId?: string | null;
  itemName: string;
  description?: string | null;
  quantity: number;
  grossWeight: Prisma.Decimal | number | string;
  stoneWeight?: Prisma.Decimal | number | string;
  netWeight: Prisma.Decimal | number | string;
  purchaseRate: Prisma.Decimal | number | string;
  metalValue: Prisma.Decimal | number | string;
  makingCharges?: Prisma.Decimal | number | string;
  taxRate?: Prisma.Decimal | number | string;
  taxAmount?: Prisma.Decimal | number | string;
  lineTotal: Prisma.Decimal | number | string;
}

export interface CreatePurchaseReturnInput {
  returnNumber: string;
  purchaseBillId?: string | null;
  purchaseOrderId?: string | null;
  vendorId: string;
  branchId: string;
  reason?: string;
  notes?: string | null;
  subtotal: Prisma.Decimal | number | string;
  taxAmount: Prisma.Decimal | number | string;
  totalReturnAmount: Prisma.Decimal | number | string;
  createdBy?: string | null;
  items: CreatePurchaseReturnItemInput[];
}

export interface PurchaseReturnQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  purchaseBillId?: string;
  purchaseOrderId?: string;
  branchId?: string;
  status?: PurchaseReturnStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVendorDebitNoteInput {
  debitNoteNumber: string;
  purchaseReturnId: string;
  vendorId: string;
  branchId: string;
  purchaseBillId?: string | null;
  amount: Prisma.Decimal | number | string;
  status?: DebitNoteStatus;
  remarks?: string | null;
  createdBy?: string | null;
}

export interface DebitNoteQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  purchaseBillId?: string;
  branchId?: string;
  status?: DebitNoteStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class PurchaseReturnRepository {
  async create(data: CreatePurchaseReturnInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.create({
      data: {
        returnNumber: data.returnNumber,
        purchaseBillId: data.purchaseBillId || null,
        purchaseOrderId: data.purchaseOrderId || null,
        vendorId: data.vendorId,
        branchId: data.branchId,
        reason: data.reason || 'DEFECTIVE',
        notes: data.notes || null,
        subtotal: new Prisma.Decimal(data.subtotal),
        taxAmount: new Prisma.Decimal(data.taxAmount),
        totalReturnAmount: new Prisma.Decimal(data.totalReturnAmount),
        createdBy: data.createdBy || null,
        status: PurchaseReturnStatus.DRAFT,
        items: {
          create: data.items.map((item) => ({
            purchaseBillItemId: item.purchaseBillItemId || null,
            inventoryItemId: item.inventoryItemId || null,
            itemName: item.itemName,
            description: item.description || null,
            quantity: item.quantity,
            grossWeight: new Prisma.Decimal(item.grossWeight),
            stoneWeight: new Prisma.Decimal(item.stoneWeight || 0),
            netWeight: new Prisma.Decimal(item.netWeight),
            purchaseRate: new Prisma.Decimal(item.purchaseRate),
            metalValue: new Prisma.Decimal(item.metalValue),
            makingCharges: new Prisma.Decimal(item.makingCharges || 0),
            taxRate: new Prisma.Decimal(item.taxRate || 0),
            taxAmount: new Prisma.Decimal(item.taxAmount || 0),
            lineTotal: new Prisma.Decimal(item.lineTotal),
          })),
        },
      },
      include: {
        items: true,
        vendor: true,
        branch: { include: { company: true } },
        purchaseBill: true,
        purchaseOrder: true,
        debitNote: true,
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            inventoryItem: true,
            purchaseBillItem: true,
          },
        },
        vendor: true,
        branch: { include: { company: true } },
        purchaseBill: true,
        purchaseOrder: true,
        debitNote: true,
      },
    });
  }

  async findByReturnNumber(returnNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.findUnique({
      where: { returnNumber },
      include: {
        items: true,
        vendor: true,
        branch: true,
        debitNote: true,
      },
    });
  }

  async findAll(options: PurchaseReturnQueryParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const rawPage = options.page ? Number(options.page) : 1;
    const rawLimit = options.limit ? Number(options.limit) : 10;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseReturnWhereInput = {};

    if (options.vendorId) where.vendorId = options.vendorId;
    if (options.purchaseBillId) where.purchaseBillId = options.purchaseBillId;
    if (options.purchaseOrderId) where.purchaseOrderId = options.purchaseOrderId;
    if (options.branchId) where.branchId = options.branchId;
    if (options.status) where.status = options.status;

    if (options.fromDate || options.toDate) {
      where.returnDate = {};
      if (options.fromDate) where.returnDate.gte = new Date(options.fromDate);
      if (options.toDate) where.returnDate.lte = new Date(options.toDate);
    }

    if (options.search) {
      where.OR = [
        { returnNumber: { contains: options.search, mode: 'insensitive' } },
        { reason: { contains: options.search, mode: 'insensitive' } },
        { notes: { contains: options.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const validSort = ['createdAt', 'returnNumber', 'returnDate', 'totalReturnAmount'];
    const sortBy = options.sortBy && validSort.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.purchaseReturn.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: true,
          vendor: true,
          branch: true,
          debitNote: true,
        },
      }),
      client.purchaseReturn.count({ where }),
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

  async update(id: string, data: Partial<CreatePurchaseReturnInput> & { updatedBy?: string }, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.update({
      where: { id },
      data: {
        reason: data.reason !== undefined ? data.reason : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        subtotal: data.subtotal ? new Prisma.Decimal(data.subtotal) : undefined,
        taxAmount: data.taxAmount ? new Prisma.Decimal(data.taxAmount) : undefined,
        totalReturnAmount: data.totalReturnAmount ? new Prisma.Decimal(data.totalReturnAmount) : undefined,
        updatedBy: data.updatedBy || undefined,
      },
      include: {
        items: true,
        vendor: true,
        branch: true,
        debitNote: true,
      },
    });
  }

  async submit(id: string, submittedBy: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.update({
      where: { id },
      data: {
        status: PurchaseReturnStatus.SUBMITTED,
        submittedBy,
        submittedAt: new Date(),
      },
      include: { items: true, vendor: true, branch: true, debitNote: true },
    });
  }

  async approve(id: string, approvedBy: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.update({
      where: { id },
      data: {
        status: PurchaseReturnStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: { items: true, vendor: true, branch: true, debitNote: true },
    });
  }

  async process(id: string, processedBy: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.update({
      where: { id },
      data: {
        status: PurchaseReturnStatus.PROCESSED,
        processedBy,
        processedAt: new Date(),
      },
      include: { items: true, vendor: true, branch: true, debitNote: true },
    });
  }

  async cancel(id: string, cancelledBy: string, cancellationReason: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.purchaseReturn.update({
      where: { id },
      data: {
        status: PurchaseReturnStatus.CANCELLED,
        cancelledBy,
        cancellationReason,
        cancelledAt: new Date(),
      },
      include: { items: true, vendor: true, branch: true, debitNote: true },
    });
  }

  // --- VENDOR DEBIT NOTE METHODS ---

  async createDebitNote(data: CreateVendorDebitNoteInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorDebitNote.create({
      data: {
        debitNoteNumber: data.debitNoteNumber,
        purchaseReturnId: data.purchaseReturnId,
        vendorId: data.vendorId,
        branchId: data.branchId,
        purchaseBillId: data.purchaseBillId || null,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || DebitNoteStatus.ISSUED,
        remarks: data.remarks || null,
        createdBy: data.createdBy || null,
      },
      include: {
        purchaseReturn: true,
        vendor: true,
        branch: true,
        purchaseBill: true,
      },
    });
  }

  async findDebitNoteById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorDebitNote.findUnique({
      where: { id },
      include: {
        purchaseReturn: { include: { items: true } },
        vendor: true,
        branch: true,
        purchaseBill: true,
      },
    });
  }

  async findDebitNoteByNumber(debitNoteNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorDebitNote.findUnique({
      where: { debitNoteNumber },
      include: {
        purchaseReturn: true,
        vendor: true,
        branch: true,
      },
    });
  }

  async findAllDebitNotes(options: DebitNoteQueryParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const rawPage = options.page ? Number(options.page) : 1;
    const rawLimit = options.limit ? Number(options.limit) : 10;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VendorDebitNoteWhereInput = {};

    if (options.vendorId) where.vendorId = options.vendorId;
    if (options.purchaseBillId) where.purchaseBillId = options.purchaseBillId;
    if (options.branchId) where.branchId = options.branchId;
    if (options.status) where.status = options.status;

    if (options.fromDate || options.toDate) {
      where.issueDate = {};
      if (options.fromDate) where.issueDate.gte = new Date(options.fromDate);
      if (options.toDate) where.issueDate.lte = new Date(options.toDate);
    }

    if (options.search) {
      where.OR = [
        { debitNoteNumber: { contains: options.search, mode: 'insensitive' } },
        { remarks: { contains: options.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const validSort = ['createdAt', 'debitNoteNumber', 'issueDate', 'amount'];
    const sortBy = options.sortBy && validSort.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.vendorDebitNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          purchaseReturn: true,
          vendor: true,
          branch: true,
        },
      }),
      client.vendorDebitNote.count({ where }),
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

  async findDebitNotesByVendorId(vendorId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.vendorDebitNote.findMany({
      where: { vendorId },
      include: {
        purchaseReturn: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const purchaseReturnRepository = new PurchaseReturnRepository();
