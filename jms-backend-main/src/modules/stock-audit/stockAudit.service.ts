import { prisma } from '../../database';
import { Prisma, AuditSessionStatus, AuditItemStatus } from '../../generated/prisma';
import { stockAuditRepository, branchRepository, companyRepository } from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreateStockAuditSessionDTO,
  ScanAuditItemDTO,
  StockAuditSessionQueryDTO,
} from './stockAudit.types';

export class StockAuditService {
  private async generateAuditNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `AUD-${dateStr}-`;

    const count = await client.stockAuditSession.count({
      where: { auditNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let auditNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.stockAuditSession.findUnique({ where: { auditNumber } });
    while (existing) {
      seq++;
      auditNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.stockAuditSession.findUnique({ where: { auditNumber } });
    }

    return auditNumber;
  }

  async createSession(dto: CreateStockAuditSessionDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({ where: { id: dto.companyId } });
      if (!company) throw new NotFoundError('Company not found');

      const branch = await tx.branch.findUnique({ where: { id: dto.branchId } });
      if (!branch) throw new NotFoundError('Branch not found');
      if (!branch.isActive) throw new BadRequestError('Branch is inactive');
      if (branch.companyId !== dto.companyId) throw new BadRequestError('Branch company mismatch');

      // Check for active IN_PROGRESS audit session in same branch
      const activeSession = await tx.stockAuditSession.findFirst({
        where: { branchId: dto.branchId, status: AuditSessionStatus.IN_PROGRESS },
      });
      if (activeSession) {
        throw new ConflictError(`An active Stock Audit session (${activeSession.auditNumber}) is already IN_PROGRESS for this branch`);
      }

      // Calculate Expected Inventory Snapshot
      const whereInv: Prisma.InventoryItemWhereInput = {
        branchId: dto.branchId,
        status: 'AVAILABLE',
      };

      if (dto.categoryId) {
        whereInv.product = { subCategory: { categoryId: dto.categoryId } };
      }

      const expectedItems = await tx.inventoryItem.findMany({ where: whereInv });
      const totalExpectedItems = expectedItems.length;
      const totalExpectedNetWeight = expectedItems.reduce(
        (sum, item) => sum.add(new Prisma.Decimal(item.netWeight)),
        new Prisma.Decimal(0)
      );

      const auditNumber = await this.generateAuditNumber(tx);

      return stockAuditRepository.createSession(
        {
          auditNumber,
          companyId: dto.companyId,
          branchId: dto.branchId,
          categoryId: dto.categoryId || null,
          totalExpectedItems,
          totalExpectedNetWeight,
          notes: dto.notes || null,
          auditedBy: userId || null,
        },
        tx
      );
    });
  }

  async getSessionById(id: string) {
    const session = await stockAuditRepository.findSessionById(id);
    if (!session) throw new NotFoundError('Stock Audit session not found');
    return session;
  }

  async getAllSessions(options: StockAuditSessionQueryDTO) {
    return stockAuditRepository.findAllSessions(options);
  }

  async scanItem(sessionId: string, dto: ScanAuditItemDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const session = await stockAuditRepository.findSessionById(sessionId, tx);
      if (!session) throw new NotFoundError('Stock Audit session not found');
      if (session.status !== AuditSessionStatus.IN_PROGRESS) {
        throw new BadRequestError(`Cannot scan items into audit session in ${session.status} status. Expected IN_PROGRESS`);
      }

      const identifier = dto.identifier.trim();

      // Search by ID, Barcode tag, or RFID EPC
      let invItem = await tx.inventoryItem.findFirst({
        where: {
          OR: [
            { id: identifier.length === 36 ? identifier : undefined },
            { itemCode: identifier },
            { tags: { some: { barcode: identifier } } },
            { tags: { some: { rfidEpc: identifier } } },
          ].filter(Boolean) as Prisma.InventoryItemWhereInput[],
        },
        include: { tags: true },
      });

      let status: AuditItemStatus = AuditItemStatus.MATCHED;
      let expectedGrossWeight: Prisma.Decimal | null = null;
      let expectedNetWeight: Prisma.Decimal | null = null;
      let weightDiscrepancy = new Prisma.Decimal(0);

      if (!invItem || invItem.branchId !== session.branchId || invItem.status !== 'AVAILABLE') {
        status = AuditItemStatus.UNEXPECTED;
      } else {
        expectedGrossWeight = new Prisma.Decimal(invItem.grossWeight);
        expectedNetWeight = new Prisma.Decimal(invItem.netWeight);

        if (dto.scannedNetWeight !== undefined && dto.scannedNetWeight !== null) {
          const scannedNet = new Prisma.Decimal(dto.scannedNetWeight);
          const diff = scannedNet.sub(expectedNetWeight).abs();
          if (diff.gt(0.05)) {
            status = AuditItemStatus.WEIGHT_MISMATCH;
            weightDiscrepancy = scannedNet.sub(expectedNetWeight);
          }
        }
      }

      const scannedGross = dto.scannedGrossWeight !== undefined && dto.scannedGrossWeight !== null ? new Prisma.Decimal(dto.scannedGrossWeight) : (expectedGrossWeight || new Prisma.Decimal(0));
      const scannedNet = dto.scannedNetWeight !== undefined && dto.scannedNetWeight !== null ? new Prisma.Decimal(dto.scannedNetWeight) : (expectedNetWeight || new Prisma.Decimal(0));

      const auditItem = await stockAuditRepository.addScannedItem(
        {
          auditSessionId: session.id,
          inventoryItemId: invItem ? invItem.id : null,
          barcode: invItem?.tags[0]?.barcode || identifier,
          rfidEpc: invItem?.tags[0]?.rfidEpc || null,
          status,
          expectedGrossWeight,
          expectedNetWeight,
          scannedGrossWeight: scannedGross,
          scannedNetWeight: scannedNet,
          weightDiscrepancy,
          remarks: dto.remarks || null,
          scannedBy: userId || null,
        },
        tx
      );

      return auditItem;
    });
  }

  async submitSession(sessionId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const session = await stockAuditRepository.findSessionById(sessionId, tx);
      if (!session) throw new NotFoundError('Stock Audit session not found');
      if (session.status !== AuditSessionStatus.IN_PROGRESS) {
        throw new BadRequestError(`Cannot submit Stock Audit session in ${session.status} status. Expected IN_PROGRESS`);
      }

      // Identify MISSING expected items
      const whereInv: Prisma.InventoryItemWhereInput = {
        branchId: session.branchId,
        status: 'AVAILABLE',
      };
      if (session.categoryId) {
        whereInv.product = { subCategory: { categoryId: session.categoryId } };
      }

      const expectedItems = await tx.inventoryItem.findMany({
        where: whereInv,
        include: { tags: true },
      });

      const scannedItemIds = new Set(
        session.scannedItems
          .map((i) => i.inventoryItemId)
          .filter((id): id is string => Boolean(id))
      );

      for (const expItem of expectedItems) {
        if (!scannedItemIds.has(expItem.id)) {
          await stockAuditRepository.addScannedItem(
            {
              auditSessionId: session.id,
              inventoryItemId: expItem.id,
              barcode: expItem.tags[0]?.barcode || null,
              rfidEpc: expItem.tags[0]?.rfidEpc || null,
              status: AuditItemStatus.MISSING,
              expectedGrossWeight: expItem.grossWeight,
              expectedNetWeight: expItem.netWeight,
              scannedGrossWeight: 0,
              scannedNetWeight: 0,
              weightDiscrepancy: new Prisma.Decimal(expItem.netWeight).negated(),
              remarks: 'Item not scanned during physical stocktake audit',
              scannedBy: userId || null,
            },
            tx
          );
        }
      }

      return stockAuditRepository.submitSession(sessionId, tx);
    });
  }

  async reconcileSession(sessionId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const session = await stockAuditRepository.findSessionById(sessionId, tx);
      if (!session) throw new NotFoundError('Stock Audit session not found');
      if (session.status !== AuditSessionStatus.SUBMITTED) {
        throw new BadRequestError(`Cannot reconcile Stock Audit session in ${session.status} status. Expected SUBMITTED`);
      }

      for (const item of session.scannedItems) {
        if (item.status === AuditItemStatus.MISSING && item.inventoryItemId) {
          // Update status to AUDIT_MISSING
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { status: 'AUDIT_MISSING', updatedBy: userId || undefined },
          });

          // Audit Stock Movement
          await tx.stockMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              fromBranchId: session.branchId,
              movementType: 'STOCKTAKE_MISSING',
              referenceType: 'STOCK_AUDIT',
              referenceId: session.id,
              remarks: `Item missing during physical stock audit '${session.auditNumber}'`,
              performedBy: userId || null,
            },
          });
        } else if (item.status === AuditItemStatus.WEIGHT_MISMATCH && item.inventoryItemId) {
          const invItem = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
          if (invItem && item.scannedGrossWeight && item.scannedNetWeight) {
            // Create Stock Adjustment entry
            await tx.stockAdjustment.create({
              data: {
                inventoryItemId: item.inventoryItemId,
                branchId: session.branchId,
                previousStatus: invItem.status,
                newStatus: invItem.status,
                previousGrossWeight: invItem.grossWeight,
                newGrossWeight: item.scannedGrossWeight,
                previousNetWeight: invItem.netWeight,
                newNetWeight: item.scannedNetWeight,
                reason: `Weight adjusted following stock audit reconciliation '${session.auditNumber}'`,
                adjustedBy: userId || null,
              },
            });

            // Update item weight
            await tx.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: {
                grossWeight: item.scannedGrossWeight,
                netWeight: item.scannedNetWeight,
                updatedBy: userId || undefined,
              },
            });
          }
        }
      }

      return stockAuditRepository.reconcileSession(sessionId, userId || 'SYSTEM', tx);
    });
  }

  async cancelSession(sessionId: string, cancellationReason: string, userId?: string) {
    const session = await stockAuditRepository.findSessionById(sessionId);
    if (!session) throw new NotFoundError('Stock Audit session not found');
    if (session.status === AuditSessionStatus.RECONCILED || session.status === AuditSessionStatus.CANCELLED) {
      throw new BadRequestError(`Cannot cancel Stock Audit session in ${session.status} status`);
    }

    if (!cancellationReason || cancellationReason.trim().length < 3) {
      throw new BadRequestError('Mandatory cancellation reason must be provided (at least 3 characters)');
    }

    return stockAuditRepository.cancelSession(sessionId, cancellationReason.trim());
  }

  async getDiscrepancies(sessionId: string) {
    const session = await stockAuditRepository.findSessionById(sessionId);
    if (!session) throw new NotFoundError('Stock Audit session not found');

    const missingItems = session.scannedItems.filter((i) => i.status === AuditItemStatus.MISSING);
    const unexpectedItems = session.scannedItems.filter((i) => i.status === AuditItemStatus.UNEXPECTED);
    const weightMismatchItems = session.scannedItems.filter((i) => i.status === AuditItemStatus.WEIGHT_MISMATCH);
    const matchedItems = session.scannedItems.filter((i) => i.status === AuditItemStatus.MATCHED);

    return {
      sessionId: session.id,
      auditNumber: session.auditNumber,
      status: session.status,
      summary: {
        totalExpectedItems: session.totalExpectedItems,
        totalScannedItems: session.totalScannedItems,
        matchedCount: matchedItems.length,
        missingCount: missingItems.length,
        unexpectedCount: unexpectedItems.length,
        weightMismatchCount: weightMismatchItems.length,
      },
      discrepancies: {
        missingItems,
        unexpectedItems,
        weightMismatchItems,
      },
    };
  }
}

export const stockAuditService = new StockAuditService();
