import { prisma } from '../database';
import { Prisma, ApprovalStatus, ApprovalItemStatus } from '../generated/prisma';

export interface ApprovalQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  salespersonId?: string;
  status?: ApprovalStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ApprovalRepository {
  async create(data: Prisma.ApprovalCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approval.create({
      data,
      include: {
        company: true,
        branch: true,
        customer: true,
        salesperson: true,
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true,
                tags: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approval.findUnique({
      where: { id },
      include: {
        company: true,
        branch: true,
        customer: true,
        salesperson: true,
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true,
                tags: true,
              },
            },
          },
        },
      },
    });
  }

  async findByApprovalNumber(companyId: string, approvalNumber: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approval.findUnique({
      where: {
        approvalNumber,
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        salesperson: true,
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true,
                tags: true,
              },
            },
          },
        },
      },
    });
  }

  async findMany(params: ApprovalQueryParams) {
    const {
      page = 1,
      limit = 20,
      search,
      companyId,
      branchId,
      customerId,
      salespersonId,
      status,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.ApprovalWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (salespersonId) where.salespersonId = salespersonId;
    if (status) where.status = status;

    if (fromDate || toDate) {
      where.issueDate = {};
      if (fromDate) where.issueDate.gte = new Date(fromDate);
      if (toDate) where.issueDate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { approvalNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { mobile: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: {
            include: {
              inventoryItem: {
                include: {
                  product: true,
                  tags: true,
                },
              },
            },
          },
        },
      }),
      prisma.approval.count({ where }),
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

  async update(id: string, data: Prisma.ApprovalUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approval.update({
      where: { id },
      data,
      include: {
        company: true,
        branch: true,
        customer: true,
        salesperson: true,
        items: {
          include: {
            inventoryItem: {
              include: {
                product: true,
                tags: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteItems(approvalId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approvalItem.deleteMany({
      where: { approvalId },
    });
  }

  async findActiveApprovalForItem(inventoryItemId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.approvalItem.findFirst({
      where: {
        inventoryItemId,
        approval: {
          status: {
            in: [ApprovalStatus.ISSUED, ApprovalStatus.WITH_CUSTOMER],
          },
        },
      },
      include: {
        approval: true,
      },
    });
  }
}

export const approvalRepository = new ApprovalRepository();
