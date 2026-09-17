import { prisma } from '../database';
import { Prisma, PaymentMethod, PaymentStatus } from '../generated/prisma';

export interface ApprovalDepositQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  approvalId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ApprovalDepositRepository {
  async create(data: Prisma.ApprovalDepositCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approvalDeposit.create({
      data,
      include: {
        approval: true,
        company: true,
        branch: true,
        customer: true,
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approvalDeposit.findUnique({
      where: { id },
      include: {
        approval: true,
        company: true,
        branch: true,
        customer: true,
      },
    });
  }

  async findByDepositNumber(companyId: string, depositNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approvalDeposit.findUnique({
      where: { depositNumber },
      include: {
        approval: true,
        company: true,
        branch: true,
        customer: true,
      },
    });
  }

  async findDepositsByApprovalId(approvalId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approvalDeposit.findMany({
      where: { approvalId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        branch: true,
      },
    });
  }

  async findMany(params: ApprovalDepositQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      companyId,
      branchId,
      customerId,
      approvalId,
      status,
      paymentMethod,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.ApprovalDepositWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (approvalId) where.approvalId = approvalId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate.gte = new Date(fromDate);
      if (toDate) where.paymentDate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { depositNumber: { contains: search, mode: 'insensitive' } },
        { transactionReference: { contains: search, mode: 'insensitive' } },
        { approval: { approvalNumber: { contains: search, mode: 'insensitive' } } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.approvalDeposit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          approval: true,
          company: true,
          branch: true,
          customer: true,
        },
      }),
      prisma.approvalDeposit.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async reverse(
    id: string,
    data: { reversedBy?: string; reversalReason: string; reversedAt?: Date },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.approvalDeposit.update({
      where: { id },
      data: {
        status: PaymentStatus.REVERSED,
        reversedBy: data.reversedBy || null,
        reversalReason: data.reversalReason,
        reversedAt: data.reversedAt || new Date(),
      },
      include: {
        approval: true,
        company: true,
        branch: true,
        customer: true,
      },
    });
  }
}

export const approvalDepositRepository = new ApprovalDepositRepository();
