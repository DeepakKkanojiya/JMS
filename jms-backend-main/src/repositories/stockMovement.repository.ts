import { prisma } from '../database';
import { Prisma } from '../generated/prisma';

export class StockMovementRepository {
  /**
   * Create a new immutable stock movement record.
   * Supports optional transactional execution.
   */
  async create(
    data: {
      inventoryItemId: string;
      fromBranchId?: string | null;
      toBranchId?: string | null;
      movementType: string;
      referenceType?: string | null;
      referenceId?: string | null;
      remarks?: string | null;
      performedBy?: string | null;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.stockMovement.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        fromBranchId: data.fromBranchId || null,
        toBranchId: data.toBranchId || null,
        movementType: data.movementType,
        referenceType: data.referenceType || null,
        referenceId: data.referenceId || null,
        remarks: data.remarks || null,
        performedBy: data.performedBy || null,
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
      },
    });
  }

  /**
   * Find stock movement by ID with details.
   */
  async findById(id: string) {
    const movement = await prisma.stockMovement.findUnique({
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
            branch: true,
            tags: true,
          },
        },
        fromBranch: true,
        toBranch: true,
      },
    });

    if (!movement) return null;

    // Safely look up user name if performedBy user ID exists
    let performedByUser: { id: string; email: string; name: string } | null = null;
    if (movement.performedBy) {
      const user = await prisma.user.findUnique({
        where: { id: movement.performedBy },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
      if (user) {
        performedByUser = {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName || ''}`.trim(),
        };
      }
    }

    return {
      ...movement,
      performedByUser,
    };
  }

  /**
   * Get all movements for a given inventory item ID.
   */
  async findByInventoryItemId(inventoryItemId: string) {
    return prisma.stockMovement.findMany({
      where: { inventoryItemId },
      include: {
        fromBranch: true,
        toBranch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find paginated list of stock movements with search, filters, and safe sorting.
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    inventoryItemId?: string;
    fromBranchId?: string;
    toBranchId?: string;
    branchId?: string;
    movementType?: string;
    referenceType?: string;
    referenceId?: string;
    performedBy?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options?.limit ? Math.max(1, Number(options.limit)) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.inventoryItemId) {
      where.inventoryItemId = options.inventoryItemId;
    }

    if (options?.fromBranchId) {
      where.fromBranchId = options.fromBranchId;
    }

    if (options?.toBranchId) {
      where.toBranchId = options.toBranchId;
    }

    // Branch filter: matches either source or destination branch
    if (options?.branchId) {
      where.OR = [
        { fromBranchId: options.branchId },
        { toBranchId: options.branchId },
      ];
    }

    if (options?.movementType) {
      where.movementType = { equals: options.movementType, mode: 'insensitive' };
    }

    if (options?.referenceType) {
      where.referenceType = { equals: options.referenceType, mode: 'insensitive' };
    }

    if (options?.referenceId) {
      where.referenceId = { contains: options.referenceId, mode: 'insensitive' };
    }

    if (options?.performedBy) {
      where.performedBy = options.performedBy;
    }

    if (options?.dateFrom || options?.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) {
        where.createdAt.gte = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        where.createdAt.lte = new Date(options.dateTo);
      }
    }

    if (options?.search) {
      const searchOR = [
        { movementType: { contains: options.search, mode: 'insensitive' } },
        { referenceType: { contains: options.search, mode: 'insensitive' } },
        { referenceId: { contains: options.search, mode: 'insensitive' } },
        { remarks: { contains: options.search, mode: 'insensitive' } },
        { inventoryItem: { itemCode: { contains: options.search, mode: 'insensitive' } } },
        { inventoryItem: { product: { name: { contains: options.search, mode: 'insensitive' } } } },
        { inventoryItem: { product: { sku: { contains: options.search, mode: 'insensitive' } } } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    // Strict whitelist for sorting to prevent arbitrary SQL parameter injection
    const allowedSortFields = ['createdAt', 'movementType', 'referenceType', 'inventoryItemId'];
    const sortBy = allowedSortFields.includes(options?.sortBy || '') ? options!.sortBy! : 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
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
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const userIds = Array.from(new Set(data.map((d) => d.performedBy).filter(Boolean))) as string[];
    let userMap: Record<string, { id: string; email: string; name: string }> = {};
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
      for (const u of users) {
        userMap[u.id] = {
          id: u.id,
          email: u.email,
          name: `${u.firstName} ${u.lastName || ''}`.trim() || 'System Admin',
        };
      }
    }

    const enrichedData = data.map((d) => ({
      ...d,
      performedByUser: d.performedBy ? userMap[d.performedBy] || { id: d.performedBy, name: 'System Admin', email: '' } : { id: 'sys', name: 'System Admin', email: '' },
    }));

    return {
      data: enrichedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

export const stockMovementRepository = new StockMovementRepository();
