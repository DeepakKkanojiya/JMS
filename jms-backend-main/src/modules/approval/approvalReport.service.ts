import { prisma } from '../../database';
import { ApprovalStatus, PaymentStatus } from '../../generated/prisma';
import { NotFoundError, ForbiddenError } from '../../errors';
import {
  ApprovalReportQueryDTO,
  ApprovalSummaryReport,
  ApprovalRegisterItem,
  InventoryOnApprovalItem,
  DepositReportItem,
  DepositReportSummary,
  ReturnVsPurchaseReport,
  CustomerApprovalHistoryReport,
  AgeingBucket,
  ApprovalAuditTrailReport,
  ApprovalAuditTrailEvent,
} from './approvalReport.types';

export class ApprovalReportService {
  /**
   * 1. Aggregated Summary Metrics Report
   */
  async getSummaryReport(userCompanyId?: string, branchId?: string): Promise<ApprovalSummaryReport> {
    const where: any = {};
    if (userCompanyId) where.companyId = userCompanyId;
    if (branchId) where.branchId = branchId;

    const approvals = await prisma.approval.findMany({
      where,
      include: {
        deposits: true,
      },
    });

    let draftCount = 0;
    let issuedCount = 0;
    let withCustomerCount = 0;
    let returnedCount = 0;
    let purchasedCount = 0;
    let cancelledCount = 0;
    let expiredCount = 0;

    let totalJewelleryValueIssued = 0;
    let totalValueWithCustomers = 0;
    let totalDepositsRequired = 0;
    let totalDepositsCollected = 0;
    let totalDepositsReversed = 0;
    let purchasedApprovalValue = 0;
    let returnedApprovalValue = 0;

    for (const app of approvals) {
      const val = Number(app.totalAmount);
      const reqDep = Number(app.requiredDepositAmount);

      switch (app.status) {
        case ApprovalStatus.DRAFT:
          draftCount++;
          break;
        case ApprovalStatus.ISSUED:
          issuedCount++;
          totalJewelleryValueIssued += val;
          totalValueWithCustomers += val;
          totalDepositsRequired += reqDep;
          break;
        case ApprovalStatus.WITH_CUSTOMER:
          withCustomerCount++;
          totalJewelleryValueIssued += val;
          totalValueWithCustomers += val;
          totalDepositsRequired += reqDep;
          break;
        case ApprovalStatus.RETURNED:
          returnedCount++;
          totalJewelleryValueIssued += val;
          returnedApprovalValue += val;
          break;
        case ApprovalStatus.PURCHASED:
          purchasedCount++;
          totalJewelleryValueIssued += val;
          purchasedApprovalValue += val;
          break;
        case ApprovalStatus.CANCELLED:
          cancelledCount++;
          break;
        case ApprovalStatus.EXPIRED:
          expiredCount++;
          totalJewelleryValueIssued += val;
          break;
      }

      for (const dep of app.deposits) {
        if (dep.status === PaymentStatus.COMPLETED) {
          totalDepositsCollected += Number(dep.amount);
        } else if (dep.status === PaymentStatus.REVERSED) {
          totalDepositsReversed += Number(dep.amount);
        }
      }
    }

    const netDeposits = Math.max(0, totalDepositsCollected - totalDepositsReversed);
    const outstandingDeposits = Math.max(0, totalDepositsRequired - netDeposits);

    return {
      totalApprovals: approvals.length,
      draftCount,
      issuedCount,
      withCustomerCount,
      returnedCount,
      purchasedCount,
      cancelledCount,
      expiredCount,
      totalJewelleryValueIssued,
      totalValueWithCustomers,
      totalDepositsRequired,
      totalDepositsCollected,
      totalDepositsReversed,
      outstandingDeposits,
      purchasedApprovalValue,
      returnedApprovalValue,
    };
  }

  /**
   * 2. Approval Register Report (Paginated/Filterable)
   */
  async getRegisterReport(params: ApprovalReportQueryDTO, userCompanyId?: string) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userCompanyId) where.companyId = userCompanyId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.branchId) where.branchId = params.branchId;
    if (params.customerId) where.customerId = params.customerId;
    if (params.salespersonId) where.salespersonId = params.salespersonId;
    if (params.status) where.status = params.status;

    if (params.fromDate || params.toDate) {
      where.issueDate = {};
      if (params.fromDate) where.issueDate.gte = new Date(params.fromDate);
      if (params.toDate) where.issueDate.lte = new Date(params.toDate);
    }

    const now = new Date();
    if (params.isOverdue) {
      where.status = { in: [ApprovalStatus.ISSUED, ApprovalStatus.WITH_CUSTOMER] };
      where.dueDate = { lt: now };
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.trim();
      where.OR = [
        { approvalNumber: { contains: q, mode: 'insensitive' } },
        { customer: { firstName: { contains: q, mode: 'insensitive' } } },
        { customer: { lastName: { contains: q, mode: 'insensitive' } } },
        { customer: { mobile: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.approval.count({ where }),
      prisma.approval.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [params.sortBy || 'issueDate']: params.sortOrder || 'desc' },
        include: {
          company: true,
          branch: true,
          customer: true,
          salesperson: true,
          items: true,
          deposits: true,
        },
      }),
    ]);

    const registerItems: ApprovalRegisterItem[] = items.map((app) => {
      const reqDep = Number(app.requiredDepositAmount);
      const paidDep = app.deposits
        .filter((d) => d.status === PaymentStatus.COMPLETED)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const revDep = app.deposits
        .filter((d) => d.status === PaymentStatus.REVERSED)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const outDep = Math.max(0, reqDep - paidDep);

      const daysWithCustomer = Math.max(0, Math.floor((now.getTime() - app.issueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const isOverdue = now.getTime() > app.dueDate.getTime() && (app.status === ApprovalStatus.ISSUED || app.status === ApprovalStatus.WITH_CUSTOMER);

      return {
        id: app.id,
        approvalNumber: app.approvalNumber,
        companyId: app.companyId,
        branchId: app.branchId,
        branchName: app.branch.name,
        customerId: app.customerId,
        customerName: `${app.customer.firstName} ${app.customer.lastName}`,
        customerMobile: app.customer.mobile,
        salespersonName: app.salesperson ? `${app.salesperson.firstName} ${app.salesperson.lastName}` : undefined,
        issueDate: app.issueDate,
        dueDate: app.dueDate,
        status: app.status,
        totalItemCount: app.totalQuantity,
        totalApprovalValue: Number(app.totalAmount),
        requiredDeposit: reqDep,
        paidDeposit: paidDep,
        reversedDeposit: revDep,
        outstandingDeposit: outDep,
        daysWithCustomer,
        isOverdue,
        createdBy: app.createdBy || undefined,
      };
    });

    return {
      items: registerItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. Inventory on Approval Report
   */
  async getInventoryReport(params: ApprovalReportQueryDTO, userCompanyId?: string) {
    const where: any = {
      status: 'ON_APPROVAL',
    };
    if (userCompanyId) where.companyId = userCompanyId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.branchId) where.branchId = params.branchId;

    const inventoryItems = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        branch: true,
        tags: true,
        approvalItems: {
          include: {
            approval: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const resultItems: InventoryOnApprovalItem[] = [];

    for (const item of inventoryItems) {
      // Find active approval item
      const activeAppItem = item.approvalItems.find(
        (ai) => ai.approval.status === ApprovalStatus.ISSUED || ai.approval.status === ApprovalStatus.WITH_CUSTOMER
      );
      if (!activeAppItem) continue;

      const app = activeAppItem.approval;
      const daysOnApproval = Math.max(0, Math.floor((now.getTime() - app.issueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const activeTag = item.tags?.find((t) => t.isActive);

      resultItems.push({
        approvalId: app.id,
        approvalNumber: app.approvalNumber,
        customerId: app.customerId,
        customerName: `${app.customer.firstName} ${app.customer.lastName}`,
        inventoryItemId: item.id,
        itemCode: item.itemCode,
        barcode: activeTag?.barcode,
        rfidEpc: activeTag?.rfidEpc || undefined,
        productName: item.product.name,
        metalType: item.product.metalType,
        purity: item.purity,
        grossWeight: Number(item.grossWeight),
        netWeight: Number(item.netWeight),
        stoneWeight: item.stoneWeight ? Number(item.stoneWeight) : 0,
        fineWeight: Number(item.fineWeight),
        value: Number(activeAppItem.totalPrice),
        issueDate: app.issueDate,
        daysOnApproval,
      });
    }

    return {
      items: resultItems,
      totalCount: resultItems.length,
      totalValue: resultItems.reduce((sum, i) => sum + i.value, 0),
    };
  }

  /**
   * 4. Deposit / Payment Report
   */
  async getDepositsReport(params: ApprovalReportQueryDTO, userCompanyId?: string) {
    const where: any = {};
    if (userCompanyId) where.companyId = userCompanyId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.branchId) where.branchId = params.branchId;
    if (params.customerId) where.customerId = params.customerId;

    const deposits = await prisma.approvalDeposit.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        approval: true,
        customer: true,
      },
    });

    let totalCompleted = 0;
    let totalReversed = 0;
    let countCompleted = 0;
    let countReversed = 0;

    const items: DepositReportItem[] = deposits.map((d) => {
      const amt = Number(d.amount);
      if (d.status === PaymentStatus.COMPLETED) {
        totalCompleted += amt;
        countCompleted++;
      } else if (d.status === PaymentStatus.REVERSED) {
        totalReversed += amt;
        countReversed++;
      }

      return {
        depositId: d.id,
        depositNumber: d.depositNumber,
        approvalId: d.approvalId,
        approvalNumber: d.approval.approvalNumber,
        customerId: d.customerId,
        customerName: `${d.customer.firstName} ${d.customer.lastName}`,
        amount: amt,
        paymentMethod: d.paymentMethod,
        status: d.status,
        transactionReference: d.transactionReference || undefined,
        paymentDate: d.paymentDate,
        remarks: d.remarks || undefined,
        reversedAt: d.reversedAt || undefined,
        reversedBy: d.reversedBy || undefined,
        reversalReason: d.reversalReason || undefined,
      };
    });

    const summary: DepositReportSummary = {
      totalCompletedDeposits: totalCompleted,
      totalReversedDeposits: totalReversed,
      netDepositBalance: Math.max(0, totalCompleted - totalReversed),
      countCompleted,
      countReversed,
    };

    return {
      summary,
      items,
    };
  }

  /**
   * 5. Return vs Purchase Report
   */
  async getReturnVsPurchaseReport(params: ApprovalReportQueryDTO, userCompanyId?: string): Promise<ReturnVsPurchaseReport> {
    const where: any = {
      status: { in: [ApprovalStatus.RETURNED, ApprovalStatus.PURCHASED] },
    };
    if (userCompanyId) where.companyId = userCompanyId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.branchId) where.branchId = params.branchId;

    const approvals = await prisma.approval.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: true,
      },
    });

    let returnedCount = 0;
    let returnedValue = 0;
    let purchasedCount = 0;
    let purchasedValue = 0;

    const reportItems: {
      approvalId: string;
      approvalNumber: string;
      customerName: string;
      status: ApprovalStatus;
      totalValue: number;
      issueDate: Date;
      closedDate?: Date;
      salesInvoiceId?: string;
      salesInvoiceNumber?: string;
    }[] = [];

    for (const app of approvals) {
      const val = Number(app.totalAmount);
      let invId: string | undefined;
      let invNum: string | undefined;

      if (app.status === ApprovalStatus.RETURNED) {
        returnedCount++;
        returnedValue += val;
      } else if (app.status === ApprovalStatus.PURCHASED) {
        purchasedCount++;
        purchasedValue += val;

        // Fetch resulting sales invoice
        const inv = await prisma.salesInvoice.findFirst({
          where: { notes: { contains: app.approvalNumber } },
        });
        if (inv) {
          invId = inv.id;
          invNum = inv.invoiceNumber;
        }
      }

      reportItems.push({
        approvalId: app.id,
        approvalNumber: app.approvalNumber,
        customerName: `${app.customer.firstName} ${app.customer.lastName}`,
        status: app.status,
        totalValue: val,
        issueDate: app.issueDate,
        closedDate: app.updatedAt,
        salesInvoiceId: invId,
        salesInvoiceNumber: invNum,
      });
    }

    const totalClosedCount = returnedCount + purchasedCount;
    const conversionRatePercent = totalClosedCount > 0 ? Math.round((purchasedCount / totalClosedCount) * 100 * 100) / 100 : 0;

    return {
      returnedCount,
      returnedValue,
      purchasedCount,
      purchasedValue,
      totalClosedCount,
      conversionRatePercent,
      items: reportItems,
    };
  }

  /**
   * 6. Customer Approval History Report
   */
  async getCustomerHistoryReport(customerId: string, userCompanyId?: string): Promise<CustomerApprovalHistoryReport> {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    if (userCompanyId && customer.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to customer from another company`);
    }

    const approvals = await prisma.approval.findMany({
      where: { customerId },
      orderBy: { issueDate: 'desc' },
      include: {
        deposits: true,
      },
    });

    let activeApprovalsCount = 0;
    let totalIssuedValue = 0;
    let totalDepositPaid = 0;

    const approvalItems: {
      id: string;
      approvalNumber: string;
      issueDate: Date;
      dueDate: Date;
      status: ApprovalStatus;
      totalValue: number;
      requiredDeposit: number;
      paidDeposit: number;
      salesInvoiceId?: string;
      salesInvoiceNumber?: string;
    }[] = [];

    for (const app of approvals) {
      const val = Number(app.totalAmount);
      const reqDep = Number(app.requiredDepositAmount);
      const paidDep = app.deposits
        .filter((d) => d.status === PaymentStatus.COMPLETED)
        .reduce((sum, d) => sum + Number(d.amount), 0);

      totalIssuedValue += val;
      totalDepositPaid += paidDep;

      if (app.status === ApprovalStatus.ISSUED || app.status === ApprovalStatus.WITH_CUSTOMER) {
        activeApprovalsCount++;
      }

      let invId: string | undefined;
      let invNum: string | undefined;

      if (app.status === ApprovalStatus.PURCHASED) {
        const inv = await prisma.salesInvoice.findFirst({
          where: { notes: { contains: app.approvalNumber } },
        });
        if (inv) {
          invId = inv.id;
          invNum = inv.invoiceNumber;
        }
      }

      approvalItems.push({
        id: app.id,
        approvalNumber: app.approvalNumber,
        issueDate: app.issueDate,
        dueDate: app.dueDate,
        status: app.status,
        totalValue: val,
        requiredDeposit: reqDep,
        paidDeposit: paidDep,
        salesInvoiceId: invId,
        salesInvoiceNumber: invNum,
      });
    }

    return {
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerCode: customer.customerCode,
      mobile: customer.mobile,
      totalApprovalsCount: approvals.length,
      activeApprovalsCount,
      totalIssuedValue,
      totalDepositPaid,
      approvals: approvalItems,
    };
  }

  /**
   * 7. Ageing / Overdue Report
   */
  async getAgeingReport(params: ApprovalReportQueryDTO, userCompanyId?: string): Promise<AgeingBucket[]> {
    const where: any = {
      status: { in: [ApprovalStatus.ISSUED, ApprovalStatus.WITH_CUSTOMER] },
    };
    if (userCompanyId) where.companyId = userCompanyId;
    if (params.companyId) where.companyId = params.companyId;
    if (params.branchId) where.branchId = params.branchId;

    const approvals = await prisma.approval.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        customer: true,
        deposits: true,
      },
    });

    const now = new Date();

    const current: AgeingBucket = {
      bucket: 'CURRENT',
      description: 'Active approvals not yet overdue',
      count: 0,
      totalValue: 0,
      approvals: [],
    };
    const ov1_7: AgeingBucket = {
      bucket: 'OVERDUE_1_7_DAYS',
      description: '1 to 7 days overdue',
      count: 0,
      totalValue: 0,
      approvals: [],
    };
    const ov8_30: AgeingBucket = {
      bucket: 'OVERDUE_8_30_DAYS',
      description: '8 to 30 days overdue',
      count: 0,
      totalValue: 0,
      approvals: [],
    };
    const ov31_60: AgeingBucket = {
      bucket: 'OVERDUE_31_60_DAYS',
      description: '31 to 60 days overdue',
      count: 0,
      totalValue: 0,
      approvals: [],
    };
    const ov60plus: AgeingBucket = {
      bucket: 'OVERDUE_60_PLUS_DAYS',
      description: '60+ days overdue',
      count: 0,
      totalValue: 0,
      approvals: [],
    };

    for (const app of approvals) {
      const val = Number(app.totalAmount);
      const paidDep = app.deposits
        .filter((d) => d.status === PaymentStatus.COMPLETED)
        .reduce((sum, d) => sum + Number(d.amount), 0);

      const daysOverdue = Math.max(0, Math.floor((now.getTime() - app.dueDate.getTime()) / (1000 * 60 * 60 * 24)));

      const itemData = {
        id: app.id,
        approvalNumber: app.approvalNumber,
        customerName: `${app.customer.firstName} ${app.customer.lastName}`,
        dueDate: app.dueDate,
        daysOverdue,
        totalValue: val,
        paidDeposit: paidDep,
      };

      if (daysOverdue === 0) {
        current.count++;
        current.totalValue += val;
        current.approvals.push(itemData);
      } else if (daysOverdue <= 7) {
        ov1_7.count++;
        ov1_7.totalValue += val;
        ov1_7.approvals.push(itemData);
      } else if (daysOverdue <= 30) {
        ov8_30.count++;
        ov8_30.totalValue += val;
        ov8_30.approvals.push(itemData);
      } else if (daysOverdue <= 60) {
        ov31_60.count++;
        ov31_60.totalValue += val;
        ov31_60.approvals.push(itemData);
      } else {
        ov60plus.count++;
        ov60plus.totalValue += val;
        ov60plus.approvals.push(itemData);
      }
    }

    return [current, ov1_7, ov8_30, ov31_60, ov60plus];
  }

  /**
   * 8. 360° Approval Audit Trail
   */
  async getAuditTrail(id: string, userCompanyId?: string): Promise<ApprovalAuditTrailReport> {
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            inventoryItem: true,
          },
        },
        deposits: true,
      },
    });

    if (!approval) {
      throw new NotFoundError(`Approval record with ID ${id} not found`);
    }

    if (userCompanyId && approval.companyId !== userCompanyId) {
      throw new ForbiddenError(`Access denied to approval record from another company`);
    }

    const timeline: ApprovalAuditTrailEvent[] = [];

    // 1. CREATED Event
    timeline.push({
      timestamp: approval.createdAt,
      eventType: 'CREATED',
      description: `Approval slip #${approval.approvalNumber} created in DRAFT status`,
      performedBy: approval.createdBy || undefined,
      details: {
        totalAmount: Number(approval.totalAmount),
        itemCount: approval.totalQuantity,
        dueDate: approval.dueDate,
      },
    });

    // 2. ISSUED / INVENTORY_LOCKED Events
    if (approval.status !== ApprovalStatus.DRAFT && approval.status !== ApprovalStatus.CANCELLED) {
      timeline.push({
        timestamp: approval.issueDate,
        eventType: 'ISSUED',
        description: `Approval slip #${approval.approvalNumber} issued to customer ${approval.customer.firstName} ${approval.customer.lastName}`,
        details: {
          dueDate: approval.dueDate,
          requiredDeposit: Number(approval.requiredDepositAmount),
        },
      });

      // Stock movements for issue
      const itemIds = approval.items.map((i) => i.inventoryItemId);
      const issueMovements = await prisma.stockMovement.findMany({
        where: {
          inventoryItemId: { in: itemIds },
          movementType: 'APPROVAL_ISSUE',
        },
      });

      if (issueMovements.length > 0) {
        timeline.push({
          timestamp: issueMovements[0].createdAt,
          eventType: 'INVENTORY_LOCKED',
          description: `${issueMovements.length} inventory item(s) locked on approval (AVAILABLE -> ON_APPROVAL)`,
          performedBy: issueMovements[0].performedBy || undefined,
        });
      }
    }

    // 3. DEPOSIT_RECEIVED / DEPOSIT_REVERSED Events
    for (const dep of approval.deposits) {
      if (dep.status === PaymentStatus.COMPLETED) {
        timeline.push({
          timestamp: dep.paymentDate,
          eventType: 'DEPOSIT_RECEIVED',
          description: `Security deposit of ₹${Number(dep.amount).toFixed(2)} received via ${dep.paymentMethod} (${dep.depositNumber})`,
          performedBy: dep.receivedBy || undefined,
          details: {
            amount: Number(dep.amount),
            paymentMethod: dep.paymentMethod,
            ref: dep.transactionReference,
          },
        });
      }

      if (dep.status === PaymentStatus.REVERSED && dep.reversedAt) {
        timeline.push({
          timestamp: dep.reversedAt,
          eventType: 'DEPOSIT_REVERSED',
          description: `Security deposit ${dep.depositNumber} of ₹${Number(dep.amount).toFixed(2)} reversed`,
          performedBy: dep.reversedBy || undefined,
          details: {
            reason: dep.reversalReason,
          },
        });
      }
    }

    // 4. RETURNED / INVENTORY_RELEASED Events
    if (approval.status === ApprovalStatus.RETURNED) {
      const itemIds = approval.items.map((i) => i.inventoryItemId);
      const returnMovements = await prisma.stockMovement.findMany({
        where: {
          inventoryItemId: { in: itemIds },
          movementType: 'APPROVAL_RETURN',
        },
      });

      const eventTime = returnMovements[0]?.createdAt || approval.updatedAt;

      timeline.push({
        timestamp: eventTime,
        eventType: 'RETURNED',
        description: `Approval slip #${approval.approvalNumber} returned by customer`,
        details: {
          notes: approval.notes,
        },
      });

      timeline.push({
        timestamp: eventTime,
        eventType: 'INVENTORY_RELEASED',
        description: `${approval.items.length} inventory item(s) released back to stock (ON_APPROVAL -> AVAILABLE)`,
      });
    }

    // 5. PURCHASE_CONFIRMED / INVENTORY_SOLD Events
    if (approval.status === ApprovalStatus.PURCHASED) {
      const itemIds = approval.items.map((i) => i.inventoryItemId);
      const saleMovements = await prisma.stockMovement.findMany({
        where: {
          inventoryItemId: { in: itemIds },
          movementType: 'SALE',
        },
      });

      const inv = await prisma.salesInvoice.findFirst({
        where: { notes: { contains: approval.approvalNumber } },
      });

      const eventTime = saleMovements[0]?.createdAt || approval.updatedAt;

      timeline.push({
        timestamp: eventTime,
        eventType: 'PURCHASE_CONFIRMED',
        description: `Approval converted to confirmed Sales Invoice ${inv ? inv.invoiceNumber : ''}`,
        details: {
          salesInvoiceId: inv?.id,
          invoiceNumber: inv?.invoiceNumber,
          grandTotal: inv ? Number(inv.grandTotal) : Number(approval.totalAmount),
        },
      });

      timeline.push({
        timestamp: eventTime,
        eventType: 'INVENTORY_SOLD',
        description: `${approval.items.length} inventory item(s) sold (ON_APPROVAL -> SOLD)`,
      });
    }

    // 6. CANCELLED Event
    if (approval.status === ApprovalStatus.CANCELLED) {
      timeline.push({
        timestamp: approval.updatedAt,
        eventType: 'CANCELLED',
        description: `Draft approval slip #${approval.approvalNumber} cancelled`,
      });
    }

    // Sort timeline chronologically
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      approvalId: approval.id,
      approvalNumber: approval.approvalNumber,
      currentStatus: approval.status,
      createdAt: approval.createdAt,
      customerName: `${approval.customer.firstName} ${approval.customer.lastName}`,
      timeline,
    };
  }
}

export const approvalReportService = new ApprovalReportService();
