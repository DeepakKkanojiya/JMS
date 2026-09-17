import { apiClient } from './client';
import { GirviInterestPeriod } from './girvi';

export type ThirdPartyGirviStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export interface ThirdPartyLender {
  id: string;
  lenderCode: string;
  name: string;
  contactPerson?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  companyId: string;
  branchId?: string | null;
  company?: { id: string; name: string };
  branch?: { id: string; name: string; branchCode: string };
  createdAt: string;
  updatedAt: string;
}

export interface ThirdPartyGirviCollateral {
  id: string;
  thirdPartyGirviId: string;
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
  isReleased: boolean;
  releasedAt?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThirdPartyGirvi {
  id: string;
  referenceNumber: string;
  externalLoanNumber: string;
  companyId: string;
  company?: { id: string; name: string };
  branchId: string;
  branch?: { id: string; name: string; branchCode: string };
  customerId: string;
  customer?: { id: string; customerCode: string; firstName: string; lastName?: string; mobile: string; email?: string };
  thirdPartyLenderId: string;
  lender?: ThirdPartyLender;
  loanDate: string;
  dueDate: string;
  principalAmount: number | string;
  valuationAmount: number | string;
  interestRate: number | string;
  interestPeriod: GirviInterestPeriod;
  status: ThirdPartyGirviStatus;
  notes?: string | null;
  documentRef?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  closedBy?: string | null;
  closedAt?: string | null;
  closureReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  collaterals?: ThirdPartyGirviCollateral[];
}

export interface CreateThirdPartyLenderPayload {
  companyId: string;
  branchId?: string;
  lenderCode?: string;
  name: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  address?: string;
}

export interface CreateThirdPartyCollateralInput {
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

export interface CreateThirdPartyGirviPayload {
  companyId: string;
  branchId: string;
  customerId: string;
  thirdPartyLenderId: string;
  externalLoanNumber: string;
  dueDate: string;
  loanDate?: string;
  principalAmount: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
  collaterals?: CreateThirdPartyCollateralInput[];
}

export interface UpdateThirdPartyGirviPayload {
  externalLoanNumber?: string;
  thirdPartyLenderId?: string;
  dueDate?: string;
  principalAmount?: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string | null;
  documentRef?: string | null;
}

export interface ThirdPartyGirviFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  thirdPartyLenderId?: string;
  status?: ThirdPartyGirviStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const thirdPartyGirviApi = {
  // Lenders
  createLender: async (payload: CreateThirdPartyLenderPayload) => {
    const res = await apiClient.post('/girvi/third-party/lenders', payload);
    return res.data;
  },

  listLenders: async (companyId?: string, branchId?: string) => {
    const res = await apiClient.get('/girvi/third-party/lenders', { params: { companyId, branchId } });
    return res.data;
  },

  // Third-Party Girvi Loans
  createThirdPartyGirvi: async (payload: CreateThirdPartyGirviPayload) => {
    const res = await apiClient.post('/girvi/third-party/loans', payload);
    return res.data;
  },

  listThirdPartyLoans: async (params?: ThirdPartyGirviFilterParams) => {
    const res = await apiClient.get('/girvi/third-party/loans', { params });
    return res.data;
  },

  getThirdPartyGirviById: async (id: string) => {
    const res = await apiClient.get(`/girvi/third-party/loans/${id}`);
    return res.data;
  },

  updateThirdPartyGirvi: async (id: string, payload: UpdateThirdPartyGirviPayload) => {
    const res = await apiClient.put(`/girvi/third-party/loans/${id}`, payload);
    return res.data;
  },

  approveThirdPartyGirvi: async (id: string) => {
    const res = await apiClient.post(`/girvi/third-party/loans/${id}/approve`);
    return res.data;
  },

  closeThirdPartyGirvi: async (id: string, closureReason?: string, remarks?: string) => {
    const res = await apiClient.post(`/girvi/third-party/loans/${id}/close`, { closureReason, remarks });
    return res.data;
  },

  cancelThirdPartyGirvi: async (id: string, cancellationReason: string) => {
    const res = await apiClient.post(`/girvi/third-party/loans/${id}/cancel`, { cancellationReason });
    return res.data;
  },

  addCollateral: async (id: string, collateral: CreateThirdPartyCollateralInput) => {
    const res = await apiClient.post(`/girvi/third-party/loans/${id}/collaterals`, collateral);
    return res.data;
  },

  releaseCollateral: async (collateralId: string, remarks?: string) => {
    const res = await apiClient.post(`/girvi/third-party/collaterals/${collateralId}/release`, { remarks });
    return res.data;
  },
};
