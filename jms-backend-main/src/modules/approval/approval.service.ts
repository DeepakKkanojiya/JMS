import { prisma } from '../../database';
import { Prisma, ApprovalStatus, ApprovalItemStatus, PaymentMethod, PaymentStatus } from '../../generated/prisma';
import {
  approvalRepository,
  approvalDepositRepository,
  companyRepository,
  branchRepository,
  customerRepository,
  employeeRepository,
  inventoryItemRepository,
  documentSeriesRepository,
} from '../../repositories';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../../errors';
import {
  CreateApprovalDTO,
  UpdateApprovalDTO,
  ApprovalQueryDTO,
  CreateApprovalDepositDTO,
  ReverseApprovalDepositDTO,
  ApprovalDepositQueryDTO,
  ApprovalDepositSummary,
  DepositSummaryStatus,
  ReturnApprovalDTO,
  PurchaseApprovalDTO,
} from './approval.types';

export class ApprovalService {
  private async generateApprovalNumber(companyId: string, branchId: string, tx?: Prisma.TransactionClient): Promise<string> {
    try {
      const docNum = await documentSeriesRepository.getNextNumber({
        companyId,
        branchId,
        documentType: 'APPROVAL',
        prefix: 'APP',
      });
      if (docNum) return docNum;
    } catch (e) {
      // Fallback generator
    }

    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `APP-${dateStr}-`;

    const count = await client.approval.count({
      where: { companyId, approvalNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let approvalNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.approval.findFirst({ where: { companyId, approvalNumber } });
    while (existing) {
      seq++;
      approvalNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.approval.findFirst({ where: { companyId, approvalNumber } });
    }

    return approvalNumber;
  }

  private async generateDepositNumber(companyId: string, branchId: string, tx?: Prisma.TransactionClient): Promise<string> {
    try {
      const docNum = await documentSeriesRepository.getNextNumber({
        companyId,
        branchId,
        documentType: 'APPROVAL_DEPOSIT',
        prefix: 'DEP',
      });
      if (docNum) return docNum;
    } catch (e) {
      // Fallback
    }

    const client = tx || prisma;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `DEP-${dateStr}-`;

    const count = await client.approvalDeposit.count({
      where: { companyId, depositNumber: { startsWith: prefix } },
    });

    let seq = count + 1;
    let depositNumber = `${prefix}${seq.toString().padStart(4, '0')}`;

    let existing = await client.approvalDeposit.findFirst({ where: { companyId, depositNumber } });
    while (existing) {
      seq++;
      depositNumber = `${prefix}${seq.toString().padStart(4, '0')}`;
      existing = await client.approvalDeposit.findFirst({ where: { companyId, depositNumber } });
    }

    return depositNumber;
  }

  async createApproval(dto: CreateApprovalDTO) {
    // 1. Company validation
    const company = await companyRepository.findById(dto.companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${dto.companyId} not found`);
    }

    // 2. Branch validation
    const branch = await branchRepository.findById(dto.branchId);
    if (!branch || branch.companyId !== dto.companyId) {
      throw new BadRequestError(`Invalid branch or branch does not belong to company`);
    }

    // 3. Customer validation
    const customer = await customerRepository.findById(dto.customerId);
    if (!customer || customer.companyId !== dto.companyId) {
      throw new BadRequestError(`Customer does not exist or belongs to another company`);
    }

    // 4. Salesperson validation
    if (dto.salespersonId) {
      const salesperson = await employeeRepository.findById(dto.salespersonId);
      if (!salesperson || salesperson.companyId !== dto.companyId) {
        throw new BadRequestError(`Salesperson does not exist or belongs to another company`);
      }
    }

    // 5. Date validation
    const issueDate = new Date();
    const dueDate = new Date(dto.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestError(`Invalid due date format`);
    }
    if (dueDate.getTime() < issueDate.getTime() - 86400000) {
      throw new BadRequestError(`Due date cannot be earlier than issue date`);
    }

    // 6. Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError(`At least one approval item is required`);
    }

    let calculatedTotalAmount = 0;
    let calculatedTotalQty = 0;
    const validatedItemsData: {
      inventoryItemId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes?: string;
    }[] = [];

    for (const item of dto.items) {
      const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
      if (!invItem || invItem.companyId !== dto.companyId) {
        throw new BadRequestError(`Inventory item ${item.inventoryItemId} not found or belongs to another company`);
      }
      if (invItem.branchId !== dto.branchId) {
        throw new BadRequestError(`Inventory item ${invItem.itemCode} does not belong to branch ${branch.name}`);
      }

      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : 0;
      const totalPrice = qty * unitPrice;

      calculatedTotalAmount += totalPrice;
      calculatedTotalQty += qty;

      validatedItemsData.push({
        inventoryItemId: item.inventoryItemId,
        quantity: qty,
        unitPrice,
        totalPrice,
        notes: item.notes,
      });
    }

    const requiredDepositAmount = dto.requiredDepositAmount !== undefined ? Number(dto.requiredDepositAmount) : 0.0;

    // 7. Execute Prisma Transaction
    return prisma.$transaction(async (tx) => {
      const approvalNumber = await this.generateApprovalNumber(dto.companyId, dto.branchId, tx);

      const approval = await tx.approval.create({
        data: {
          approvalNumber,
          companyId: dto.companyId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          salespersonId: dto.salespersonId || null,
          issueDate,
          dueDate,
          status: ApprovalStatus.DRAFT,
          notes: dto.notes || null,
          totalAmount: calculatedTotalAmount,
          totalQuantity: calculatedTotalQty,
          requiredDepositAmount,
          createdBy: dto.createdBy || null,
          items: {
            create: validatedItemsData.map((it) => ({
              inventoryItemId: it.inventoryItemId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              totalPrice: it.totalPrice,
              status: ApprovalItemStatus.ISSUED,
              notes: it.notes || null,
            })),
          },
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: {
            include: {
              inventoryItem: {
                include: {
                  product: true,
                  tags: true,
                },
              },
            },
          },
        },
      });

      return approval;
    });
  }

  async getApprovalById(id: string, userCompanyId?: string) {
    const approval = await approvalRepository.findById(id);
    if (!approval) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && approval.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    return approval;
  }

  async listApprovals(params: ApprovalQueryDTO) {
    return approvalRepository.findMany(params);
  }

  async updateApproval(id: string, dto: UpdateApprovalDTO, userCompanyId?: string) {
    const existing = await approvalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && existing.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    if (existing.status !== ApprovalStatus.DRAFT) {
      throw new BadRequestError(`Cannot edit approval in ${existing.status} status. Only DRAFT approvals can be updated`);
    }

    if (dto.customerId) {
      const customer = await customerRepository.findById(dto.customerId);
      if (!customer || customer.companyId !== existing.companyId) {
        throw new BadRequestError(`Customer does not exist or belongs to another company`);
      }
    }

    if (dto.salespersonId) {
      const salesperson = await employeeRepository.findById(dto.salespersonId);
      if (!salesperson || salesperson.companyId !== existing.companyId) {
        throw new BadRequestError(`Salesperson does not exist or belongs to another company`);
      }
    }

    if (dto.dueDate) {
      const dueDate = new Date(dto.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new BadRequestError(`Invalid due date format`);
      }
      if (dueDate.getTime() < existing.issueDate.getTime() - 86400000) {
        throw new BadRequestError(`Due date cannot be earlier than issue date`);
      }
    }

    return prisma.$transaction(async (tx) => {
      let calculatedTotalAmount = Number(existing.totalAmount);
      let calculatedTotalQty = existing.totalQuantity;

      if (dto.items) {
        await tx.approvalItem.deleteMany({ where: { approvalId: id } });

        calculatedTotalAmount = 0;
        calculatedTotalQty = 0;

        for (const item of dto.items) {
          const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
          if (!invItem || invItem.companyId !== existing.companyId) {
            throw new BadRequestError(`Inventory item ${item.inventoryItemId} not found or belongs to another company`);
          }
          if (invItem.branchId !== existing.branchId) {
            throw new BadRequestError(`Inventory item ${invItem.itemCode} does not belong to branch`);
          }

          const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
          const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : 0;
          const totalPrice = qty * unitPrice;

          calculatedTotalAmount += totalPrice;
          calculatedTotalQty += qty;

          await tx.approvalItem.create({
            data: {
              approvalId: id,
              inventoryItemId: item.inventoryItemId,
              quantity: qty,
              unitPrice,
              totalPrice,
              status: ApprovalItemStatus.ISSUED,
              notes: item.notes || null,
            },
          });
        }
      }

      const updated = await tx.approval.update({
        where: { id },
        data: {
          customerId: dto.customerId || undefined,
          salespersonId: dto.salespersonId !== undefined ? (dto.salespersonId || null) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          notes: dto.notes !== undefined ? (dto.notes || null) : undefined,
          requiredDepositAmount: dto.requiredDepositAmount !== undefined ? Number(dto.requiredDepositAmount) : undefined,
          totalAmount: calculatedTotalAmount,
          totalQuantity: calculatedTotalQty,
          updatedBy: dto.updatedBy || null,
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: {
            include: {
              inventoryItem: {
                include: {
                  product: true,
                  tags: true,
                },
              },
            },
          },
        },
      });

      return updated;
    });
  }

  async issueApproval(id: string, userCompanyId?: string, userId?: string) {
    const existing = await approvalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && existing.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    if (existing.status !== ApprovalStatus.DRAFT) {
      throw new BadRequestError(`Approval #${existing.approvalNumber} cannot be issued because its current status is '${existing.status}'`);
    }

    if (!existing.items || existing.items.length === 0) {
      throw new BadRequestError(`Approval #${existing.approvalNumber} has no items to issue`);
    }

    // Duplicate item check within the approval
    const itemIds = existing.items.map((it) => it.inventoryItemId);
    const uniqueItemIds = new Set(itemIds);
    if (uniqueItemIds.size !== itemIds.length) {
      throw new BadRequestError(`Duplicate inventory items found in approval #${existing.approvalNumber}`);
    }

    // Pre-transaction validation of item company, branch, status, and active approval references
    for (const item of existing.items) {
      const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
      if (!invItem) {
        throw new NotFoundError(`Inventory item with ID '${item.inventoryItemId}' not found`);
      }
      if (invItem.companyId !== existing.companyId) {
        throw new BadRequestError(`Inventory item '${invItem.itemCode}' belongs to another company`);
      }
      if (invItem.branchId !== existing.branchId) {
        throw new BadRequestError(`Inventory item '${invItem.itemCode}' does not belong to the approval branch`);
      }
      if (invItem.status !== 'AVAILABLE') {
        throw new BadRequestError(`Inventory item '${invItem.itemCode}' is not available for approval issue (current status: '${invItem.status}')`);
      }

      // Check active approval reference
      const activeApproval = await approvalRepository.findActiveApprovalForItem(item.inventoryItemId);
      if (activeApproval && activeApproval.approvalId !== id) {
        throw new ConflictError(`Inventory item '${invItem.itemCode}' is already associated with another active approval (${activeApproval.approval.approvalNumber})`);
      }
    }

    // Execute atomic transaction for inventory status locking & StockMovement creation
    return prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        // Atomic conditional update
        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: item.inventoryItemId,
            status: 'AVAILABLE',
            branchId: existing.branchId,
            companyId: existing.companyId,
          },
          data: {
            status: 'ON_APPROVAL',
            updatedBy: userId || null,
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictError(`Inventory item '${item.inventoryItem.itemCode}' is no longer available or was locked concurrently`);
        }

        // Create immutable StockMovement entry
        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            fromBranchId: existing.branchId,
            toBranchId: null,
            movementType: 'APPROVAL_ISSUE',
            referenceType: 'SALES_APPROVAL',
            referenceId: existing.id,
            remarks: `Issued on Approval ${existing.approvalNumber}`,
            performedBy: userId || null,
          },
        });
      }

      // Transition Approval status to ISSUED
      const updated = await tx.approval.update({
        where: { id },
        data: {
          status: ApprovalStatus.ISSUED,
          updatedBy: userId || null,
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: {
            include: {
              inventoryItem: {
                include: {
                  product: true,
                  tags: true,
                },
              },
            },
          },
        },
      });

      return updated;
    });
  }

  async cancelApproval(id: string, userCompanyId?: string, _userId?: string) {
    const existing = await approvalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && existing.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    if (existing.status !== ApprovalStatus.DRAFT) {
      throw new BadRequestError(`Cannot cancel approval in ${existing.status} status. Only DRAFT approvals can be cancelled`);
    }

    return approvalRepository.update(id, {
      status: ApprovalStatus.CANCELLED,
    });
  }

  // ==========================================
  // PHASE 7.4 RETURN & PURCHASE METHODS
  // ==========================================

  async returnApproval(id: string, dto?: ReturnApprovalDTO, userCompanyId?: string, userId?: string) {
    const existing = await approvalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && existing.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    if (existing.status !== ApprovalStatus.ISSUED && existing.status !== ApprovalStatus.WITH_CUSTOMER) {
      throw new BadRequestError(`Approval #${existing.approvalNumber} cannot be returned because its current status is '${existing.status}'`);
    }

    if (!existing.items || existing.items.length === 0) {
      throw new BadRequestError(`Approval #${existing.approvalNumber} has no items to return`);
    }

    // Pre-transaction item status check
    for (const item of existing.items) {
      const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
      if (!invItem) {
        throw new NotFoundError(`Inventory item with ID '${item.inventoryItemId}' not found`);
      }
      if (invItem.status !== 'ON_APPROVAL') {
        throw new ConflictError(`Inventory item '${invItem.itemCode}' is not currently on approval (current status: '${invItem.status}')`);
      }
    }

    return prisma.$transaction(async (tx) => {
      for (const item of existing.items) {
        // Atomic conditional update
        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: item.inventoryItemId,
            status: 'ON_APPROVAL',
            branchId: existing.branchId,
            companyId: existing.companyId,
          },
          data: {
            status: 'AVAILABLE',
            updatedBy: userId || null,
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictError(`Inventory item '${item.inventoryItem.itemCode}' is no longer on approval or was updated concurrently`);
        }

        // Immutable StockMovement entry
        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            fromBranchId: existing.branchId,
            toBranchId: null,
            movementType: 'APPROVAL_RETURN',
            referenceType: 'SALES_APPROVAL',
            referenceId: existing.id,
            remarks: `Returned from Approval ${existing.approvalNumber}`,
            performedBy: userId || null,
          },
        });

        // Update ApprovalItem status
        await tx.approvalItem.update({
          where: { id: item.id },
          data: { status: ApprovalItemStatus.RETURNED },
        });
      }

      const updatedApproval = await tx.approval.update({
        where: { id },
        data: {
          status: ApprovalStatus.RETURNED,
          updatedBy: userId || null,
          notes: dto?.returnReason
            ? `${existing.notes ? existing.notes + ' | ' : ''}Return Reason: ${dto.returnReason}`
            : existing.notes,
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: {
            include: {
              inventoryItem: true,
            },
          },
        },
      });

      const depositSummary = await this.getDepositSummary(id, userCompanyId);

      return {
        approval: updatedApproval,
        depositSummary,
      };
    });
  }

  async purchaseApproval(id: string, dto?: PurchaseApprovalDTO, userCompanyId?: string, userId?: string) {
    const existing = await approvalRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && existing.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    if (existing.status !== ApprovalStatus.ISSUED && existing.status !== ApprovalStatus.WITH_CUSTOMER) {
      throw new BadRequestError(`Approval #${existing.approvalNumber} cannot be purchased because its current status is '${existing.status}'`);
    }

    if (!existing.items || existing.items.length === 0) {
      throw new BadRequestError(`Approval #${existing.approvalNumber} has no items to purchase`);
    }

    // Duplicate item check
    const itemIds = existing.items.map((it) => it.inventoryItemId);
    if (new Set(itemIds).size !== itemIds.length) {
      throw new BadRequestError(`Duplicate inventory items found in approval #${existing.approvalNumber}`);
    }

    // Pre-transaction item status check
    for (const item of existing.items) {
      const invItem = await inventoryItemRepository.findById(item.inventoryItemId);
      if (!invItem) {
        throw new NotFoundError(`Inventory item with ID '${item.inventoryItemId}' not found`);
      }
      if (invItem.status !== 'ON_APPROVAL') {
        throw new ConflictError(`Inventory item '${invItem.itemCode}' is not currently on approval (current status: '${invItem.status}')`);
      }
    }

    return prisma.$transaction(async (tx) => {
      // 1. Atomic inventory update ON_APPROVAL -> SOLD & ApprovalItem -> PURCHASED
      for (const item of existing.items) {
        const updateResult = await tx.inventoryItem.updateMany({
          where: {
            id: item.inventoryItemId,
            status: 'ON_APPROVAL',
            branchId: existing.branchId,
            companyId: existing.companyId,
          },
          data: {
            status: 'SOLD',
            updatedBy: userId || null,
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictError(`Inventory item '${item.inventoryItem.itemCode}' is no longer on approval or was updated concurrently`);
        }

        await tx.approvalItem.update({
          where: { id: item.id },
          data: { status: ApprovalItemStatus.PURCHASED },
        });
      }

      // 2. Compute Invoice Totals
      const subtotal = existing.items.reduce((sum, it) => sum + Number(it.totalPrice), 0);
      const discountAmount = dto?.discountAmount ? Number(dto.discountAmount) : 0;
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const taxAmount = Math.round(taxableAmount * 0.03 * 100) / 100; // 3% GST
      const grandTotal = taxableAmount + taxAmount;

      // Generate invoice number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const invPrefix = `INV-${dateStr}-`;
      const invCount = await tx.salesInvoice.count({
        where: { branchId: existing.branchId, invoiceNumber: { startsWith: invPrefix } },
      });
      const invoiceNumber = `${invPrefix}${(invCount + 1).toString().padStart(4, '0')}`;

      // 3. Create SalesInvoice in CONFIRMED status
      const salesInvoice = await tx.salesInvoice.create({
        data: {
          branchId: existing.branchId,
          customerId: existing.customerId,
          salespersonId: existing.salespersonId || null,
          invoiceNumber,
          invoiceDate: new Date(),
          status: 'CONFIRMED',
          subtotal,
          discountAmount,
          taxAmount,
          grandTotal,
          pricingCalculated: true,
          pricingCalculatedAt: new Date(),
          metalRateLocked: true,
          metalRateLockedAt: new Date(),
          notes: `Converted from Approval #${existing.approvalNumber}${dto?.notes ? ' | ' + dto.notes : ''}`,
          createdByUserId: userId || null,
          companyNameSnapshot: existing.company.name,
          branchNameSnapshot: existing.branch.name,
          customerNameSnapshot: `${existing.customer.firstName} ${existing.customer.lastName}`,
          customerMobileSnapshot: existing.customer.mobile,
          items: {
            create: existing.items.map((it) => {
              const linePrice = Number(it.totalPrice);
              const lineTax = Math.round(linePrice * 0.03 * 100) / 100;
              return {
                inventoryItemId: it.inventoryItemId,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                taxableAmount: linePrice,
                taxRate: 3.0,
                taxAmount: lineTax,
                lineTotal: linePrice + lineTax,
                productNameSnapshot: it.inventoryItem.product?.name || 'Jewellery Item',
                metalTypeSnapshot: 'GOLD',
                puritySnapshot: it.inventoryItem.purity || '22K',
              };
            }),
          },
        },
      });

      // 4. Create immutable StockMovement for SALE
      for (const item of existing.items) {
        await tx.stockMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            fromBranchId: existing.branchId,
            toBranchId: null,
            movementType: 'SALE',
            referenceType: 'SALES_INVOICE',
            referenceId: salesInvoice.id,
            remarks: `Sold via Approval Conversion Invoice ${salesInvoice.invoiceNumber}`,
            performedBy: userId || null,
          },
        });
      }

      // 5. Apply Approval Deposits
      const completedDeposits = await tx.approvalDeposit.findMany({
        where: { approvalId: existing.id, status: PaymentStatus.COMPLETED },
      });
      const totalCompletedDeposit = completedDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
      const depositApplied = Math.min(totalCompletedDeposit, grandTotal);

      if (depositApplied > 0) {
        const payCount = await tx.salesPayment.count({ where: { salesInvoiceId: salesInvoice.id } });
        const paymentNumber = `PAY-DEP-${Date.now()}-${payCount + 1}`;
        await tx.salesPayment.create({
          data: {
            salesInvoiceId: salesInvoice.id,
            paymentNumber,
            paymentMethod: completedDeposits[0]?.paymentMethod || PaymentMethod.CASH,
            amount: depositApplied,
            status: PaymentStatus.COMPLETED,
            remarks: `Applied security deposit from Approval ${existing.approvalNumber}`,
            receivedBy: userId || null,
          },
        });
      }

      const outstandingAmount = Math.max(0, grandTotal - depositApplied);
      const paymentStatus = depositApplied >= grandTotal ? 'PAID' : depositApplied > 0 ? 'PARTIAL' : 'UNPAID';

      await tx.salesInvoice.update({
        where: { id: salesInvoice.id },
        data: {
          totalPaid: depositApplied,
          outstandingAmount,
          paymentStatus,
        },
      });

      // 6. Update Approval Status to PURCHASED
      const updatedApproval = await tx.approval.update({
        where: { id },
        data: {
          status: ApprovalStatus.PURCHASED,
          updatedBy: userId || null,
        },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: {
            include: {
              inventoryItem: true,
            },
          },
        },
      });

      return {
        approval: updatedApproval,
        salesInvoice: {
          ...salesInvoice,
          totalPaid: depositApplied,
          outstandingAmount,
          paymentStatus,
        },
        depositApplied,
        remainingBalance: outstandingAmount,
      };
    });
  }

  // ==========================================
  // PHASE 7.3 APPROVAL DEPOSIT METHODS
  // ==========================================

  async createDeposit(approvalId: string, dto: CreateApprovalDepositDTO, userCompanyId?: string, userId?: string) {
    const approval = await approvalRepository.findById(approvalId);
    if (!approval) {
      throw new NotFoundError(`Approval record with ID ${approvalId} not found`);
    }

    if (userCompanyId && approval.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    // Deposits can only be created against ISSUED or WITH_CUSTOMER approvals
    if (approval.status !== ApprovalStatus.ISSUED && approval.status !== ApprovalStatus.WITH_CUSTOMER) {
      throw new BadRequestError(`Cannot record deposit for approval in '${approval.status}' status. Approval must be ISSUED`);
    }

    const depositAmount = Number(dto.amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      throw new BadRequestError(`Deposit payment amount must be greater than 0`);
    }

    return prisma.$transaction(async (tx) => {
      // Fetch existing deposits within transaction
      const existingDeposits = await tx.approvalDeposit.findMany({
        where: { approvalId },
      });

      const completedSum = existingDeposits
        .filter((d) => d.status === PaymentStatus.COMPLETED)
        .reduce((sum, d) => sum + Number(d.amount), 0);

      const requiredDeposit = Number(approval.requiredDepositAmount);
      const outstandingDeposit = Math.max(0, requiredDeposit - completedSum);

      if (requiredDeposit > 0 && depositAmount > outstandingDeposit) {
        if (outstandingDeposit === 0) {
          throw new ConflictError(`Required deposit of ₹${requiredDeposit.toFixed(2)} for approval #${approval.approvalNumber} is already fully paid`);
        }
        throw new ConflictError(`Deposit payment amount (₹${depositAmount.toFixed(2)}) exceeds outstanding deposit balance (₹${outstandingDeposit.toFixed(2)})`);
      }

      const depositNumber = await this.generateDepositNumber(approval.companyId, approval.branchId, tx);

      const deposit = await tx.approvalDeposit.create({
        data: {
          approvalId: approval.id,
          companyId: approval.companyId,
          branchId: approval.branchId,
          customerId: approval.customerId,
          depositNumber,
          paymentMethod: dto.paymentMethod,
          amount: depositAmount,
          status: PaymentStatus.COMPLETED,
          transactionReference: dto.transactionReference || null,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          remarks: dto.remarks || null,
          receivedBy: userId || null,
        },
        include: {
          approval: true,
          company: true,
          branch: true,
          customer: true,
        },
      });

      const updatedCompleted = completedSum + depositAmount;
      const updatedOutstanding = Math.max(0, requiredDeposit - updatedCompleted);

      let depositStatus = DepositSummaryStatus.FULLY_PAID;
      if (requiredDeposit === 0) {
        depositStatus = DepositSummaryStatus.NOT_REQUIRED;
      } else if (updatedCompleted === 0) {
        depositStatus = DepositSummaryStatus.PENDING;
      } else if (updatedCompleted < requiredDeposit) {
        depositStatus = DepositSummaryStatus.PARTIALLY_PAID;
      }

      return {
        deposit,
        summary: {
          approvalId: approval.id,
          approvalNumber: approval.approvalNumber,
          requiredDeposit,
          completedDeposit: updatedCompleted,
          reversedDeposit: existingDeposits
            .filter((d) => d.status === PaymentStatus.REVERSED)
            .reduce((sum, d) => sum + Number(d.amount), 0),
          outstandingDeposit: updatedOutstanding,
          depositStatus,
        },
      };
    });
  }

  async getDepositSummary(approvalId: string, userCompanyId?: string): Promise<ApprovalDepositSummary> {
    const approval = await approvalRepository.findById(approvalId);
    if (!approval) {
      throw new NotFoundError(`Approval record with ID ${approvalId} not found`);
    }

    if (userCompanyId && approval.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    const deposits = await approvalDepositRepository.findDepositsByApprovalId(approvalId);

    const completedDeposit = deposits
      .filter((d) => d.status === PaymentStatus.COMPLETED)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const reversedDeposit = deposits
      .filter((d) => d.status === PaymentStatus.REVERSED)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const requiredDeposit = Number(approval.requiredDepositAmount);
    const outstandingDeposit = Math.max(0, requiredDeposit - completedDeposit);

    let depositStatus = DepositSummaryStatus.FULLY_PAID;
    if (requiredDeposit === 0) {
      depositStatus = DepositSummaryStatus.NOT_REQUIRED;
    } else if (completedDeposit === 0) {
      depositStatus = DepositSummaryStatus.PENDING;
    } else if (completedDeposit < requiredDeposit) {
      depositStatus = DepositSummaryStatus.PARTIALLY_PAID;
    }

    return {
      approvalId: approval.id,
      approvalNumber: approval.approvalNumber,
      requiredDeposit,
      completedDeposit,
      reversedDeposit,
      outstandingDeposit,
      depositStatus,
    };
  }

  async getDepositById(id: string, userCompanyId?: string) {
    const deposit = await approvalDepositRepository.findById(id);
    if (!deposit) {
      throw new NotFoundError(`Approval deposit record with ID ${id} not found`);
    }

    if (userCompanyId && deposit.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to deposit record from another company`);
    }

    return deposit;
  }

  async listDeposits(params: ApprovalDepositQueryDTO) {
    return approvalDepositRepository.findMany(params);
  }

  async listDepositsForApproval(approvalId: string, userCompanyId?: string) {
    const approval = await approvalRepository.findById(approvalId);
    if (!approval) {
      throw new NotFoundError(`Approval record with ID ${approvalId} not found`);
    }

    if (userCompanyId && approval.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    return approvalDepositRepository.findDepositsByApprovalId(approvalId);
  }

  async reverseDeposit(id: string, dto: ReverseApprovalDepositDTO, userCompanyId?: string, userId?: string) {
    const deposit = await approvalDepositRepository.findById(id);
    if (!deposit) {
      throw new NotFoundError(`Approval deposit record with ID ${id} not found`);
    }

    if (userCompanyId && deposit.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to deposit record from another company`);
    }

    if (deposit.status === PaymentStatus.REVERSED) {
      throw new BadRequestError(`Deposit payment ${deposit.depositNumber} is already reversed`);
    }

    if (deposit.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestError(`Only COMPLETED deposit payments can be reversed`);
    }

    if (!dto.reversalReason || dto.reversalReason.trim().length < 3) {
      throw new BadRequestError(`A valid reversal reason of at least 3 characters is required`);
    }

    return approvalDepositRepository.reverse(id, {
      reversedBy: userId,
      reversalReason: dto.reversalReason.trim(),
    });
  }
}

export const approvalService = new ApprovalService();
