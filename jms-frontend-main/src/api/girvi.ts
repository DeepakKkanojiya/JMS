import { apiClient } from './client';

export type GirviLoanStatus = 'DRAFT' | 'ACTIVE' | 'RENEWED' | 'CLOSED' | 'DEFAULTED' | 'CANCELLED';
export type GirviInterestPeriod = 'MONTHLY' | 'ANNUAL';
export type GirviPaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
export type GirviCollectionStatus = 'COMPLETED' | 'REVERSED';

export interface GirviCollateral {
  id: string;
  girviLoanId: string;
  inventoryItemId?: string | null;
  inventoryItem?: any;
  itemName: string;
  metalType: string;
  purity: string;
  grossWeight: number | string;
  stoneWeight: number | string;
  netWeight: number | string;
  valuedAmount: number | string;
  barcode?: string | null;
  rfidEpc?: string | null;
  imageUrl?: string | null;
  remarks?: string | null;
  isReleased: boolean;
  releasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GirviLoan {
  id: string;
  loanNumber: string;
  companyId: string;
  company?: { id: string; name: string };
  branchId: string;
  branch?: { id: string; name: string; branchCode: string };
  customerId: string;
  customer?: { id: string; customerCode: string; firstName: string; lastName?: string; mobile: string; email?: string };
  loanDate: string;
  dueDate: string;
  principalAmount: number | string;
  valuationAmount: number | string;
  interestRate: number | string;
  interestPeriod: GirviInterestPeriod;
  status: GirviLoanStatus;
  notes?: string | null;
  documentRef?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  closedBy?: string | null;
  closedAt?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  collaterals?: GirviCollateral[];
  collections?: GirviCollection[];
  renewals?: GirviRenewal[];
  settlement?: GirviSettlement | null;
}

export interface GirviFinancialSummary {
  loanId: string;
  loanNumber: string;
  principalAmount: number;
  interestRate: number;
  loanDate: string;
  dueDate: string;
  asOfDate: string;
  elapsedDays: number;
  elapsedMonths: number;
  accruedInterest: number;
  collectedInterest: number;
  collectedPrincipal: number;
  totalCollected: number;
  principalOutstanding: number;
  interestOutstanding: number;
  totalOutstanding: number;
  isOverdue: boolean;
  overdueDays: number;
}

export interface GirviCollection {
  id: string;
  collectionNumber: string;
  girviLoanId: string;
  girviLoan?: GirviLoan;
  paymentMethod: GirviPaymentMethod;
  amount: number | string;
  principalAmount: number | string;
  interestAmount: number | string;
  transactionReference?: string | null;
  collectionDate: string;
  status: GirviCollectionStatus;
  reversalReason?: string | null;
  reversedAt?: string | null;
  reversedBy?: string | null;
  receivedBy?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GirviRenewal {
  id: string;
  girviLoanId: string;
  previousDueDate: string;
  newDueDate: string;
  accruedInterestAtRenewal: number | string;
  principalAtRenewal: number | string;
  interestPaidAtRenewal: number | string;
  renewedBy?: string | null;
  remarks?: string | null;
  createdAt: string;
}

export interface GirviSettlement {
  id: string;
  settlementNumber: string;
  girviLoanId: string;
  girviLoan?: GirviLoan;
  paymentMethod: GirviPaymentMethod;
  totalSettlementAmount: number | string;
  principalSettled: number | string;
  interestSettled: number | string;
  transactionReference?: string | null;
  settlementDate: string;
  remarks?: string | null;
  settledBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GirviAuditEvent {
  eventType: string;
  timestamp: string;
  description: string;
  performedBy?: string | null;
  details?: any;
}

export interface GirviAuditTrailResponse {
  loanId: string;
  loanNumber: string;
  status: GirviLoanStatus;
  customerName: string;
  customerMobile: string;
  totalEvents: number;
  events: GirviAuditEvent[];
}

export interface GirviPortfolioReport {
  totalLoansCount: number;
  activeLoansCount: number;
  closedLoansCount: number;
  totalPrincipalIssued: number;
  totalPrincipalOutstanding: number;
  totalAccruedInterest: number;
  totalCollectedInterest: number;
  totalCollectedPrincipal: number;
  totalInterestOutstanding: number;
  totalPortfolioOutstanding: number;
}

export interface GirviOverdueAgingReport {
  current: { count: number; totalOutstanding: number };
  days1To30: { count: number; totalOutstanding: number };
  days31To60: { count: number; totalOutstanding: number };
  days61To90: { count: number; totalOutstanding: number };
  days90Plus: { count: number; totalOutstanding: number };
}

export interface CreateGirviCollateralInput {
  inventoryItemId?: string | null;
  itemName: string;
  metalType?: string;
  purity?: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  valuedAmount?: number;
  barcode?: string | null;
  rfidEpc?: string | null;
  imageUrl?: string | null;
  remarks?: string | null;
}

export interface CreateGirviLoanPayload {
  companyId: string;
  branchId: string;
  customerId: string;
  dueDate: string;
  principalAmount: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
  collaterals?: CreateGirviCollateralInput[];
}

export interface UpdateGirviLoanPayload {
  dueDate?: string;
  principalAmount?: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
}

export interface GirviLoanFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  status?: GirviLoanStatus;
  fromDate?: string;
  toDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  overdue?: boolean;
  renewed?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateGirviCollectionPayload {
  girviLoanId: string;
  paymentMethod: GirviPaymentMethod;
  amount: number;
  principalAmount?: number;
  interestAmount?: number;
  transactionReference?: string | null;
  collectionDate?: string;
  remarks?: string | null;
}

export interface CollectionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  girviLoanId?: string;
  paymentMethod?: GirviPaymentMethod;
  status?: GirviCollectionStatus;
  fromDate?: string;
  toDate?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SettleGirviLoanPayload {
  paymentMethod: GirviPaymentMethod;
  totalSettlementAmount?: number;
  principalSettled?: number;
  interestSettled?: number;
  transactionReference?: string | null;
  settlementDate?: string;
  remarks?: string | null;
}

export interface SettlementFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  girviLoanId?: string;
  paymentMethod?: GirviPaymentMethod;
  fromDate?: string;
  toDate?: string;
  companyId?: string;
  branchId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const girviApi = {
  // Self Girvi Loans
  createLoan: async (payload: CreateGirviLoanPayload) => {
    const res = await apiClient.post('/girvi/loans', payload);
    return res.data;
  },

  listLoans: async (params?: GirviLoanFilterParams) => {
    const res = await apiClient.get('/girvi/loans', { params });
    return res.data;
  },

  getLoanById: async (id: string) => {
    const res = await apiClient.get(`/girvi/loans/${id}`);
    return res.data;
  },

  updateLoan: async (id: string, payload: UpdateGirviLoanPayload) => {
    const res = await apiClient.put(`/girvi/loans/${id}`, payload);
    return res.data;
  },

  approveLoan: async (id: string) => {
    const res = await apiClient.post(`/girvi/loans/${id}/approve`);
    return res.data;
  },

  cancelLoan: async (id: string, cancellationReason: string) => {
    const res = await apiClient.post(`/girvi/loans/${id}/cancel`, { cancellationReason });
    return res.data;
  },

  addCollateral: async (id: string, collateral: CreateGirviCollateralInput) => {
    const res = await apiClient.post(`/girvi/loans/${id}/collaterals`, collateral);
    return res.data;
  },

  // Financial Summary & Overdue
  getFinancialSummary: async (id: string, asOfDate?: string): Promise<{ success: boolean; data: GirviFinancialSummary }> => {
    const res = await apiClient.get(`/girvi/loans/${id}/financial-summary`, { params: { asOfDate } });
    return res.data;
  },

  listOverdueLoans: async (params?: { page?: number; limit?: number; branchId?: string; companyId?: string; daysThreshold?: number }) => {
    const res = await apiClient.get('/girvi/overdue-loans', { params });
    return res.data;
  },

  // Collections
  createCollection: async (payload: CreateGirviCollectionPayload) => {
    const res = await apiClient.post('/girvi/collections', payload);
    return res.data;
  },

  listCollections: async (params?: CollectionFilterParams) => {
    const res = await apiClient.get('/girvi/collections', { params });
    return res.data;
  },

  getCollectionById: async (id: string) => {
    const res = await apiClient.get(`/girvi/collections/${id}`);
    return res.data;
  },

  getLoanCollections: async (loanId: string) => {
    const res = await apiClient.get(`/girvi/loans/${loanId}/collections`);
    return res.data;
  },

  reverseCollection: async (id: string, reversalReason: string) => {
    const res = await apiClient.post(`/girvi/collections/${id}/reverse`, { reversalReason });
    return res.data;
  },

  // Renewal
  renewLoan: async (id: string, newDueDate: string, remarks?: string) => {
    const res = await apiClient.post(`/girvi/loans/${id}/renew`, { newDueDate, remarks });
    return res.data;
  },

  // Settlement & Collateral Release
  settleLoan: async (id: string, payload: SettleGirviLoanPayload) => {
    const res = await apiClient.post(`/girvi/loans/${id}/settle`, payload);
    return res.data;
  },

  listSettlements: async (params?: SettlementFilterParams) => {
    const res = await apiClient.get('/girvi/settlements', { params });
    return res.data;
  },

  getSettlementById: async (id: string) => {
    const res = await apiClient.get(`/girvi/settlements/${id}`);
    return res.data;
  },

  getLoanSettlement: async (loanId: string) => {
    const res = await apiClient.get(`/girvi/loans/${loanId}/settlement`);
    return res.data;
  },

  getReleasedCollateral: async (loanId: string) => {
    const res = await apiClient.get(`/girvi/loans/${loanId}/released-collateral`);
    return res.data;
  },

  // Audit Trail & Reports
  getAuditTrail: async (loanId: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<{ success: boolean; data: GirviAuditTrailResponse }> => {
    const res = await apiClient.get(`/girvi/loans/${loanId}/audit-trail`, { params: { sortOrder } });
    return res.data;
  },

  getPortfolioReport: async (companyId?: string, branchId?: string): Promise<{ success: boolean; data: GirviPortfolioReport }> => {
    const res = await apiClient.get('/girvi/reports/portfolio', { params: { companyId, branchId } });
    return res.data;
  },

  getOverdueAgingReport: async (companyId?: string, branchId?: string): Promise<{ success: boolean; data: GirviOverdueAgingReport }> => {
    const res = await apiClient.get('/girvi/reports/overdue-aging', { params: { companyId, branchId } });
    return res.data;
  },
};
