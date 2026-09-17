import { prisma } from '../database';
import { Prisma } from '../generated/prisma';

function mapInventoryItem(item: any) {
  if (!item) return null;
  const activeTag = item.tags?.find((t: any) => t.isActive) || item.tags?.[0] || null;
  return {
    ...item,
    inventoryTag: activeTag,
  };
}

export class InventoryItemRepository {
  async create(data: {
    companyId: string;
    productId: string;
    branchId: string;
    itemCode: string;
    grossWeight: number | Prisma.Decimal;
    netWeight: number | Prisma.Decimal;
    stoneWeight?: number | Prisma.Decimal;
    fineWeight?: number | Prisma.Decimal;
    purity: string;
    status?: string;
    createdBy?: string;
    barcode?: string;
    rfidEpc?: string | null;
    purchaseReceiptItemId?: string | null;
  }) {
    const barcode = data.barcode || `BC-${data.itemCode}`;
    const rfidEpc = data.rfidEpc ?? null;

    let purityVal = 0.916;
    const purityStr = String(data.purity).toUpperCase();
    if (purityStr.includes('24') || purityStr.includes('999')) {
      purityVal = 0.999;
    } else if (purityStr.includes('22') || purityStr.includes('916')) {
      purityVal = 0.916;
    } else if (purityStr.includes('18') || purityStr.includes('750')) {
      purityVal = 0.750;
    } else if (purityStr.includes('14') || purityStr.includes('585')) {
      purityVal = 0.585;
    }
    const fineWeight = data.fineWeight ?? (Number(data.netWeight) * purityVal);

    return prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.create({
        data: {
          companyId: data.companyId,
          productId: data.productId,
          branchId: data.branchId,
          itemCode: data.itemCode,
          grossWeight: data.grossWeight,
          netWeight: data.netWeight,
          stoneWeight: data.stoneWeight ?? 0.0,
          fineWeight,
          purity: data.purity,
          status: data.status || 'AVAILABLE',
          createdBy: data.createdBy,
          purchaseReceiptItemId: data.purchaseReceiptItemId || null,
          tags: {
            create: {
              barcode,
              rfidEpc,
              isActive: true,
            },
          },
        },
        include: {
          product: {
            include: {
              images: true,
              subCategory: { include: { category: true } },
            },
          },
          branch: true,
          tags: true,
          images: true,
        },
      });

      // Record initial STOCK_IN movement entry for stock intake
      await tx.stockMovement.create({
        data: {
          inventoryItemId: item.id,
          toBranchId: data.branchId,
          movementType: 'STOCK_IN',
          referenceType: 'INITIAL_INTAKE',
          referenceId: item.itemCode,
          remarks: 'Initial showroom stock registration',
          performedBy: data.createdBy,
        },
      });

      return mapInventoryItem(item);
    });
  }

  async findById(id: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: true,
            subCategory: { include: { category: true } },
          },
        },
        branch: true,
        tags: true,
        images: true,
      },
    });
    return mapInventoryItem(item);
  }

  async findByItemCode(companyId: string, itemCode: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: {
        companyId_itemCode: { companyId, itemCode },
      },
      include: { tags: true },
    });
    return mapInventoryItem(item);
  }

  async findTagByBarcode(barcode: string) {
    return prisma.inventoryTag.findUnique({ where: { barcode } });
  }

  async findTagByRfidEpc(rfidEpc: string) {
    return prisma.inventoryTag.findUnique({ where: { rfidEpc } });
  }

  async lookupAvailableByIdentifier(identifier: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        status: 'AVAILABLE',
        OR: [
          { id: identifier.match(/^[0-9a-fA-F-]{36}$/) ? identifier : undefined },
          { itemCode: identifier },
          { tags: { some: { barcode: identifier, isActive: true } } },
          { tags: { some: { rfidEpc: identifier, isActive: true } } }
        ]
      },
      include: {
        product: {
          include: {
            images: true,
            subCategory: { include: { category: true } }
          }
        },
        branch: true,
        tags: true,
        images: true
      }
    });
    return mapInventoryItem(item);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    productId?: string;
    branchId?: string;
    status?: string;
    purity?: string;
    metalType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page ? Math.max(1, Number(options.page)) : 1;
    const limit = options?.limit ? Math.max(1, Number(options.limit)) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.productId) {
      where.productId = options.productId;
    }

    if (options?.branchId) {
      where.branchId = options.branchId;
    }

    if (options?.status) {
      where.status = { equals: options.status, mode: 'insensitive' };
    }

    if (options?.purity) {
      where.purity = { contains: options.purity, mode: 'insensitive' };
    }

    if (options?.metalType) {
      where.product = {
        metalType: { contains: options.metalType, mode: 'insensitive' },
      };
    }

    if (options?.search) {
      where.OR = [
        { itemCode: { contains: options.search, mode: 'insensitive' } },
        { purity: { contains: options.search, mode: 'insensitive' } },
        { product: { name: { contains: options.search, mode: 'insensitive' } } },
        { product: { sku: { contains: options.search, mode: 'insensitive' } } },
        { tags: { some: { barcode: { contains: options.search, mode: 'insensitive' } } } },
        { tags: { some: { rfidEpc: { contains: options.search, mode: 'insensitive' } } } },
      ];
    }

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'itemCode',
      'grossWeight',
      'netWeight',
      'purity',
      'status',
    ];
    const sortBy =
      options?.sortBy && validSortFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
    const sortOrder = options?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            include: {
              images: true,
              subCategory: { include: { category: true } },
            },
          },
          branch: true,
          tags: true,
          images: true,
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(mapInventoryItem),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async update(
    id: string,
    data: {
      branchId?: string;
      grossWeight?: number | Prisma.Decimal;
      netWeight?: number | Prisma.Decimal;
      stoneWeight?: number | Prisma.Decimal;
      purity?: string;
      status?: string;
      updatedBy?: string;
      barcode?: string;
      qrCode?: string;
      rfidEpc?: string | null;
      adjustmentReason?: string;
    }
  ) {
    const { barcode, qrCode, rfidEpc, adjustmentReason, ...itemData } = data;

    let fineWeightUpdate: number | Prisma.Decimal | undefined;
    if (data.netWeight !== undefined || data.purity !== undefined) {
      const existing = await prisma.inventoryItem.findUnique({ where: { id } });
      if (existing) {
        const purityStr = String(data.purity || existing.purity).toUpperCase();
        let purityVal = 0.916;
        if (purityStr.includes('24') || purityStr.includes('999')) {
          purityVal = 0.999;
        } else if (purityStr.includes('22') || purityStr.includes('916')) {
          purityVal = 0.916;
        } else if (purityStr.includes('18') || purityStr.includes('750')) {
          purityVal = 0.750;
        } else if (purityStr.includes('14') || purityStr.includes('585')) {
          purityVal = 0.585;
        }
        fineWeightUpdate = Number(data.netWeight ?? existing.netWeight) * purityVal;
      }
    }

    return prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: {
          ...itemData,
          ...(fineWeightUpdate !== undefined && { fineWeight: fineWeightUpdate }),
        },
        include: {
          product: { include: { subCategory: { include: { category: true } } } },
          branch: true,
          tags: true,
        },
      });

      if (barcode || rfidEpc !== undefined) {
        const tagData: any = {};
        if (barcode) tagData.barcode = barcode;
        if (rfidEpc !== undefined) tagData.rfidEpc = rfidEpc;

        const activeTag = await tx.inventoryTag.findFirst({
          where: { inventoryItemId: id, isActive: true },
        });

        if (activeTag) {
          await tx.inventoryTag.update({
            where: { id: activeTag.id },
            data: tagData,
          });
        } else {
          await tx.inventoryTag.create({
            data: {
              inventoryItemId: id,
              barcode: barcode || `BC-${updatedItem.itemCode}`,
              rfidEpc: rfidEpc ?? null,
              isActive: true,
            },
          });
        }
      }

      const res = await tx.inventoryItem.findUnique({
        where: { id },
        include: {
          product: { include: { subCategory: { include: { category: true } } } },
          branch: true,
          tags: true,
        },
      });
      return mapInventoryItem(res);
    });
  }

  async createAdjustment(data: {
    inventoryItemId: string;
    branchId: string;
    previousStatus: string;
    newStatus: string;
    previousGrossWeight: number | Prisma.Decimal;
    newGrossWeight: number | Prisma.Decimal;
    previousNetWeight: number | Prisma.Decimal;
    newNetWeight: number | Prisma.Decimal;
    reason: string;
    adjustedBy?: string;
  }) {
    return prisma.stockAdjustment.create({
      data,
    });
  }

  async delete(id: string) {
    return prisma.inventoryItem.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.inventoryItem.update({
      where: { id },
      data: { status },
    });
  }

  async updateBranchAndStatus(id: string, branchId: string, status: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.inventoryItem.update({
      where: { id },
      data: { branchId, status },
    });
  }

  async getHistory(inventoryItemId: string) {
    const [movements, adjustments] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { inventoryItemId },
        include: { fromBranch: true, toBranch: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockAdjustment.findMany({
        where: { inventoryItemId },
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { movements, adjustments };
  }
}

export const inventoryItemRepository = new InventoryItemRepository();
