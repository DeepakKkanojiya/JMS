import { stockMovementRepository, inventoryItemRepository, branchRepository } from '../../repositories';
import { CreateStockMovementDTO, StockMovementQueryOptions } from './stockMovement.types';
import { NotFoundError, BadRequestError } from '../../errors';
import { prisma } from '../../database';

export class StockMovementService {
  /**
   * Create a new immutable stock movement record and transition inventory item state atomically.
   */
  async createStockMovement(dto: CreateStockMovementDTO, userId?: string) {
    // 1. Verify Inventory Item exists
    const item = await inventoryItemRepository.findById(dto.inventoryItemId);
    if (!item) {
      throw new NotFoundError(`Inventory item with ID '${dto.inventoryItemId}' not found`);
    }

    // 2. Verify Source Branch if provided
    if (dto.fromBranchId) {
      const fromBranch = await branchRepository.findById(dto.fromBranchId);
      if (!fromBranch || !fromBranch.isActive) {
        throw new NotFoundError(`Source branch with ID '${dto.fromBranchId}' not found or is inactive`);
      }
    }

    // 3. Verify Destination Branch if provided
    if (dto.toBranchId) {
      const toBranch = await branchRepository.findById(dto.toBranchId);
      if (!toBranch || !toBranch.isActive) {
        throw new NotFoundError(`Destination branch with ID '${dto.toBranchId}' not found or is inactive`);
      }
    }

    // 4. Validate Transfer Specific Rules
    if (dto.movementType === 'TRANSFER') {
      if (!dto.fromBranchId || !dto.toBranchId) {
        throw new BadRequestError('Both fromBranchId and toBranchId are required for TRANSFER movements');
      }
      if (dto.fromBranchId === dto.toBranchId) {
        throw new BadRequestError('Source branch (fromBranchId) and destination branch (toBranchId) cannot be the same');
      }
    }

    // 5. Validate Stock Out Rules
    if (dto.movementType === 'STOCK_OUT' || dto.movementType === 'SALE') {
      if (item.status === 'SOLD' || item.status === 'LOST' || item.status === 'DAMAGED') {
        throw new BadRequestError(`Cannot perform ${dto.movementType} on item with current status '${item.status}'`);
      }
    }

    // 6. Execute State Transition and StockMovement creation inside a Prisma Transaction
    return prisma.$transaction(async (tx) => {
      // Determine inventory item update payloads based on movement type
      let itemUpdates: any = {};

      switch (dto.movementType) {
        case 'STOCK_IN':
        case 'PURCHASE':
        case 'REPAIR_IN':
        case 'APPROVAL_RETURN':
        case 'SALE_RETURN':
          itemUpdates = { status: 'AVAILABLE' };
          break;
        case 'STOCK_OUT':
        case 'SALE':
          itemUpdates = { status: 'SOLD' };
          break;
        case 'TRANSFER':
          if (dto.toBranchId) {
            itemUpdates = { branchId: dto.toBranchId, status: 'AVAILABLE' };
          }
          break;
        case 'REPAIR_OUT':
          itemUpdates = { status: 'UNDER_REPAIR' };
          break;
        case 'APPROVAL_OUT':
          itemUpdates = { status: 'ON_APPROVAL' };
          break;
        default:
          // For ADJUSTMENT or custom reference movements, retain current item status/branch
          break;
      }

      if (Object.keys(itemUpdates).length > 0) {
        await tx.inventoryItem.update({
          where: { id: dto.inventoryItemId },
          data: {
            ...itemUpdates,
            updatedBy: userId || null,
          },
        });
      }

      // Record immutable stock movement
      return stockMovementRepository.create(
        {
          inventoryItemId: dto.inventoryItemId,
          fromBranchId: dto.fromBranchId || item.branchId,
          toBranchId: dto.toBranchId || null,
          movementType: dto.movementType,
          referenceType: dto.referenceType || null,
          referenceId: dto.referenceId || null,
          remarks: dto.remarks || null,
          performedBy: userId || null,
        },
        tx
      );
    });
  }

  /**
   * Get paginated stock movements with search, filters, and safe sorting.
   */
  async getStockMovements(options?: StockMovementQueryOptions) {
    return stockMovementRepository.findAll(options);
  }

  /**
   * Get single stock movement by ID.
   */
  async getStockMovementById(id: string) {
    const movement = await stockMovementRepository.findById(id);
    if (!movement) {
      throw new NotFoundError(`Stock movement with ID '${id}' not found`);
    }
    return movement;
  }
}

export const stockMovementService = new StockMovementService();
