import { apiClient } from './client';

export type ApprovalStatus = 'DRAFT' | 'ISSUED' | 'WITH_CUSTOMER' | 'RETURNED' | 'PURCHASED' | 'CANCELLED' | 'EXPIRED';
export type ApprovalItemStatus = 'ON_APPROVAL' | 'RETURNED' | 'PURCHASED' | 'CANCELLED';
export type DepositPaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
export type DepositPaymentStatus = 'COMPLETED' | 'REVERSED' | 'PENDING' | 'FAILED';

export enum DepositSummaryStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
}

export interface ApprovalItem {
  id: string;
  approvalId: string;
  inventoryItemId: string;
  inventoryItem?: {
    id: string;
    itemCode: string;
    purity: string;
    grossWeight: number | string;
    netWeight: number | string;
    stoneWeight?: number | string;
    metalType?: string;
    status?: string;
    product?: { name: string; category?: { name: string } };
    inventoryTag?: { barcode: string; rfidEpc?: string | null };
    tags?: { barcode: string; rfidEpc?: string | null }[];
  };
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  status: ApprovalItemStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprovalDeposit {
  id: string;
  depositNumber?: string;
  approvalId: string;
  approval?: ApprovalSlip;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  customer?: { id: string; firstName: string; lastName?: string; customerCode?: string; mobile?: string };
  amount: number | string;
  paymentMethod: DepositPaymentMethod;
  status: DepositPaymentStatus;
  transactionReference?: string | null;
  paymentDate: string;
  remarks?: string | null;
  receivedBy?: string | null;
  reversedAt?: string | null;
  reversedBy?: string | null;
  reversalReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ApprovalSlip {
  id: string;
  approvalNumber: string;
  companyId: string;
  company?: { id: string; name: string };
  branchId: string;
  branch?: { id: string; name: string; branchCode?: string };
  customerId: string;
  customer?: { id: string; customerCode?: string; firstName: string; lastName?: string; mobile?: string; email?: string };
  salespersonId?: string | null;
  salesperson?: { id: string; firstName: string; lastName?: string; code?: string };
  issueDate: string;
  dueDate: string;
  status: ApprovalStatus;
  totalItemCount: number;
  totalApprovalValue: number | string;
  requiredDepositAmount: number | string;
  paidDepositAmount: number | string;
  notes?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  issuedBy?: string | null;
  issuedAt?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: ApprovalItem[];
  deposits?: ApprovalDeposit[];
  salesInvoiceId?: string | null;
  salesInvoiceNumber?: string | null;
}

export interface CreateApprovalItemInput {
  inventoryItemId: string;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

export interface CreateApprovalPayload {
  companyId: string;
  branchId: string;
  customerId: string;
  salespersonId?: string;
  dueDate: string;
  notes?: string;
  requiredDepositAmount?: number;
  items: CreateApprovalItemInput[];
}

export interface UpdateApprovalPayload {
  customerId?: string;
  salespersonId?: string;
  dueDate?: string;
  notes?: string;
  requiredDepositAmount?: number;
  items?: CreateApprovalItemInput[];
}

export interface ApprovalFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  salespersonId?: string;
  status?: ApprovalStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDepositPayload {
  approvalId?: string;
  paymentMethod: DepositPaymentMethod;
  amount: number;
  transactionReference?: string;
  paymentDate?: string;
  remarks?: string;
}

export interface ReverseDepositPayload {
  reversalReason: string;
}

export interface DepositFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  approvalId?: string;
  status?: DepositPaymentStatus;
  paymentMethod?: DepositPaymentMethod;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApprovalDepositSummaryResponse {
  approvalId: string;
  approvalNumber: string;
  requiredDeposit: number;
  completedDeposit: number;
  reversedDeposit: number;
  outstandingDeposit: number;
  depositStatus: DepositSummaryStatus;
}

export interface ReturnApprovalPayload {
  returnReason?: string;
}

export interface PurchaseApprovalPayload {
  notes?: string;
  discountAmount?: number;
}

export interface ReportQueryFilterParams {
  page?: number;
  limit?: number;
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
  issueDate: string;
  dueDate: string;
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
  issueDate: string;
  daysOnApproval: number;
}

export interface DepositReportItem {
  depositId: string;
  depositNumber?: string;
  approvalId: string;
  approvalNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: DepositPaymentMethod;
  status: DepositPaymentStatus;
  transactionReference?: string;
  paymentDate: string;
  remarks?: string;
  reversedAt?: string;
  reversedBy?: string;
  reversalReason?: string;
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
    issueDate: string;
    closedDate?: string;
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
    issueDate: string;
    dueDate: string;
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
    dueDate: string;
    daysOverdue: number;
    totalValue: number;
    paidDeposit: number;
  }[];
}

export interface ApprovalAuditTrailEvent {
  timestamp: string;
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
  createdAt: string;
  customerName: string;
  timeline: ApprovalAuditTrailEvent[];
}

export const approvalApi = {
  // Phase 7.1: Approval Slips CRUD & Lifecycle
  create: async (payload: CreateApprovalPayload) => {
    const res = await apiClient.post('/approvals', payload);
    return res.data;
  },

  list: async (params?: ApprovalFilterParams) => {
    const res = await apiClient.get('/approvals', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/approvals/${id}`);
    return res.data;
  },

  update: async (id: string, payload: UpdateApprovalPayload) => {
    const res = await apiClient.put(`/approvals/${id}`, payload);
    return res.data;
  },

  issue: async (id: string) => {
    const res = await apiClient.post(`/approvals/${id}/issue`);
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.post(`/approvals/${id}/cancel`);
    return res.data;
  },

  // Phase 7.3: Approval Deposits
  createDeposit: async (approvalId: string, payload: CreateDepositPayload) => {
    const res = await apiClient.post(`/approvals/${approvalId}/deposits`, payload);
    return res.data;
  },

  listDepositsForApproval: async (approvalId: string) => {
    const res = await apiClient.get(`/approvals/${approvalId}/deposits`);
    return res.data;
  },

  getDepositSummary: async (approvalId: string): Promise<{ success: boolean; data: ApprovalDepositSummaryResponse }> => {
    const res = await apiClient.get(`/approvals/${approvalId}/deposit-summary`);
    return res.data;
  },

  listGlobalDeposits: async (params?: DepositFilterParams) => {
    const res = await apiClient.get('/approval-deposits', { params });
    return res.data;
  },

  getDepositById: async (id: string) => {
    const res = await apiClient.get(`/approval-deposits/${id}`);
    return res.data;
  },

  reverseDeposit: async (id: string, payload: ReverseDepositPayload) => {
    const res = await apiClient.post(`/approval-deposits/${id}/reverse`, payload);
    return res.data;
  },

  // Phase 7.4: Return & Purchase Workflows
  returnApproval: async (id: string, payload?: ReturnApprovalPayload) => {
    const res = await apiClient.post(`/approvals/${id}/return`, payload || {});
    return res.data;
  },

  purchaseApproval: async (id: string, payload?: PurchaseApprovalPayload) => {
    const res = await apiClient.post(`/approvals/${id}/purchase`, payload || {});
    return res.data;
  },

  // Phase 7.5: Approval Reports & Analytics
  getSummaryReport: async (params?: ReportQueryFilterParams): Promise<{ success: boolean; data: ApprovalSummaryReport }> => {
    const res = await apiClient.get('/approvals/reports/summary', { params });
    return res.data;
  },

  getRegisterReport: async (params?: ReportQueryFilterParams) => {
    const res = await apiClient.get('/approvals/reports/register', { params });
    return res.data;
  },

  getInventoryReport: async (params?: ReportQueryFilterParams) => {
    const res = await apiClient.get('/approvals/reports/inventory', { params });
    return res.data;
  },

  getDepositsReport: async (params?: ReportQueryFilterParams) => {
    const res = await apiClient.get('/approvals/reports/deposits', { params });
    return res.data;
  },

  getReturnVsPurchaseReport: async (params?: ReportQueryFilterParams): Promise<{ success: boolean; data: ReturnVsPurchaseReport }> => {
    const res = await apiClient.get('/approvals/reports/returns-purchases', { params });
    return res.data;
  },

  getCustomerHistoryReport: async (customerId: string): Promise<{ success: boolean; data: CustomerApprovalHistoryReport }> => {
    const res = await apiClient.get(`/approvals/reports/customer/${customerId}`);
    return res.data;
  },

  getAgeingReport: async (params?: ReportQueryFilterParams): Promise<{ success: boolean; data: AgeingBucket[] }> => {
    const res = await apiClient.get('/approvals/reports/ageing', { params });
    return res.data;
  },

  getAuditTrail: async (id: string): Promise<{ success: boolean; data: ApprovalAuditTrailReport }> => {
    const res = await apiClient.get(`/approvals/${id}/audit-trail`);
    return res.data;
  },
};
