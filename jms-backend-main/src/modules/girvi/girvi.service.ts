import { prisma } from '../../database';
import { Prisma, GirviLoanStatus, GirviCollectionStatus, GirviPaymentMethod } from '../../generated/prisma';
import {
  girviLoanRepository,
  girviCollectionRepository,
  girviSettlementRepository,
  stockMovementRepository,
  customerRepository,
  branchRepository,
  companyRepository,
  inventoryItemRepository,
} from '../../repositories';
import { NotFoundError, BadRequestError, ConflictError } from '../../errors';
import {
  CreateGirviLoanDTO,
  UpdateGirviLoanDTO,
  CancelGirviLoanDTO,
  AddCollateralDTO,
  GirviLoanQueryDTO,
  CreateGirviCollectionDTO,
  ReverseGirviCollectionDTO,
  RenewGirviLoanDTO,
  GirviCollectionQueryDTO,
  OverdueLoansQueryDTO,
  SettleGirviLoanDTO,
  GirviSettlementQueryDTO,
} from './girvi.types';


export class GirviService {
  private async generateLoanNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `GL-${dateStr}-`;

    const count = await client.girviLoan.count({
      where: { loanNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let loanNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.girviLoan.findUnique({ where: { loanNumber } });
    while (existing) {
      seq++;
      loanNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.girviLoan.findUnique({ where: { loanNumber } });
    }

    return loanNumber;
  }

  private async generateCollectionNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `COL-${dateStr}-`;

    const count = await client.girviCollection.count({
      where: { collectionNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let collectionNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.girviCollection.findUnique({ where: { collectionNumber } });
    while (existing) {
      seq++;
      collectionNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.girviCollection.findUnique({ where: { collectionNumber } });
    }

    return collectionNumber;
  }

  async createGirviLoan(dto: CreateGirviLoanDTO, userId?: string) {
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
      const loanNumber = await this.generateLoanNumber(tx);

      const loan = await girviLoanRepository.create(
        {
          loanNumber,
          companyId: dto.companyId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          dueDate: dto.dueDate,
          principalAmount: dto.principalAmount,
          valuationAmount: dto.valuationAmount ?? 0,
          interestRate: dto.interestRate ?? 0,
          interestPeriod: dto.interestPeriod,
          notes: dto.notes,
          documentRef: dto.documentRef,
          createdBy: userId,
          status: GirviLoanStatus.ACTIVE,
          collaterals: dto.collaterals,
        },
        tx
      );

      return loan;
    });
  }

  async getGirviLoanById(id: string) {
    const loan = await girviLoanRepository.findById(id);
    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }
    return loan;
  }

  async getGirviLoanByNumber(loanNumber: string) {
    const loan = await girviLoanRepository.findByLoanNumber(loanNumber);
    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }
    return loan;
  }

  async listGirviLoans(query: GirviLoanQueryDTO) {
    return girviLoanRepository.findMany(query);
  }

  async updateGirviLoan(id: string, dto: UpdateGirviLoanDTO, userId?: string) {
    const existing = await girviLoanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Girvi loan not found');
    }

    if (existing.status === GirviLoanStatus.CANCELLED || existing.status === GirviLoanStatus.CLOSED) {
      throw new BadRequestError(`Cannot update loan in ${existing.status} status`);
    }

    return girviLoanRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }

  async approveGirviLoan(id: string, userId?: string) {
    const existing = await girviLoanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Girvi loan not found');
    }

    if (existing.status !== GirviLoanStatus.DRAFT) {
      throw new BadRequestError('Only draft Girvi loans can be approved');
    }

    return prisma.girviLoan.update({
      where: { id },
      data: {
        status: GirviLoanStatus.ACTIVE,
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        collaterals: true,
      },
    });
  }

  async cancelGirviLoan(id: string, dto: CancelGirviLoanDTO, userId?: string) {
    const existing = await girviLoanRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Girvi loan not found');
    }

    if (existing.status === GirviLoanStatus.CLOSED) {
      throw new BadRequestError('Cannot cancel a closed Girvi loan');
    }

    if (existing.status === GirviLoanStatus.CANCELLED) {
      throw new BadRequestError('Girvi loan is already cancelled');
    }

    return prisma.girviLoan.update({
      where: { id },
      data: {
        status: GirviLoanStatus.CANCELLED,
        cancelledBy: userId,
        cancelledAt: new Date(),
        cancellationReason: dto.cancellationReason,
      },
      include: {
        company: true,
        branch: true,
        customer: true,
        collaterals: true,
      },
    });
  }

  async addCollateral(girviLoanId: string, dto: AddCollateralDTO) {
    const existing = await girviLoanRepository.findById(girviLoanId);
    if (!existing) {
      throw new NotFoundError('Girvi loan not found');
    }

    if (existing.status === GirviLoanStatus.CANCELLED || existing.status === GirviLoanStatus.CLOSED) {
      throw new BadRequestError(`Cannot add collateral to loan in ${existing.status} status`);
    }

    if (dto.inventoryItemId) {
      const invItem = await inventoryItemRepository.findById(dto.inventoryItemId);
      if (!invItem) {
        throw new NotFoundError(`Inventory item not found: ${dto.inventoryItemId}`);
      }
    }

    return girviLoanRepository.addCollateral(girviLoanId, dto);
  }

  // ==========================================
  // PHASE 6.2: INTEREST ENGINE & FINANCIAL SUMMARY
  // ==========================================

  /**
   * Calculates accrued interest and real-time financial balance for a Girvi loan.
   */
  async getLoanFinancialSummary(id: string, asOfDate: Date = new Date(), tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const loan = await client.girviLoan.findUnique({
      where: { id },
      include: {
        customer: true,
        branch: true,
      },
    });

    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }

    // 1. Fetch all COMPLETED collections for this loan
    const collections = await client.girviCollection.findMany({
      where: {
        girviLoanId: id,
        status: GirviCollectionStatus.COMPLETED,
      },
      orderBy: { collectionDate: 'asc' },
    });

    // 2. Sum collected principal and interest using Decimal
    let collectedPrincipal = new Prisma.Decimal(0);
    let collectedInterest = new Prisma.Decimal(0);
    let lastPaymentDate: Date | null = null;

    for (const col of collections) {
      collectedPrincipal = collectedPrincipal.add(new Prisma.Decimal(col.principalAmount));
      collectedInterest = collectedInterest.add(new Prisma.Decimal(col.interestAmount));
      if (!lastPaymentDate || col.collectionDate > lastPaymentDate) {
        lastPaymentDate = col.collectionDate;
      }
    }

    const principal = new Prisma.Decimal(loan.principalAmount);
    const principalOutstanding = Prisma.Decimal.max(0, principal.sub(collectedPrincipal)).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP
    );

    // 3. Accrued Interest Calculation
    const rate = new Prisma.Decimal(loan.interestRate);
    const isMonthly = loan.interestPeriod === 'MONTHLY';
    const divisor = isMonthly ? new Prisma.Decimal(30) : new Prisma.Decimal(365);
    const dailyRate = rate.div(100).div(divisor);

    const loanStartDate = new Date(loan.loanDate);
    const targetDate = new Date(asOfDate);
    const diffMs = Math.max(0, targetDate.getTime() - loanStartDate.getTime());
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Interest accrued on principal amount
    const accruedInterest = principal
      .mul(dailyRate)
      .mul(daysElapsed)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    const interestOutstanding = Prisma.Decimal.max(0, accruedInterest.sub(collectedInterest)).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP
    );

    const totalOutstanding = principalOutstanding
      .add(interestOutstanding)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    // 4. Overdue calculation
    const dueDate = new Date(loan.dueDate);
    const overdueMs = Math.max(0, targetDate.getTime() - dueDate.getTime());
    const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
    const isOverdue = overdueDays > 0;

    return {
      loanId: loan.id,
      loanNumber: loan.loanNumber,
      status: loan.status,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      principalAmount: loan.principalAmount,
      interestRate: loan.interestRate,
      interestPeriod: loan.interestPeriod,
      daysElapsed,
      principalOutstanding: principalOutstanding.toNumber(),
      accruedInterest: accruedInterest.toNumber(),
      collectedPrincipal: collectedPrincipal.toNumber(),
      collectedInterest: collectedInterest.toNumber(),
      interestOutstanding: interestOutstanding.toNumber(),
      totalOutstanding: totalOutstanding.toNumber(),
      lastPaymentDate,
      isOverdue,
      overdueDays,
    };
  }

  // ==========================================
  // PHASE 6.2: GIRVI COLLECTIONS (PAYMENT LEDGER)
  // ==========================================

  /**
   * Records an atomic payment collection against a Girvi loan.
   */
  async createCollection(dto: CreateGirviCollectionDTO, receivedByUserId?: string) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.girviLoan.findUnique({
        where: { id: dto.girviLoanId },
      });

      if (!loan) {
        throw new NotFoundError('Girvi loan not found');
      }

      if (loan.status === GirviLoanStatus.CANCELLED) {
        throw new BadRequestError('Cannot record collection for a cancelled loan');
      }

      if (loan.status === GirviLoanStatus.CLOSED) {
        throw new BadRequestError('Cannot record collection for a closed loan');
      }

      const totalAmount = new Prisma.Decimal(dto.amount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (totalAmount.lte(0)) {
        throw new BadRequestError('Collection amount must be greater than 0');
      }

      const summary = await this.getLoanFinancialSummary(dto.girviLoanId, new Date(), tx);

      let interestPart: Prisma.Decimal;
      let principalPart: Prisma.Decimal;

      if (dto.interestAmount !== undefined && dto.principalAmount !== undefined) {
        interestPart = new Prisma.Decimal(dto.interestAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        principalPart = new Prisma.Decimal(dto.principalAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

        const sumParts = interestPart.add(principalPart).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        if (!sumParts.equals(totalAmount)) {
          throw new BadRequestError(
            `Collection amount ₹${totalAmount.toFixed(2)} does not equal Interest ₹${interestPart.toFixed(2)} + Principal ₹${principalPart.toFixed(2)}`
          );
        }
      } else {
        // Deterministic allocation: Interest first, then Principal
        const interestOwed = new Prisma.Decimal(summary.interestOutstanding);
        interestPart = Prisma.Decimal.min(totalAmount, interestOwed).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        principalPart = totalAmount.sub(interestPart).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      }

      // Over-collection protection guards
      const currentPrincipalOutstanding = new Prisma.Decimal(summary.principalOutstanding);
      if (principalPart.gt(currentPrincipalOutstanding)) {
        throw new ConflictError(
          `Principal collection component ₹${principalPart.toFixed(2)} exceeds remaining principal outstanding ₹${currentPrincipalOutstanding.toFixed(2)}`
        );
      }

      const currentTotalOutstanding = new Prisma.Decimal(summary.totalOutstanding);
      if (totalAmount.gt(currentTotalOutstanding)) {
        throw new ConflictError(
          `Total collection amount ₹${totalAmount.toFixed(2)} exceeds total outstanding amount ₹${currentTotalOutstanding.toFixed(2)}`
        );
      }

      const collectionNumber = await this.generateCollectionNumber(tx);

      const collection = await girviCollectionRepository.create(
        {
          collectionNumber,
          girviLoanId: dto.girviLoanId,
          paymentMethod: dto.paymentMethod,
          amount: totalAmount,
          principalAmount: principalPart,
          interestAmount: interestPart,
          transactionReference: dto.transactionReference,
          collectionDate: dto.collectionDate,
          receivedBy: receivedByUserId,
          remarks: dto.remarks,
        },
        tx
      );

      return collection;
    });
  }

  async getCollectionById(id: string) {
    const collection = await girviCollectionRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Girvi collection not found');
    }
    return collection;
  }

  async listCollections(query: GirviCollectionQueryDTO) {
    return girviCollectionRepository.findMany(query);
  }

  async getLoanCollectionHistory(girviLoanId: string) {
    const loan = await girviLoanRepository.findById(girviLoanId);
    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }
    return girviCollectionRepository.findMany({ girviLoanId, limit: 100 });
  }

  /**
   * Reverses an existing Girvi collection atomically with mandatory reason.
   */
  async reverseCollection(id: string, dto: ReverseGirviCollectionDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const collection = await girviCollectionRepository.findById(id, tx);
      if (!collection) {
        throw new NotFoundError('Girvi collection not found');
      }

      if (collection.status === GirviCollectionStatus.REVERSED) {
        throw new BadRequestError('Girvi collection is already reversed');
      }

      if (!dto.reversalReason || dto.reversalReason.trim().length < 3) {
        throw new BadRequestError('A valid reversal reason must be provided');
      }

      return girviCollectionRepository.reverseCollection(id, dto.reversalReason, userId, tx);
    });
  }

  // ==========================================
  // PHASE 6.2: LOAN RENEWAL & OVERDUE LISTING
  // ==========================================

  /**
   * Renews an active/overdue Girvi loan and logs an immutable GirviRenewal audit record.
   */
  async renewGirviLoan(girviLoanId: string, dto: RenewGirviLoanDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.girviLoan.findUnique({
        where: { id: girviLoanId },
      });

      if (!loan) {
        throw new NotFoundError('Girvi loan not found');
      }

      if (loan.status === GirviLoanStatus.CANCELLED || loan.status === GirviLoanStatus.CLOSED) {
        throw new BadRequestError(`Cannot renew a loan in ${loan.status} status`);
      }

      const newDueDate = new Date(dto.newDueDate);
      if (newDueDate <= new Date(loan.dueDate)) {
        throw new BadRequestError('New due date must be after current due date');
      }

      const summary = await this.getLoanFinancialSummary(girviLoanId, new Date(), tx);

      // Create immutable renewal audit entry
      await tx.girviRenewal.create({
        data: {
          girviLoanId,
          previousDueDate: loan.dueDate,
          newDueDate,
          accruedInterestAtRenewal: summary.accruedInterest,
          principalAtRenewal: summary.principalOutstanding,
          interestPaidAtRenewal: summary.collectedInterest,
          renewedBy: userId || null,
          remarks: dto.remarks || null,
        },
      });

      // Extend due date and set status to RENEWED
      return tx.girviLoan.update({
        where: { id: girviLoanId },
        data: {
          dueDate: newDueDate,
          status: GirviLoanStatus.RENEWED,
          updatedBy: userId || null,
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          collaterals: true,
          renewals: true,
        },
      });
    });
  }

  /**
   * Returns overdue and due-soon Girvi loans with financial summaries.
   */
  async listOverdueLoans(query: OverdueLoansQueryDTO) {
    const { page = 1, limit = 20, branchId, companyId, daysThreshold } = query;
    const where: Prisma.GirviLoanWhereInput = {
      status: { in: [GirviLoanStatus.ACTIVE, GirviLoanStatus.RENEWED] },
    };

    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;

    const skip = (page - 1) * limit;

    const [loans, total] = await Promise.all([
      prisma.girviLoan.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: true,
          branch: true,
          customer: true,
          collaterals: true,
        },
      }),
      prisma.girviLoan.count({ where }),
    ]);

    const now = new Date();
    const results = [];

    for (const loan of loans) {
      const summary = await this.getLoanFinancialSummary(loan.id, now);
      if (summary.isOverdue || (daysThreshold && summary.overdueDays >= -daysThreshold)) {
        results.push({
          ...loan,
          financialSummary: summary,
        });
      }
    }

    return {
      items: results,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    };
  }

  // ==========================================
  // PHASE 6.3: SETTLEMENT & JEWELLERY RELEASE
  // ==========================================

  private async generateSettlementNumber(tx?: Prisma.TransactionClient): Promise<string> {
    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `SETTLE-${dateStr}-`;

    const count = await client.girviSettlement.count({
      where: { settlementNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let settlementNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.girviSettlement.findUnique({ where: { settlementNumber } });
    while (existing) {
      seq++;
      settlementNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.girviSettlement.findUnique({ where: { settlementNumber } });
    }

    return settlementNumber;
  }

  /**
   * Settles a Girvi loan, records settlement payment, releases pledged jewellery, creates StockMovements, and closes loan atomically.
   */
  async settleGirviLoan(girviLoanId: string, dto: SettleGirviLoanDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.girviLoan.findUnique({
        where: { id: girviLoanId },
        include: {
          collaterals: true,
          settlement: true,
        },
      });

      if (!loan) {
        throw new NotFoundError('Girvi loan not found');
      }

      if (loan.status === GirviLoanStatus.CANCELLED) {
        throw new BadRequestError('Cannot settle a cancelled Girvi loan');
      }

      if (loan.status === GirviLoanStatus.CLOSED || loan.settlement) {
        throw new ConflictError('Girvi loan is already closed/settled');
      }

      // Calculate authoritative financial summary inside transaction
      const summary = await this.getLoanFinancialSummary(girviLoanId, new Date(), tx);

      const principalOwed = new Prisma.Decimal(summary.principalOutstanding);
      const interestOwed = new Prisma.Decimal(summary.interestOutstanding);
      const totalOwed = new Prisma.Decimal(summary.totalOutstanding);

      let principalSettled: Prisma.Decimal;
      let interestSettled: Prisma.Decimal;
      let totalSettlementAmount: Prisma.Decimal;

      if (dto.totalSettlementAmount !== undefined) {
        totalSettlementAmount = new Prisma.Decimal(dto.totalSettlementAmount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        if (!totalSettlementAmount.equals(totalOwed)) {
          throw new BadRequestError(
            `Specified settlement amount ₹${totalSettlementAmount.toFixed(2)} does not equal total outstanding amount ₹${totalOwed.toFixed(2)}`
          );
        }
      } else {
        totalSettlementAmount = totalOwed;
      }

      if (dto.principalSettled !== undefined && dto.interestSettled !== undefined) {
        principalSettled = new Prisma.Decimal(dto.principalSettled).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        interestSettled = new Prisma.Decimal(dto.interestSettled).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

        if (!principalSettled.equals(principalOwed)) {
          throw new BadRequestError(
            `Principal settled component ₹${principalSettled.toFixed(2)} must equal principal outstanding ₹${principalOwed.toFixed(2)}`
          );
        }

        if (!interestSettled.equals(interestOwed)) {
          throw new BadRequestError(
            `Interest settled component ₹${interestSettled.toFixed(2)} must equal interest outstanding ₹${interestOwed.toFixed(2)}`
          );
        }
      } else {
        principalSettled = principalOwed;
        interestSettled = interestOwed;
      }

      // Record settlement payment collection if amount > 0
      if (totalSettlementAmount.gt(0)) {
        const collectionNumber = await this.generateCollectionNumber(tx);
        await girviCollectionRepository.create(
          {
            collectionNumber,
            girviLoanId,
            paymentMethod: dto.paymentMethod,
            amount: totalSettlementAmount,
            principalAmount: principalSettled,
            interestAmount: interestSettled,
            transactionReference: dto.transactionReference,
            collectionDate: dto.settlementDate,
            receivedBy: userId,
            remarks: dto.remarks || 'Full settlement payment',
          },
          tx
        );
      }

      // Generate Settlement Number
      const settlementNumber = await this.generateSettlementNumber(tx);

      // Create GirviSettlement Record
      const settlement = await girviSettlementRepository.create(
        {
          settlementNumber,
          girviLoanId,
          paymentMethod: dto.paymentMethod,
          totalSettlementAmount,
          principalSettled,
          interestSettled,
          transactionReference: dto.transactionReference,
          settlementDate: dto.settlementDate,
          remarks: dto.remarks,
          settledBy: userId,
        },
        tx
      );

      // Release Pledged Collaterals & Create Stock Movements
      for (const col of loan.collaterals) {
        await tx.girviCollateral.update({
          where: { id: col.id },
          data: {
            isReleased: true,
            releasedAt: new Date(),
          },
        });

        if (col.inventoryItemId) {
          // Restore linked InventoryItem status to AVAILABLE
          await tx.inventoryItem.update({
            where: { id: col.inventoryItemId },
            data: { status: 'AVAILABLE' },
          });

          // Record immutable StockMovement for collateral release
          await stockMovementRepository.create(
            {
              inventoryItemId: col.inventoryItemId,
              fromBranchId: loan.branchId,
              toBranchId: loan.branchId,
              movementType: 'GIRVI_RELEASE',
              referenceType: 'GIRVI_SETTLEMENT',
              referenceId: settlement.id,
              remarks: `Collateral '${col.itemName}' released upon full Girvi settlement ${settlementNumber}`,
              performedBy: userId,
            },
            tx
          );
        }
      }

      // Update Girvi Loan status to CLOSED
      await tx.girviLoan.update({
        where: { id: girviLoanId },
        data: {
          status: GirviLoanStatus.CLOSED,
          closedAt: new Date(),
          closedBy: userId || null,
        },
      });

      return girviSettlementRepository.findById(settlement.id, tx);
    });
  }

  async getSettlementById(id: string) {
    const settlement = await girviSettlementRepository.findById(id);
    if (!settlement) {
      throw new NotFoundError('Girvi settlement not found');
    }
    return settlement;
  }

  async getLoanSettlement(girviLoanId: string) {
    const loan = await girviLoanRepository.findById(girviLoanId);
    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }
    const settlement = await girviSettlementRepository.findByLoanId(girviLoanId);
    if (!settlement) {
      throw new NotFoundError('No settlement found for this Girvi loan');
    }
    return settlement;
  }

  async listSettlements(query: GirviSettlementQueryDTO) {
    return girviSettlementRepository.findMany(query);
  }

  async getReleasedCollateral(girviLoanId: string) {
    const loan = await girviLoanRepository.findById(girviLoanId);
    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }

    const collaterals = await prisma.girviCollateral.findMany({
      where: {
        girviLoanId,
        isReleased: true,
      },
      include: {
        inventoryItem: true,
      },
    });

    return collaterals;
  }

  // ==========================================
  // PHASE 6.5: REPORTS, ANALYTICS & AUDIT TRAIL
  // ==========================================

  /**
   * Returns a 360-degree chronological audit trail for a Girvi loan covering creation, approval, collection, reversal, renewal, settlement, and collateral release.
   */
  async getGirviAuditTrail(girviLoanId: string, sortOrder: 'asc' | 'desc' = 'asc') {
    const loan = await prisma.girviLoan.findUnique({
      where: { id: girviLoanId },
      include: {
        customer: true,
        branch: true,
        collaterals: { include: { inventoryItem: true } },
        collections: true,
        renewals: true,
        settlement: true,
      },
    });

    if (!loan) {
      throw new NotFoundError('Girvi loan not found');
    }

    const events: Array<{
      eventType: string;
      timestamp: Date;
      description: string;
      performedBy?: string | null;
      details: any;
    }> = [];

    // 1. Creation Event
    events.push({
      eventType: 'LOAN_CREATED',
      timestamp: loan.createdAt,
      description: `Girvi loan ${loan.loanNumber} created with principal ₹${loan.principalAmount}`,
      performedBy: loan.createdBy,
      details: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        interestPeriod: loan.interestPeriod,
        dueDate: loan.dueDate,
      },
    });

    // 2. Approval Event
    if (loan.approvedAt) {
      events.push({
        eventType: 'LOAN_APPROVED',
        timestamp: loan.approvedAt,
        description: `Girvi loan ${loan.loanNumber} approved and activated`,
        performedBy: loan.approvedBy,
        details: { status: 'ACTIVE' },
      });
    }

    // 3. Collection & Reversal Events
    for (const col of loan.collections) {
      events.push({
        eventType: 'COLLECTION_RECEIVED',
        timestamp: col.collectionDate,
        description: `Collection ${col.collectionNumber} received (₹${col.amount} via ${col.paymentMethod})`,
        performedBy: col.receivedBy,
        details: {
          collectionNumber: col.collectionNumber,
          amount: col.amount,
          principalAmount: col.principalAmount,
          interestAmount: col.interestAmount,
          paymentMethod: col.paymentMethod,
          status: col.status,
        },
      });

      if (col.status === GirviCollectionStatus.REVERSED && col.reversedAt) {
        events.push({
          eventType: 'COLLECTION_REVERSED',
          timestamp: col.reversedAt,
          description: `Collection ${col.collectionNumber} reversed: ${col.reversalReason}`,
          performedBy: col.reversedBy,
          details: {
            collectionNumber: col.collectionNumber,
            reversalReason: col.reversalReason,
          },
        });
      }
    }

    // 4. Renewal Events
    for (const ren of loan.renewals) {
      events.push({
        eventType: 'LOAN_RENEWED',
        timestamp: ren.createdAt,
        description: `Loan renewed. Extended due date to ${ren.newDueDate.toISOString().slice(0, 10)}`,
        performedBy: ren.renewedBy,
        details: {
          previousDueDate: ren.previousDueDate,
          newDueDate: ren.newDueDate,
          accruedInterestAtRenewal: ren.accruedInterestAtRenewal,
        },
      });
    }

    // 5. Settlement Event
    if (loan.settlement) {
      events.push({
        eventType: 'LOAN_SETTLED',
        timestamp: loan.settlement.settlementDate,
        description: `Girvi loan settled in full (Settlement #${loan.settlement.settlementNumber})`,
        performedBy: loan.settlement.settledBy,
        details: {
          settlementNumber: loan.settlement.settlementNumber,
          totalSettlementAmount: loan.settlement.totalSettlementAmount,
          principalSettled: loan.settlement.principalSettled,
          interestSettled: loan.settlement.interestSettled,
          paymentMethod: loan.settlement.paymentMethod,
        },
      });
    }

    // 6. Collateral Release Events
    for (const col of loan.collaterals) {
      if (col.isReleased && col.releasedAt) {
        events.push({
          eventType: 'COLLATERAL_RELEASED',
          timestamp: col.releasedAt,
          description: `Collateral '${col.itemName}' released to customer`,
          performedBy: loan.closedBy || loan.settlement?.settledBy,
          details: {
            collateralId: col.id,
            itemName: col.itemName,
            inventoryItemId: col.inventoryItemId,
            netWeight: col.netWeight,
          },
        });
      }
    }

    // 7. Cancellation Event
    if (loan.cancelledAt) {
      events.push({
        eventType: 'LOAN_CANCELLED',
        timestamp: loan.cancelledAt,
        description: `Girvi loan cancelled: ${loan.cancellationReason}`,
        performedBy: loan.cancelledBy,
        details: { cancellationReason: loan.cancellationReason },
      });
    }

    // Sort events
    events.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return {
      loanId: loan.id,
      loanNumber: loan.loanNumber,
      status: loan.status,
      customerName: `${loan.customer.firstName} ${loan.customer.lastName || ''}`.trim(),
      customerMobile: loan.customer.mobile,
      totalEvents: events.length,
      events,
    };
  }

  /**
   * Generates comprehensive portfolio financial analytics report for Self Girvi loans.
   */
  async getGirviPortfolioReport(companyId?: string, branchId?: string) {
    const where: Prisma.GirviLoanWhereInput = {};
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;

    const loans = await prisma.girviLoan.findMany({
      where,
      include: { collaterals: true },
    });

    const now = new Date();
    let totalLoansCount = loans.length;
    let activeLoansCount = 0;
    let closedLoansCount = 0;
    let totalPrincipalIssued = new Prisma.Decimal(0);
    let totalPrincipalOutstanding = new Prisma.Decimal(0);
    let totalAccruedInterest = new Prisma.Decimal(0);
    let totalCollectedInterest = new Prisma.Decimal(0);
    let totalCollectedPrincipal = new Prisma.Decimal(0);
    let totalInterestOutstanding = new Prisma.Decimal(0);
    let totalPortfolioOutstanding = new Prisma.Decimal(0);

    for (const loan of loans) {
      totalPrincipalIssued = totalPrincipalIssued.add(new Prisma.Decimal(loan.principalAmount));
      if (loan.status === GirviLoanStatus.CLOSED) {
        closedLoansCount++;
      } else if (loan.status === GirviLoanStatus.ACTIVE || loan.status === GirviLoanStatus.RENEWED) {
        activeLoansCount++;
      }

      const summary = await this.getLoanFinancialSummary(loan.id, now);
      totalPrincipalOutstanding = totalPrincipalOutstanding.add(new Prisma.Decimal(summary.principalOutstanding));
      totalAccruedInterest = totalAccruedInterest.add(new Prisma.Decimal(summary.accruedInterest));
      totalCollectedInterest = totalCollectedInterest.add(new Prisma.Decimal(summary.collectedInterest));
      totalCollectedPrincipal = totalCollectedPrincipal.add(new Prisma.Decimal(summary.collectedPrincipal));
      totalInterestOutstanding = totalInterestOutstanding.add(new Prisma.Decimal(summary.interestOutstanding));
      totalPortfolioOutstanding = totalPortfolioOutstanding.add(new Prisma.Decimal(summary.totalOutstanding));
    }

    return {
      totalLoansCount,
      activeLoansCount,
      closedLoansCount,
      totalPrincipalIssued: totalPrincipalIssued.toNumber(),
      totalPrincipalOutstanding: totalPrincipalOutstanding.toNumber(),
      totalAccruedInterest: totalAccruedInterest.toNumber(),
      totalCollectedInterest: totalCollectedInterest.toNumber(),
      totalCollectedPrincipal: totalCollectedPrincipal.toNumber(),
      totalInterestOutstanding: totalInterestOutstanding.toNumber(),
      totalPortfolioOutstanding: totalPortfolioOutstanding.toNumber(),
    };
  }

  /**
   * Generates overdue aging analysis report (0-30 days, 31-60 days, 61-90 days, 90+ days overdue).
   */
  async getGirviOverdueAgingReport(companyId?: string, branchId?: string) {
    const where: Prisma.GirviLoanWhereInput = {
      status: { in: [GirviLoanStatus.ACTIVE, GirviLoanStatus.RENEWED] },
    };
    if (companyId) where.companyId = companyId;
    if (branchId) where.branchId = branchId;

    const loans = await prisma.girviLoan.findMany({ where });

    const buckets = {
      current: { count: 0, totalOutstanding: new Prisma.Decimal(0) },
      days1To30: { count: 0, totalOutstanding: new Prisma.Decimal(0) },
      days31To60: { count: 0, totalOutstanding: new Prisma.Decimal(0) },
      days61To90: { count: 0, totalOutstanding: new Prisma.Decimal(0) },
      days90Plus: { count: 0, totalOutstanding: new Prisma.Decimal(0) },
    };

    const now = new Date();

    for (const loan of loans) {
      const summary = await this.getLoanFinancialSummary(loan.id, now);
      const outstanding = new Prisma.Decimal(summary.totalOutstanding);

      if (!summary.isOverdue || summary.overdueDays <= 0) {
        buckets.current.count++;
        buckets.current.totalOutstanding = buckets.current.totalOutstanding.add(outstanding);
      } else if (summary.overdueDays <= 30) {
        buckets.days1To30.count++;
        buckets.days1To30.totalOutstanding = buckets.days1To30.totalOutstanding.add(outstanding);
      } else if (summary.overdueDays <= 60) {
        buckets.days31To60.count++;
        buckets.days31To60.totalOutstanding = buckets.days31To60.totalOutstanding.add(outstanding);
      } else if (summary.overdueDays <= 90) {
        buckets.days61To90.count++;
        buckets.days61To90.totalOutstanding = buckets.days61To90.totalOutstanding.add(outstanding);
      } else {
        buckets.days90Plus.count++;
        buckets.days90Plus.totalOutstanding = buckets.days90Plus.totalOutstanding.add(outstanding);
      }
    }

    return {
      current: { count: buckets.current.count, totalOutstanding: buckets.current.totalOutstanding.toNumber() },
      days1To30: { count: buckets.days1To30.count, totalOutstanding: buckets.days1To30.totalOutstanding.toNumber() },
      days31To60: { count: buckets.days31To60.count, totalOutstanding: buckets.days31To60.totalOutstanding.toNumber() },
      days61To90: { count: buckets.days61To90.count, totalOutstanding: buckets.days61To90.totalOutstanding.toNumber() },
      days90Plus: { count: buckets.days90Plus.count, totalOutstanding: buckets.days90Plus.totalOutstanding.toNumber() },
    };
  }
}

export const girviService = new GirviService();


