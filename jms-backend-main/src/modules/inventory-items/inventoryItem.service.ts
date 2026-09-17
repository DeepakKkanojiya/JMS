import { inventoryItemRepository, productRepository, branchRepository, stockMovementRepository } from '../../repositories';
import { NotFoundError, ConflictError, ValidationError } from '../../errors';
import { CreateInventoryItemInput, UpdateInventoryItemInput, InventoryItemQueryOptions } from './inventoryItem.types';

export class InventoryItemService {
  async createInventoryItem(data: CreateInventoryItemInput, userId?: string) {
    // 1. Verify Product exists and is active
    const product = await productRepository.findById(data.productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found or is inactive');
    }

    // 2. Verify Branch exists and is active
    const branch = await branchRepository.findById(data.branchId);
    if (!branch || !branch.isActive) {
      throw new NotFoundError('Branch not found or is inactive');
    }

    // 3. Verify Weight business rule
    if (data.grossWeight < data.netWeight) {
      throw new ValidationError('Gross weight must be greater than or equal to net weight');
    }

    // 4. Verify Item Code uniqueness
    const existingItem = await inventoryItemRepository.findByItemCode(product.companyId, data.itemCode);
    if (existingItem) {
      throw new ConflictError(`Inventory item code '${data.itemCode}' already exists`);
    }

    // 5. Verify Tag uniqueness (Barcode, RFID)
    if (data.barcode) {
      const existingBarcode = await inventoryItemRepository.findTagByBarcode(data.barcode);
      if (existingBarcode) {
        throw new ConflictError(`Barcode '${data.barcode}' is already in use`);
      }
    }

    if (data.rfidEpc) {
      const existingRfid = await inventoryItemRepository.findTagByRfidEpc(data.rfidEpc);
      if (existingRfid) {
        throw new ConflictError(`RFID EPC '${data.rfidEpc}' is already in use`);
      }
    }

    const createdItem = await inventoryItemRepository.create({
      ...data,
      companyId: product.companyId,
      createdBy: userId,
    });

    // Automatically record STOCK_IN movement for new piece
    try {
      await stockMovementRepository.create({
        inventoryItemId: createdItem.id,
        fromBranchId: null,
        toBranchId: createdItem.branchId,
        movementType: 'STOCK_IN',
        referenceType: 'INVENTORY_ADD',
        referenceId: createdItem.itemCode,
        remarks: 'New item added to showroom inventory',
        performedBy: userId || null,
      });
    } catch (e) {
      // safe fallback
    }

    return createdItem;
  }

  async getInventoryItems(options: InventoryItemQueryOptions) {
    return inventoryItemRepository.findAll(options);
  }

  async getInventoryItemById(id: string) {
    const item = await inventoryItemRepository.findById(id);
    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }
    return item;
  }

  async getInventoryItemHistory(id: string) {
    const item = await inventoryItemRepository.findById(id);
    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }
    return inventoryItemRepository.getHistory(id);
  }

  async updateInventoryItem(id: string, data: UpdateInventoryItemInput, userId?: string) {
    const existingItem = await inventoryItemRepository.findById(id);
    if (!existingItem) {
      throw new NotFoundError('Inventory item not found');
    }

    if (data.branchId) {
      const branch = await branchRepository.findById(data.branchId);
      if (!branch || !branch.isActive) {
        throw new NotFoundError('Target branch not found or is inactive');
      }
    }

    const effectiveGross = data.grossWeight ?? Number(existingItem.grossWeight);
    const effectiveNet = data.netWeight ?? Number(existingItem.netWeight);
    if (effectiveGross < effectiveNet) {
      throw new ValidationError('Gross weight must be greater than or equal to net weight');
    }



    if (data.barcode && data.barcode !== existingItem.inventoryTag?.barcode) {
      const existingBarcode = await inventoryItemRepository.findTagByBarcode(data.barcode);
      if (existingBarcode) {
        throw new ConflictError(`Barcode '${data.barcode}' is already in use`);
      }
    }

    if (data.rfidEpc && data.rfidEpc !== existingItem.inventoryTag?.rfidEpc) {
      const existingRfid = await inventoryItemRepository.findTagByRfidEpc(data.rfidEpc);
      if (existingRfid) {
        throw new ConflictError(`RFID EPC '${data.rfidEpc}' is already in use`);
      }
    }

    // Record StockAdjustment if weight calibration occurs
    const weightChanged =
      (data.grossWeight !== undefined && data.grossWeight !== Number(existingItem.grossWeight)) ||
      (data.netWeight !== undefined && data.netWeight !== Number(existingItem.netWeight)) ||
      (data.stoneWeight !== undefined && data.stoneWeight !== Number(existingItem.stoneWeight));

    if (weightChanged) {
      await inventoryItemRepository.createAdjustment({
        inventoryItemId: id,
        branchId: data.branchId || existingItem.branchId,
        previousStatus: existingItem.status,
        newStatus: data.status || existingItem.status,
        previousGrossWeight: existingItem.grossWeight,
        newGrossWeight: effectiveGross,
        previousNetWeight: existingItem.netWeight,
        newNetWeight: effectiveNet,
        reason: data.adjustmentReason || 'Precision weight calibration update',
        adjustedBy: userId,
      });
    }

    const updatedItem = await inventoryItemRepository.update(id, {
      ...data,
      updatedBy: userId,
    });

    // Record Stock Movement on status change
    if (data.status && data.status !== existingItem.status) {
      if (data.status === 'SOLD') {
        try {
          await stockMovementRepository.create({
            inventoryItemId: id,
            fromBranchId: existingItem.branchId,
            toBranchId: null,
            movementType: 'STOCK_OUT',
            referenceType: 'SALE_CHECKOUT',
            referenceId: existingItem.itemCode,
            remarks: 'Item marked as sold and checked out of showroom stock',
            performedBy: userId || null,
          });
        } catch (e) {
          // safe fallback
        }
      } else if (data.status === 'AVAILABLE' && existingItem.status === 'SOLD') {
        try {
          await stockMovementRepository.create({
            inventoryItemId: id,
            fromBranchId: null,
            toBranchId: existingItem.branchId,
            movementType: 'STOCK_IN',
            referenceType: 'SALE_RETURN',
            referenceId: existingItem.itemCode,
            remarks: 'Item returned back into available showroom stock',
            performedBy: userId || null,
          });
        } catch (e) {
          // safe fallback
        }
      }
    }

    return updatedItem;
  }

  async deleteInventoryItem(id: string) {
    const item = await inventoryItemRepository.findById(id);
    if (!item) {
      throw new NotFoundError('Inventory item not found');
    }

    const history = await inventoryItemRepository.getHistory(id);
    if (history.movements.length > 0 || history.adjustments.length > 0) {
      throw new ConflictError(
        'Cannot delete inventory item: historical stock movement audit records exist. Use status update (e.g., DAMAGED/LOST) instead.'
      );
    }

    return inventoryItemRepository.delete(id);
  }
}

export const inventoryItemService = new InventoryItemService();
