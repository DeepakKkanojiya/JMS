import { ApprovalStatus, PaymentMethod, PaymentStatus } from '../../generated/prisma';

export interface ApprovalReportQueryDTO {
  page?: number | string;
  limit?: number | string;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  salespersonId?: string;
  status?: ApprovalStatus;
  fromDate?: string;
  toDate?: string;
  isOverdue?: boolean | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApprovalSummaryReport {
  totalApprovals: number;
  draftCount: number;
  issuedCount: number;
  withCustomerCount: number;
  returnedCount: number;
  purchasedCount: number;
  cancelledCount: number;
  expiredCount: number;
  totalJewelleryValueIssued: number;
  totalValueWithCustomers: number;
  totalDepositsRequired: number;
  totalDepositsCollected: number;
  totalDepositsReversed: number;
  outstandingDeposits: number;
  purchasedApprovalValue: number;
  returnedApprovalValue: number;
}

export interface ApprovalRegisterItem {
  id: string;
  approvalNumber: string;
  companyId: string;
  branchId: string;
  branchName: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  salespersonName?: string;
  issueDate: Date;
  dueDate: Date;
  status: ApprovalStatus;
  totalItemCount: number;
  totalApprovalValue: number;
  requiredDeposit: number;
  paidDeposit: number;
  reversedDeposit: number;
  outstandingDeposit: number;
  daysWithCustomer: number;
  isOverdue: boolean;
  createdBy?: string;
}

export interface InventoryOnApprovalItem {
  approvalId: string;
  approvalNumber: string;
  customerId: string;
  customerName: string;
  inventoryItemId: string;
  itemCode: string;
  barcode?: string;
  rfidEpc?: string;
  productName: string;
  metalType?: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight?: number;
  fineWeight: number;
  value: number;
  issueDate: Date;
  daysOnApproval: number;
}

export interface DepositReportItem {
  depositId: string;
  depositNumber: string;
  approvalId: string;
  approvalNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  paymentDate: Date;
  remarks?: string;
  reversedAt?: Date;
  reversedBy?: string;
  reversalReason?: string;
}

export interface DepositReportSummary {
  totalCompletedDeposits: number;
  totalReversedDeposits: number;
  netDepositBalance: number;
  countCompleted: number;
  countReversed: number;
}

export interface ReturnVsPurchaseReport {
  returnedCount: number;
  returnedValue: number;
  purchasedCount: number;
  purchasedValue: number;
  totalClosedCount: number;
  conversionRatePercent: number;
  items: {
    approvalId: string;
    approvalNumber: string;
    customerName: string;
    status: ApprovalStatus;
    totalValue: number;
    issueDate: Date;
    closedDate?: Date;
    salesInvoiceId?: string;
    salesInvoiceNumber?: string;
  }[];
}

export interface CustomerApprovalHistoryReport {
  customerId: string;
  customerName: string;
  customerCode: string;
  mobile: string;
  totalApprovalsCount: number;
  activeApprovalsCount: number;
  totalIssuedValue: number;
  totalDepositPaid: number;
  approvals: {
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
  }[];
}

export interface AgeingBucket {
  bucket: 'CURRENT' | 'OVERDUE_1_7_DAYS' | 'OVERDUE_8_30_DAYS' | 'OVERDUE_31_60_DAYS' | 'OVERDUE_60_PLUS_DAYS';
  description: string;
  count: number;
  totalValue: number;
  approvals: {
    id: string;
    approvalNumber: string;
    customerName: string;
    dueDate: Date;
    daysOverdue: number;
    totalValue: number;
    paidDeposit: number;
  }[];
}

export interface ApprovalAuditTrailEvent {
  timestamp: Date;
  eventType:
    | 'CREATED'
    | 'ISSUED'
    | 'INVENTORY_LOCKED'
    | 'DEPOSIT_RECEIVED'
    | 'DEPOSIT_REVERSED'
    | 'RETURNED'
    | 'PURCHASE_CONFIRMED'
    | 'INVENTORY_RELEASED'
    | 'INVENTORY_SOLD'
    | 'CANCELLED';
  description: string;
  performedBy?: string;
  details?: Record<string, any>;
}

export interface ApprovalAuditTrailReport {
  approvalId: string;
  approvalNumber: string;
  currentStatus: ApprovalStatus;
  createdAt: Date;
  customerName: string;
  timeline: ApprovalAuditTrailEvent[];
}
