import { prisma } from '../database';
import { Prisma } from '../generated/prisma';

export class InventoryTagRepository {
  /**
   * Create a new inventory tag record.
   * Supports optional transactional execution.
   */
  async create(
    data: {
      inventoryItemId: string;
      barcode: string;
      rfidEpc?: string | null;
      isActive?: boolean;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.inventoryTag.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        barcode: data.barcode,
        rfidEpc: data.rfidEpc !== undefined ? data.rfidEpc : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
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
            branch: true,
          },
        },
      },
    });
  }

  /**
   * Find tag by inventoryItemId.
   */
  async findByInventoryItemId(inventoryItemId: string) {
    return prisma.inventoryTag.findFirst({
      where: { inventoryItemId },
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
          },
        },
      },
    });
  }

  /**
   * Find tag by barcode string.
   */
  async findByBarcode(barcode: string) {
    return prisma.inventoryTag.findUnique({
      where: { barcode },
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
          },
        },
      },
    });
  }

  /**
   * Find tag by optional RFID EPC string.
   */
  async findByRfidEpc(rfidEpc: string) {
    return prisma.inventoryTag.findUnique({
      where: { rfidEpc },
      include: {
        inventoryItem: true,
      },
    });
  }

  /**
   * Update existing tag record.
   */
  async update(
    id: string,
    data: {
      barcode?: string;
      rfidEpc?: string | null;
      isActive?: boolean;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.inventoryTag.update({
      where: { id },
      data: {
        barcode: data.barcode,
        rfidEpc: data.rfidEpc !== undefined ? data.rfidEpc : undefined,
        isActive: data.isActive,
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
            branch: true,
          },
        },
      },
    });
  }

  /**
   * Update active status of tag.
   */
  async updateStatus(id: string, isActive: boolean) {
    return prisma.inventoryTag.update({
      where: { id },
      data: { isActive },
      include: {
        inventoryItem: true,
      },
    });
  }

  /**
   * Find paginated list of inventory tags with filters and safe sorting.
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    qrCode?: string;
    inventoryItemId?: string;
    branchId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options?.limit ? Math.max(1, Number(options.limit)) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options?.inventoryItemId) {
      where.inventoryItemId = options.inventoryItemId;
    }

    if (options?.branchId) {
      where.inventoryItem = { branchId: options.branchId };
    }

    if (options?.qrCode) {
      where.qrCode = { contains: options.qrCode, mode: 'insensitive' };
    }

    if (options?.search) {
      where.OR = [
        { qrCode: { contains: options.search, mode: 'insensitive' } },
        { rfidEpc: { contains: options.search, mode: 'insensitive' } },
        { inventoryItem: { itemCode: { contains: options.search, mode: 'insensitive' } } },
        { inventoryItem: { product: { name: { contains: options.search, mode: 'insensitive' } } } },
        { inventoryItem: { product: { sku: { contains: options.search, mode: 'insensitive' } } } },
      ];
    }

    // Strict whitelist for sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'taggedAt', 'qrCode', 'isActive'];
    const sortBy = allowedSortFields.includes(options?.sortBy || '') ? options!.sortBy! : 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.inventoryTag.findMany({
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
              branch: true,
            },
          },
        },
      }),
      prisma.inventoryTag.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

export const inventoryTagRepository = new InventoryTagRepository();
