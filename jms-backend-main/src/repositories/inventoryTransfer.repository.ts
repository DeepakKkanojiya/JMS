import { prisma } from '../database';
import { Prisma, TransferStatus } from '../generated/prisma';

function mapTransfer(transfer: any) {
  if (!transfer) return null;
  if (transfer.inventoryItem) {
    const activeTag = transfer.inventoryItem.tags?.find((t: any) => t.isActive) || transfer.inventoryItem.tags?.[0] || null;
    transfer.inventoryItem.inventoryTag = activeTag;
  }
  return transfer;
}

export class InventoryTransferRepository {
  /**
   * Create a new inventory transfer request.
   */
  async create(data: {
    transferCode: string;
    inventoryItemId: string;
    fromBranchId: string;
    toBranchId: string;
    status?: TransferStatus;
    requestedBy: string;
    remarks?: string;
  }) {
    const transfer = await prisma.inventoryTransfer.create({
      data: {
        transferCode: data.transferCode,
        inventoryItemId: data.inventoryItemId,
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        status: data.status || TransferStatus.REQUESTED,
        requestedBy: data.requestedBy,
        remarks: data.remarks,
      },
      include: {
        inventoryItem: {
          include: {
            product: {
              include: {
                subCategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            tags: true,
          },
        },
        fromBranch: true,
        toBranch: true,
        requestedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    return mapTransfer(transfer);
  }

  /**
   * Find transfer by primary key ID with all relations populated.
   */
  async findById(id: string) {
    const transfer = await prisma.inventoryTransfer.findUnique({
      where: { id },
      include: {
        inventoryItem: {
          include: {
            product: {
              include: {
                subCategory: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            tags: true,
          },
        },
        fromBranch: true,
        toBranch: true,
        requestedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        dispatchedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        receivedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        rejectedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return mapTransfer(transfer);
  }

  /**
   * Find transfer by unique transferCode.
   */
  async findByTransferCode(transferCode: string) {
    return prisma.inventoryTransfer.findUnique({
      where: { transferCode },
    });
  }

  /**
   * Find any active transfer on an inventory item (REQUESTED, APPROVED, or DISPATCHED).
   */
  async findActiveTransferByItem(inventoryItemId: string) {
    return prisma.inventoryTransfer.findFirst({
      where: {
        inventoryItemId,
        status: {
          in: [TransferStatus.REQUESTED, TransferStatus.APPROVED, TransferStatus.DISPATCHED],
        },
      },
    });
  }

  /**
   * Update transfer record (status, timestamps, audit user IDs).
   */
  async update(
    id: string,
    data: {
      status?: TransferStatus;
      approvedBy?: string;
      approvedAt?: Date;
      dispatchedBy?: string;
      dispatchedAt?: Date;
      receivedBy?: string;
      receivedAt?: Date;
      rejectedBy?: string;
      rejectedAt?: Date;
      rejectionReason?: string;
      remarks?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const transfer = await client.inventoryTransfer.update({
      where: { id },
      data,
      include: {
        inventoryItem: {
          include: {
            product: true,
            tags: true,
          },
        },
        fromBranch: true,
        toBranch: true,
        requestedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        dispatchedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        receivedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        rejectedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return mapTransfer(transfer);
  }

  /**
   * List paginated transfers with filters, search, and safe sorting.
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: TransferStatus;
    fromBranchId?: string;
    toBranchId?: string;
    inventoryItemId?: string;
    transferCode?: string;
    dateFrom?: Date | string;
    dateTo?: Date | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options?.limit ? Math.max(1, Number(options.limit)) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryTransferWhereInput = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.fromBranchId) {
      where.fromBranchId = options.fromBranchId;
    }

    if (options?.toBranchId) {
      where.toBranchId = options.toBranchId;
    }

    if (options?.inventoryItemId) {
      where.inventoryItemId = options.inventoryItemId;
    }

    if (options?.transferCode) {
      where.transferCode = { contains: options.transferCode, mode: 'insensitive' };
    }

    if (options?.dateFrom || options?.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = new Date(options.dateFrom);
      if (options.dateTo) where.createdAt.lte = new Date(options.dateTo);
    }

    if (options?.search) {
      where.OR = [
        { transferCode: { contains: options.search, mode: 'insensitive' } },
        { remarks: { contains: options.search, mode: 'insensitive' } },
        { rejectionReason: { contains: options.search, mode: 'insensitive' } },
        { inventoryItem: { itemCode: { contains: options.search, mode: 'insensitive' } } },
        { inventoryItem: { product: { name: { contains: options.search, mode: 'insensitive' } } } },
        { inventoryItem: { product: { sku: { contains: options.search, mode: 'insensitive' } } } },
      ];
    }

    // Strict whitelist for sorting
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'transferCode',
      'status',
      'dispatchedAt',
      'receivedAt',
    ];
    const sortBy = allowedSortFields.includes(options?.sortBy || '')
      ? options!.sortBy!
      : 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.inventoryTransfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          inventoryItem: {
            include: {
              product: {
                include: {
                  subCategory: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
              tags: true,
            },
          },
          fromBranch: true,
          toBranch: true,
          requestedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          dispatchedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          receivedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          rejectedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.inventoryTransfer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(mapTransfer),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

export const inventoryTransferRepository = new InventoryTransferRepository();
