import { prisma } from '../../database';
import { Prisma, ThirdPartyGirviStatus, GirviInterestPeriod } from '../../generated/prisma';
import {
  thirdPartyGirviRepository,
  companyRepository,
  branchRepository,
  customerRepository,
  inventoryItemRepository,
  stockMovementRepository,
} from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreateThirdPartyLenderDTO,
  CreateThirdPartyGirviDTO,
  UpdateThirdPartyGirviDTO,
  CloseThirdPartyGirviDTO,
  CancelThirdPartyGirviDTO,
  CreateThirdPartyCollateralDTO,
  ThirdPartyGirviQueryDTO,
} from './thirdPartyGirvi.types';

export class ThirdPartyGirviService {
  private async generateReferenceNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TPG-${dateStr}-`;

    const count = await client.thirdPartyGirvi.count({
      where: { referenceNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let referenceNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.thirdPartyGirvi.findUnique({ where: { referenceNumber } });
    while (existing) {
      seq++;
      referenceNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.thirdPartyGirvi.findUnique({ where: { referenceNumber } });
    }

    return referenceNumber;
  }

  // ==========================================
  // LENDER MASTER SERVICES
  // ==========================================

  async createLender(dto: CreateThirdPartyLenderDTO) {
    const company = await companyRepository.findById(dto.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (dto.branchId) {
      const branch = await branchRepository.findById(dto.branchId);
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }
    }

    const existing = await thirdPartyGirviRepository.findLenderByCode(dto.companyId, dto.lenderCode);
    if (existing) {
      throw new ConflictError(`Lender with code '${dto.lenderCode}' already exists for this company`);
    }

    return thirdPartyGirviRepository.createLender(dto);
  }

  async getLenderById(id: string) {
    const lender = await thirdPartyGirviRepository.findLenderById(id);
    if (!lender) {
      throw new NotFoundError('Third-party lender not found');
    }
    return lender;
  }

  async listLenders(companyId: string, search?: string) {
    return thirdPartyGirviRepository.findLenders(companyId, search);
  }

  // ==========================================
  // THIRD-PARTY GIRVI SERVICES
  // ==========================================

  async createThirdPartyGirvi(dto: CreateThirdPartyGirviDTO, userId?: string) {
    const company = await companyRepository.findById(dto.companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const branch = await branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    const customer = await customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const lender = await thirdPartyGirviRepository.findLenderById(dto.thirdPartyLenderId);
    if (!lender) {
      throw new NotFoundError('Third-party lender not found');
    }

    // Check external loan number uniqueness for company & lender
    const existingLoan = await prisma.thirdPartyGirvi.findFirst({
      where: {
        companyId: dto.companyId,
        thirdPartyLenderId: dto.thirdPartyLenderId,
        externalLoanNumber: dto.externalLoanNumber,
      },
    });

    if (existingLoan) {
      throw new ConflictError(
        `Third-party Girvi loan with external loan number '${dto.externalLoanNumber}' already exists for this lender`
      );
    }

    if (dto.collaterals && dto.collaterals.length > 0) {
      for (const item of dto.collaterals) {
        if (item.inventoryItemId) {
          const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
          if (!invItem) {
            throw new NotFoundError(`Inventory item not found: ${item.inventoryItemId}`);
          }
        }
      }
    }

    return prisma.$transaction(async (tx) => {
      const referenceNumber = await this.generateReferenceNumber(tx);

      const record = await thirdPartyGirviRepository.createGirvi(
        {
          referenceNumber,
          externalLoanNumber: dto.externalLoanNumber,
          companyId: dto.companyId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          thirdPartyLenderId: dto.thirdPartyLenderId,
          dueDate: dto.dueDate,
          principalAmount: dto.principalAmount,
          valuationAmount: dto.valuationAmount ?? 0,
          interestRate: dto.interestRate ?? 0,
          interestPeriod: dto.interestPeriod,
          notes: dto.notes,
          documentRef: dto.documentRef,
          createdBy: userId,
          collaterals: dto.collaterals,
        },
        tx
      );

      return record;
    });
  }

  async getGirviById(id: string) {
    const record = await thirdPartyGirviRepository.findGirviById(id);
    if (!record) {
      throw new NotFoundError('Third-party Girvi record not found');
    }
    return record;
  }

  async getGirviByRefNumber(referenceNumber: string) {
    const record = await thirdPartyGirviRepository.findGirviByRefNumber(referenceNumber);
    if (!record) {
      throw new NotFoundError('Third-party Girvi record not found');
    }
    return record;
  }

  async listGirvis(query: ThirdPartyGirviQueryDTO) {
    return thirdPartyGirviRepository.findGirvis(query);
  }

  async updateThirdPartyGirvi(id: string, dto: UpdateThirdPartyGirviDTO, userId?: string) {
    const existing = await thirdPartyGirviRepository.findGirviById(id);
    if (!existing) {
      throw new NotFoundError('Third-party Girvi record not found');
    }

    if (existing.status !== ThirdPartyGirviStatus.DRAFT) {
      throw new BadRequestError(`Cannot update third-party Girvi in '${existing.status}' status`);
    }

    return prisma.thirdPartyGirvi.update({
      where: { id },
      data: {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        principalAmount: dto.principalAmount,
        valuationAmount: dto.valuationAmount,
        interestRate: dto.interestRate,
        interestPeriod: dto.interestPeriod,
        notes: dto.notes,
        documentRef: dto.documentRef,
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        lender: true,
        collaterals: true,
      },
    });
  }

  async approveThirdPartyGirvi(id: string, userId?: string) {
    const existing = await thirdPartyGirviRepository.findGirviById(id);
    if (!existing) {
      throw new NotFoundError('Third-party Girvi record not found');
    }

    if (existing.status !== ThirdPartyGirviStatus.DRAFT) {
      throw new BadRequestError('Only draft third-party Girvi records can be approved');
    }

    return prisma.thirdPartyGirvi.update({
      where: { id },
      data: {
        status: ThirdPartyGirviStatus.ACTIVE,
        approvedBy: userId || null,
        approvedAt: new Date(),
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        lender: true,
        collaterals: true,
      },
    });
  }

  async closeThirdPartyGirvi(id: string, dto: CloseThirdPartyGirviDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.thirdPartyGirvi.findUnique({
        where: { id },
        include: { collaterals: true },
      });

      if (!record) {
        throw new NotFoundError('Third-party Girvi record not found');
      }

      if (record.status === ThirdPartyGirviStatus.CLOSED) {
        throw new ConflictError('Third-party Girvi record is already closed');
      }

      if (record.status === ThirdPartyGirviStatus.CANCELLED) {
        throw new BadRequestError('Cannot close a cancelled third-party Girvi record');
      }

      // Release collaterals & restore linked inventory items
      for (const col of record.collaterals) {
        await tx.thirdPartyGirviCollateral.update({
          where: { id: col.id },
          data: {
            isReleased: true,
            releasedAt: new Date(),
          },
        });

        if (col.inventoryItemId) {
          await tx.inventoryItem.update({
            where: { id: col.inventoryItemId },
            data: { status: 'AVAILABLE' },
          });

          await stockMovementRepository.create(
            {
              inventoryItemId: col.inventoryItemId,
              fromBranchId: record.branchId,
              toBranchId: record.branchId,
              movementType: 'THIRD_PARTY_GIRVI_RELEASE',
              referenceType: 'THIRD_PARTY_GIRVI',
              referenceId: record.id,
              remarks: `Third-party collateral '${col.itemName}' released upon closure ${record.referenceNumber}`,
              performedBy: userId,
            },
            tx
          );
        }
      }

      return tx.thirdPartyGirvi.update({
        where: { id },
        data: {
          status: ThirdPartyGirviStatus.CLOSED,
          closedBy: userId || null,
          closedAt: new Date(),
          closureReason: dto.closureReason,
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          lender: true,
          collaterals: true,
        },
      });
    });
  }

  async cancelThirdPartyGirvi(id: string, dto: CancelThirdPartyGirviDTO, userId?: string) {
    const existing = await thirdPartyGirviRepository.findGirviById(id);
    if (!existing) {
      throw new NotFoundError('Third-party Girvi record not found');
    }

    if (existing.status === ThirdPartyGirviStatus.CLOSED) {
      throw new BadRequestError('Cannot cancel a closed third-party Girvi record');
    }

    if (existing.status === ThirdPartyGirviStatus.CANCELLED) {
      throw new BadRequestError('Third-party Girvi record is already cancelled');
    }

    return prisma.thirdPartyGirvi.update({
      where: { id },
      data: {
        status: ThirdPartyGirviStatus.CANCELLED,
        cancelledBy: userId || null,
        cancelledAt: new Date(),
        cancellationReason: dto.cancellationReason,
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        lender: true,
        collaterals: true,
      },
    });
  }

  async addCollateral(thirdPartyGirviId: string, dto: CreateThirdPartyCollateralDTO) {
    const existing = await thirdPartyGirviRepository.findGirviById(thirdPartyGirviId);
    if (!existing) {
      throw new NotFoundError('Third-party Girvi record not found');
    }

    if (existing.status === ThirdPartyGirviStatus.CLOSED || existing.status === ThirdPartyGirviStatus.CANCELLED) {
      throw new BadRequestError(`Cannot add collateral to third-party Girvi in '${existing.status}' status`);
    }

    if (dto.inventoryItemId) {
      const invItem = await inventoryItemRepository.findById(dto.inventoryItemId);
      if (!invItem) {
        throw new NotFoundError(`Inventory item not found: ${dto.inventoryItemId}`);
      }
    }

    return thirdPartyGirviRepository.addCollateral(thirdPartyGirviId, dto);
  }

  async releaseCollateral(collateralId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const col = await tx.thirdPartyGirviCollateral.findUnique({
        where: { id: collateralId },
        include: { thirdPartyGirvi: true },
      });

      if (!col) {
        throw new NotFoundError('Third-party collateral not found');
      }

      if (col.isReleased) {
        throw new ConflictError('Collateral is already released');
      }

      const updatedCol = await tx.thirdPartyGirviCollateral.update({
        where: { id: collateralId },
        data: {
          isReleased: true,
          releasedAt: new Date(),
        },
      });

      if (col.inventoryItemId) {
        await tx.inventoryItem.update({
          where: { id: col.inventoryItemId },
          data: { status: 'AVAILABLE' },
        });

        await stockMovementRepository.create(
          {
            inventoryItemId: col.inventoryItemId,
            fromBranchId: col.thirdPartyGirvi.branchId,
            toBranchId: col.thirdPartyGirvi.branchId,
            movementType: 'THIRD_PARTY_GIRVI_RELEASE',
            referenceType: 'THIRD_PARTY_GIRVI',
            referenceId: col.thirdPartyGirviId,
            remarks: `Collateral '${col.itemName}' released`,
            performedBy: userId,
          },
          tx
        );
      }

      return updatedCol;
    });
  }
}

export const thirdPartyGirviService = new ThirdPartyGirviService();
