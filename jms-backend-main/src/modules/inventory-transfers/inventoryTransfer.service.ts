import {
  inventoryTransferRepository,
  inventoryItemRepository,
  branchRepository,
  stockMovementRepository,
} from '../../repositories';
import {
  CreateTransferDTO,
  RejectTransferDTO,
  InventoryTransferQueryOptions,
} from './inventoryTransfer.types';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import { prisma } from '../../database';
import { TransferStatus } from '../../generated/prisma';

export class InventoryTransferService {
  /**
   * Generate unique transfer code (TRF-YYYY-XXXXX).
   */
  private async generateTransferCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = (await prisma.inventoryTransfer.count()) + 1;
    let code = `TRF-${year}-${String(count).padStart(5, '0')}`;
    let existing = await inventoryTransferRepository.findByTransferCode(code);
    let counter = 1;

    while (existing) {
      code = `TRF-${year}-${String(count + counter).padStart(5, '0')}`;
      existing = await inventoryTransferRepository.findByTransferCode(code);
      counter++;
    }

    return code;
  }

  /**
   * Create a new branch transfer request.
   */
  async createTransfer(dto: CreateTransferDTO, userId: string) {
    // 1. Verify Inventory Item exists
    const item = await inventoryItemRepository.findById(dto.inventoryItemId);
    if (!item) {
      throw new NotFoundError(`Inventory item with ID '${dto.inventoryItemId}' not found`);
    }

    // 2. Verify Item Eligibility for transfer (must be AVAILABLE)
    if (item.status !== 'AVAILABLE') {
      throw new BadRequestError(
        `Inventory item '${item.itemCode}' cannot be transferred because its current status is '${item.status}'`
      );
    }

    // 3. Determine Source Branch
    const fromBranchId = dto.fromBranchId || item.branchId;

    // 4. Verify Item belongs to Source Branch
    if (item.branchId !== fromBranchId) {
      throw new BadRequestError(
        `Inventory item '${item.itemCode}' does not belong to the source branch '${fromBranchId}'`
      );
    }

    // 5. Verify Source & Destination Branches exist & are active
    const fromBranch = await branchRepository.findById(fromBranchId);
    if (!fromBranch || !fromBranch.isActive) {
      throw new NotFoundError(`Source branch '${fromBranchId}' not found or is inactive`);
    }

    const toBranch = await branchRepository.findById(dto.toBranchId);
    if (!toBranch || !toBranch.isActive) {
      throw new NotFoundError(`Destination branch '${dto.toBranchId}' not found or is inactive`);
    }

    // 6. Enforce Source != Destination
    if (fromBranchId === dto.toBranchId) {
      throw new BadRequestError('Source branch and destination branch must be different');
    }

    // 7. Concurrency Control: Check for active pending transfers on this item
    const activeTransfer = await inventoryTransferRepository.findActiveTransferByItem(
      dto.inventoryItemId
    );
    if (activeTransfer) {
      throw new ConflictError(
        `Active transfer request '${activeTransfer.transferCode}' already exists for inventory item '${item.itemCode}'`
      );
    }

    // 8. Generate Unique Transfer Code
    const transferCode = await this.generateTransferCode();

    // 9. Create Transfer in REQUESTED status
    return inventoryTransferRepository.create({
      transferCode,
      inventoryItemId: dto.inventoryItemId,
      fromBranchId,
      toBranchId: dto.toBranchId,
      requestedBy: userId,
      remarks: dto.remarks,
    });
  }

  /**
   * Approve a pending transfer request.
   */
  async approveTransfer(id: string, userId: string) {
    const transfer = await inventoryTransferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError(`Inventory transfer with ID '${id}' not found`);
    }

    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new BadRequestError(
        `Cannot approve transfer '${transfer.transferCode}' because its current status is '${transfer.status}' (expected REQUESTED)`
      );
    }

    return inventoryTransferRepository.update(id, {
      status: TransferStatus.APPROVED,
      approvedBy: userId,
      approvedAt: new Date(),
    });
  }

  /**
   * Reject a pending transfer request.
   */
  async rejectTransfer(id: string, dto: RejectTransferDTO, userId: string) {
    const transfer = await inventoryTransferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError(`Inventory transfer with ID '${id}' not found`);
    }

    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new BadRequestError(
        `Cannot reject transfer '${transfer.transferCode}' because its current status is '${transfer.status}' (expected REQUESTED)`
      );
    }

    return inventoryTransferRepository.update(id, {
      status: TransferStatus.REJECTED,
      rejectedBy: userId,
      rejectedAt: new Date(),
      rejectionReason: dto.rejectionReason,
    });
  }

  /**
   * Dispatch an approved transfer.
   * Atomically updates transfer status, sets item status to IN_TRANSIT, and logs StockMovement.
   */
  async dispatchTransfer(id: string, userId: string) {
    const transfer = await inventoryTransferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError(`Inventory transfer with ID '${id}' not found`);
    }

    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestError(
        `Cannot dispatch transfer '${transfer.transferCode}' because its current status is '${transfer.status}' (expected APPROVED)`
      );
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update transfer status to DISPATCHED
      const updatedTransfer = await inventoryTransferRepository.update(
        id,
        {
          status: TransferStatus.DISPATCHED,
          dispatchedBy: userId,
          dispatchedAt: new Date(),
        },
        tx
      );

      // 2. Update InventoryItem status to IN_TRANSIT
      await inventoryItemRepository.updateStatus(transfer.inventoryItemId, 'IN_TRANSIT', tx);

      // 3. Create immutable StockMovement audit record
      await stockMovementRepository.create(
        {
          inventoryItemId: transfer.inventoryItemId,
          fromBranchId: transfer.fromBranchId,
          toBranchId: transfer.toBranchId,
          movementType: 'TRANSFER',
          referenceType: 'INVENTORY_TRANSFER',
          referenceId: transfer.id,
          remarks: transfer.remarks || `Branch stock transfer ${transfer.transferCode} dispatched`,
          performedBy: userId,
        },
        tx
      );

      return updatedTransfer;
    });
  }

  /**
   * Receive a dispatched transfer.
   * Atomically updates transfer status, sets item branchId to destination, and restores status to AVAILABLE.
   */
  async receiveTransfer(id: string, userId: string) {
    const transfer = await inventoryTransferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError(`Inventory transfer with ID '${id}' not found`);
    }

    if (transfer.status !== TransferStatus.DISPATCHED) {
      throw new BadRequestError(
        `Cannot receive transfer '${transfer.transferCode}' because its current status is '${transfer.status}' (expected DISPATCHED)`
      );
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update transfer status to RECEIVED
      const updatedTransfer = await inventoryTransferRepository.update(
        id,
        {
          status: TransferStatus.RECEIVED,
          receivedBy: userId,
          receivedAt: new Date(),
        },
        tx
      );

      // 2. Update InventoryItem branchId to destination branch & status to AVAILABLE
      await inventoryItemRepository.updateBranchAndStatus(
        transfer.inventoryItemId,
        transfer.toBranchId,
        'AVAILABLE',
        tx
      );

      return updatedTransfer;
    });
  }

  /**
   * Get transfer details by ID.
   */
  async getTransferById(id: string) {
    const transfer = await inventoryTransferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError(`Inventory transfer with ID '${id}' not found`);
    }
    return transfer;
  }

  /**
   * Get paginated inventory transfers list with search and filters.
   */
  async getTransfers(options?: InventoryTransferQueryOptions) {
    return inventoryTransferRepository.findAll(options);
  }
}

export const inventoryTransferService = new InventoryTransferService();
