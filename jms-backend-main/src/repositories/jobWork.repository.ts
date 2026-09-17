import { prisma } from '../database';
import { Prisma, JobWorkOrderStatus, JobWorkItemType } from '../generated/prisma';

export interface CreateJobWorkOrderInput {
  orderNumber: string;
  companyId: string;
  branchId: string;
  vendorId: string;
  targetItemName: string;
  metalType?: string;
  purity?: string;
  expectedDeliveryDate?: Date | string | null;
  agreedWastagePercent?: Prisma.Decimal | number | string;
  agreedMakingChargePerGram?: Prisma.Decimal | number | string;
  notes?: string | null;
  createdBy?: string | null;
}

export interface JobWorkOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  vendorId?: string;
  status?: JobWorkOrderStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AddMaterialIssueInput {
  jobWorkOrderId: string;
  itemType?: JobWorkItemType;
  inventoryItemId?: string | null;
  description: string;
  grossWeight: Prisma.Decimal | number | string;
  stoneWeight?: Prisma.Decimal | number | string;
  netWeight: Prisma.Decimal | number | string;
  purity: string;
  fineWeight: Prisma.Decimal | number | string;
  issuedBy?: string | null;
}

export interface AddJobWorkReceiptInput {
  receiptNumber: string;
  jobWorkOrderId: string;
  inventoryItemId?: string | null;
  itemName: string;
  grossWeight: Prisma.Decimal | number | string;
  stoneWeight?: Prisma.Decimal | number | string;
  netWeight: Prisma.Decimal | number | string;
  purity: string;
  fineWeight: Prisma.Decimal | number | string;
  actualWastageWeight?: Prisma.Decimal | number | string;
  makingCharges?: Prisma.Decimal | number | string;
  receivedBy?: string | null;
  remarks?: string | null;
}

export class JobWorkRepository {
  async createOrder(data: CreateJobWorkOrderInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.create({
      data: {
        orderNumber: data.orderNumber,
        companyId: data.companyId,
        branchId: data.branchId,
        vendorId: data.vendorId,
        targetItemName: data.targetItemName,
        metalType: data.metalType || 'GOLD',
        purity: data.purity || '22K',
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        agreedWastagePercent: new Prisma.Decimal(data.agreedWastagePercent || 0),
        agreedMakingChargePerGram: new Prisma.Decimal(data.agreedMakingChargePerGram || 0),
        notes: data.notes || null,
        createdBy: data.createdBy || null,
        status: JobWorkOrderStatus.DRAFT,
      },
      include: {
        vendor: true,
        branch: { include: { company: true } },
        issuedMaterials: { include: { inventoryItem: true } },
        receipts: { include: { inventoryItem: true } },
      },
    });
  }

  async findOrderById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        branch: { include: { company: true } },
        issuedMaterials: { include: { inventoryItem: true } },
        receipts: { include: { inventoryItem: true } },
      },
    });
  }

  async findOrderByNumber(orderNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.findUnique({
      where: { orderNumber },
      include: {
        vendor: true,
        branch: true,
        issuedMaterials: true,
        receipts: true,
      },
    });
  }

  async findAllOrders(options: JobWorkOrderQueryParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const rawPage = options.page ? Number(options.page) : 1;
    const rawLimit = options.limit ? Number(options.limit) : 10;
    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWorkOrderWhereInput = {};

    if (options.companyId) where.companyId = options.companyId;
    if (options.branchId) where.branchId = options.branchId;
    if (options.vendorId) where.vendorId = options.vendorId;
    if (options.status) where.status = options.status;

    if (options.fromDate || options.toDate) {
      where.issueDate = {};
      if (options.fromDate) where.issueDate.gte = new Date(options.fromDate);
      if (options.toDate) where.issueDate.lte = new Date(options.toDate);
    }

    if (options.search) {
      where.OR = [
        { orderNumber: { contains: options.search, mode: 'insensitive' } },
        { targetItemName: { contains: options.search, mode: 'insensitive' } },
        { notes: { contains: options.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const validSort = ['createdAt', 'orderNumber', 'issueDate', 'targetItemName'];
    const sortBy = options.sortBy && validSort.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      client.jobWorkOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vendor: true,
          branch: true,
          issuedMaterials: true,
          receipts: true,
        },
      }),
      client.jobWorkOrder.count({ where }),
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

  async updateOrder(id: string, data: Partial<CreateJobWorkOrderInput> & { updatedBy?: string }, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.update({
      where: { id },
      data: {
        targetItemName: data.targetItemName !== undefined ? data.targetItemName : undefined,
        metalType: data.metalType !== undefined ? data.metalType : undefined,
        purity: data.purity !== undefined ? data.purity : undefined,
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
        agreedWastagePercent: data.agreedWastagePercent !== undefined ? new Prisma.Decimal(data.agreedWastagePercent) : undefined,
        agreedMakingChargePerGram: data.agreedMakingChargePerGram !== undefined ? new Prisma.Decimal(data.agreedMakingChargePerGram) : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        updatedBy: data.updatedBy || undefined,
      },
      include: {
        vendor: true,
        branch: true,
        issuedMaterials: true,
        receipts: true,
      },
    });
  }

  async submitOrder(id: string, submittedBy: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.update({
      where: { id },
      data: {
        status: JobWorkOrderStatus.SUBMITTED,
        submittedBy,
        submittedAt: new Date(),
      },
      include: { vendor: true, branch: true, issuedMaterials: true, receipts: true },
    });
  }

  async assignOrder(id: string, assignedBy: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.update({
      where: { id },
      data: {
        status: JobWorkOrderStatus.ASSIGNED,
        assignedBy,
        assignedAt: new Date(),
      },
      include: { vendor: true, branch: true, issuedMaterials: true, receipts: true },
    });
  }

  async addMaterialIssue(data: AddMaterialIssueInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const issue = await client.jobWorkMaterialIssue.create({
      data: {
        jobWorkOrderId: data.jobWorkOrderId,
        itemType: data.itemType || JobWorkItemType.RAW_METAL,
        inventoryItemId: data.inventoryItemId || null,
        description: data.description,
        grossWeight: new Prisma.Decimal(data.grossWeight),
        stoneWeight: new Prisma.Decimal(data.stoneWeight || 0),
        netWeight: new Prisma.Decimal(data.netWeight),
        purity: data.purity,
        fineWeight: new Prisma.Decimal(data.fineWeight),
        issuedBy: data.issuedBy || null,
      },
      include: { inventoryItem: true },
    });

    // Recalculate totalIssuedFineWeight on JobWorkOrder
    const issues = await client.jobWorkMaterialIssue.findMany({
      where: { jobWorkOrderId: data.jobWorkOrderId },
    });
    const totalIssuedFineWeight = issues.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.fineWeight)),
      new Prisma.Decimal(0)
    );

    await client.jobWorkOrder.update({
      where: { id: data.jobWorkOrderId },
      data: {
        totalIssuedFineWeight,
        status: JobWorkOrderStatus.IN_PROGRESS,
      },
    });

    return issue;
  }

  async addReceipt(data: AddJobWorkReceiptInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const receipt = await client.jobWorkReceipt.create({
      data: {
        receiptNumber: data.receiptNumber,
        jobWorkOrderId: data.jobWorkOrderId,
        inventoryItemId: data.inventoryItemId || null,
        itemName: data.itemName,
        grossWeight: new Prisma.Decimal(data.grossWeight),
        stoneWeight: new Prisma.Decimal(data.stoneWeight || 0),
        netWeight: new Prisma.Decimal(data.netWeight),
        purity: data.purity,
        fineWeight: new Prisma.Decimal(data.fineWeight),
        actualWastageWeight: new Prisma.Decimal(data.actualWastageWeight || 0),
        makingCharges: new Prisma.Decimal(data.makingCharges || 0),
        receivedBy: data.receivedBy || null,
        remarks: data.remarks || null,
      },
      include: { inventoryItem: true },
    });

    // Recalculate totals on JobWorkOrder
    const receipts = await client.jobWorkReceipt.findMany({
      where: { jobWorkOrderId: data.jobWorkOrderId },
    });
    const totalReceivedFineWeight = receipts.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.fineWeight)),
      new Prisma.Decimal(0)
    );
    const totalWastageWeight = receipts.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.actualWastageWeight)),
      new Prisma.Decimal(0)
    );
    const totalMakingCharges = receipts.reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.makingCharges)),
      new Prisma.Decimal(0)
    );

    await client.jobWorkOrder.update({
      where: { id: data.jobWorkOrderId },
      data: {
        totalReceivedFineWeight,
        totalWastageWeight,
        totalMakingCharges,
        status: JobWorkOrderStatus.COMPLETED,
        completedAt: new Date(),
        completedBy: data.receivedBy || null,
      },
    });

    return receipt;
  }

  async cancelOrder(id: string, cancelledBy: string, cancellationReason: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.jobWorkOrder.update({
      where: { id },
      data: {
        status: JobWorkOrderStatus.CANCELLED,
        cancelledBy,
        cancellationReason,
        cancelledAt: new Date(),
      },
      include: { vendor: true, branch: true, issuedMaterials: true, receipts: true },
    });
  }

  async getKarigarSummary(vendorId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const orders = await client.jobWorkOrder.findMany({
      where: { vendorId },
      include: { issuedMaterials: true, receipts: true },
    });

    let totalIssuedFineWeight = new Prisma.Decimal(0);
    let totalReceivedFineWeight = new Prisma.Decimal(0);
    let totalWastageWeight = new Prisma.Decimal(0);
    let totalMakingCharges = new Prisma.Decimal(0);

    let activeOrderCount = 0;
    let completedOrderCount = 0;

    for (const order of orders) {
      if (order.status === JobWorkOrderStatus.ASSIGNED || order.status === JobWorkOrderStatus.IN_PROGRESS) {
        activeOrderCount++;
      } else if (order.status === JobWorkOrderStatus.COMPLETED) {
        completedOrderCount++;
      }

      totalIssuedFineWeight = totalIssuedFineWeight.add(new Prisma.Decimal(order.totalIssuedFineWeight));
      totalReceivedFineWeight = totalReceivedFineWeight.add(new Prisma.Decimal(order.totalReceivedFineWeight));
      totalWastageWeight = totalWastageWeight.add(new Prisma.Decimal(order.totalWastageWeight));
      totalMakingCharges = totalMakingCharges.add(new Prisma.Decimal(order.totalMakingCharges));
    }

    const netPendingFineWeight = totalIssuedFineWeight.sub(totalReceivedFineWeight).sub(totalWastageWeight);

    return {
      vendorId,
      totalOrders: orders.length,
      activeOrderCount,
      completedOrderCount,
      totalIssuedFineWeight: totalIssuedFineWeight.toNumber(),
      totalReceivedFineWeight: totalReceivedFineWeight.toNumber(),
      totalWastageWeight: totalWastageWeight.toNumber(),
      netPendingFineWeight: netPendingFineWeight.toNumber(),
      totalMakingCharges: totalMakingCharges.toNumber(),
    };
  }
}

export const jobWorkRepository = new JobWorkRepository();
