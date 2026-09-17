import { prisma } from '../database';
import { Prisma, AuditSessionStatus, AuditItemStatus } from '../generated/prisma';

export interface CreateStockAuditSessionInput {
  auditNumber: string;
  companyId: string;
  branchId: string;
  categoryId?: string | null;
  totalExpectedItems: number;
  totalExpectedNetWeight: Prisma.Decimal | number | string;
  notes?: string | null;
  auditedBy?: string | null;
}

export interface StockAuditSessionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  categoryId?: string;
  status?: AuditSessionStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AddScannedAuditItemInput {
  auditSessionId: string;
  inventoryItemId?: string | null;
  barcode?: string | null;
  rfidEpc?: string | null;
  status: AuditItemStatus;
  expectedGrossWeight?: Prisma.Decimal | number | string | null;
  expectedNetWeight?: Prisma.Decimal | number | string | null;
  scannedGrossWeight?: Prisma.Decimal | number | string | null;
  scannedNetWeight?: Prisma.Decimal | number | string | null;
  weightDiscrepancy?: Prisma.Decimal | number | string;
  remarks?: string | null;
  scannedBy?: string | null;
}

export class StockAuditRepository {
  async createSession(data: CreateStockAuditSessionInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.stockAuditSession.create({
      data: {
        auditNumber: data.auditNumber,
        companyId: data.companyId,
        branchId: data.branchId,
        categoryId: data.categoryId || null,
        totalExpectedItems: data.totalExpectedItems,
        totalExpectedNetWeight: new Prisma.Decimal(data.totalExpectedNetWeight),
        status: AuditSessionStatus.IN_PROGRESS,
        notes: data.notes || null,
        auditedBy: data.auditedBy || null,
      },
      include: {
        branch: { include: { company: true } },
        category: true,
        scannedItems: true,
      },
    });
  }

  async findSessionById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.stockAuditSession.findUnique({
      where: { id },
      include: {
        branch: { include: { company: true } },
        category: true,
        scannedItems: { include: { inventoryItem: true } },
      },
    });
  }

  async findSessionByNumber(auditNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.stockAuditSession.findUnique({
      where: { auditNumber },
      include: {
        branch: true,
        category: true,
        scannedItems: true,
      },
    });
  }

  async findAllSessions(options: StockAuditSessionQueryParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const rawPage = options.page ? Number(options.page) : 1;
    const rawLimit = options.limit ? Number(options.limit) : 10;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StockAuditSessionWhereInput = {};

    if (options.companyId) where.companyId = options.companyId;
    if (options.branchId) where.branchId = options.branchId;
    if (options.categoryId) where.categoryId = options.categoryId;
    if (options.status) where.status = options.status;

    if (options.fromDate || options.toDate) {
      where.startDate = {};
      if (options.fromDate) where.startDate.gte = new Date(options.fromDate);
      if (options.toDate) where.startDate.lte = new Date(options.toDate);
    }

    if (options.search) {
      where.OR = [
        { auditNumber: { contains: options.search, mode: 'insensitive' } },
        { notes: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const validSort = ['createdAt', 'auditNumber', 'startDate'];
    const sortBy = options.sortBy && validSort.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.stockAuditSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          branch: true,
          category: true,
          scannedItems: true,
        },
      }),
      client.stockAuditSession.count({ where }),
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

  async updateSessionMetrics(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const scannedItems = await client.stockAuditItem.findMany({
      where: { auditSessionId: id },
    });

    const totalScannedItems = scannedItems.length;
    const totalMatchedItems = scannedItems.filter((i) => i.status === AuditItemStatus.MATCHED).length;
    const totalMissingItems = scannedItems.filter((i) => i.status === AuditItemStatus.MISSING).length;
    const totalUnexpectedItems = scannedItems.filter((i) => i.status === AuditItemStatus.UNEXPECTED).length;
    const totalWeightMismatchItems = scannedItems.filter((i) => i.status === AuditItemStatus.WEIGHT_MISMATCH).length;

    const totalScannedNetWeight = scannedItems.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.scannedNetWeight || 0)),
      new Prisma.Decimal(0)
    );

    return client.stockAuditSession.update({
      where: { id },
      data: {
        totalScannedItems,
        totalMatchedItems,
        totalMissingItems,
        totalUnexpectedItems,
        totalWeightMismatchItems,
        totalScannedNetWeight,
      },
      include: { branch: true, category: true, scannedItems: true },
    });
  }

  async addScannedItem(data: AddScannedAuditItemInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const item = await client.stockAuditItem.create({
      data: {
        auditSessionId: data.auditSessionId,
        inventoryItemId: data.inventoryItemId || null,
        barcode: data.barcode || null,
        rfidEpc: data.rfidEpc || null,
        status: data.status,
        expectedGrossWeight: data.expectedGrossWeight !== undefined && data.expectedGrossWeight !== null ? new Prisma.Decimal(data.expectedGrossWeight) : null,
        expectedNetWeight: data.expectedNetWeight !== undefined && data.expectedNetWeight !== null ? new Prisma.Decimal(data.expectedNetWeight) : null,
        scannedGrossWeight: data.scannedGrossWeight !== undefined && data.scannedGrossWeight !== null ? new Prisma.Decimal(data.scannedGrossWeight) : null,
        scannedNetWeight: data.scannedNetWeight !== undefined && data.scannedNetWeight !== null ? new Prisma.Decimal(data.scannedNetWeight) : null,
        weightDiscrepancy: new Prisma.Decimal(data.weightDiscrepancy || 0),
        remarks: data.remarks || null,
        scannedBy: data.scannedBy || null,
      },
      include: { inventoryItem: true },
    });

    await this.updateSessionMetrics(data.auditSessionId, client);
    return item;
  }

  async submitSession(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.stockAuditSession.update({
      where: { id },
      data: {
        status: AuditSessionStatus.SUBMITTED,
      },
      include: { branch: true, category: true, scannedItems: true },
    });
  }

  async reconcileSession(id: string, reconciledBy: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.stockAuditSession.update({
      where: { id },
      data: {
        status: AuditSessionStatus.RECONCILED,
        reconciledBy,
        reconciledAt: new Date(),
        completedAt: new Date(),
      },
      include: { branch: true, category: true, scannedItems: true },
    });
  }

  async cancelSession(id: string, cancellationReason: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.stockAuditSession.update({
      where: { id },
      data: {
        status: AuditSessionStatus.CANCELLED,
        cancellationReason,
      },
      include: { branch: true, category: true, scannedItems: true },
    });
  }
}

export const stockAuditRepository = new StockAuditRepository();
