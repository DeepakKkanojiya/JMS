import { GirviLoanStatus, GirviInterestPeriod, GirviCollectionStatus, GirviPaymentMethod } from '../../generated/prisma';

export interface CreateGirviCollateralDTO {
  inventoryItemId?: string;
  itemName: string;
  metalType?: string;
  purity?: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  valuedAmount?: number;
  barcode?: string;
  rfidEpc?: string;
  imageUrl?: string;
  remarks?: string;
}

export interface CreateGirviLoanDTO {
  companyId: string;
  branchId: string;
  customerId: string;
  dueDate: string;
  principalAmount: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string;
  documentRef?: string;
  collaterals?: CreateGirviCollateralDTO[];
}

export interface UpdateGirviLoanDTO {
  dueDate?: string;
  principalAmount?: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string;
  documentRef?: string;
}

export interface CancelGirviLoanDTO {
  cancellationReason: string;
}

export interface AddCollateralDTO extends CreateGirviCollateralDTO {}

export interface GirviLoanQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  status?: GirviLoanStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateGirviCollectionDTO {
  girviLoanId: string;
  paymentMethod: GirviPaymentMethod;
  amount: number;
  principalAmount?: number;
  interestAmount?: number;
  transactionReference?: string;
  collectionDate?: string;
  remarks?: string;
}

export interface ReverseGirviCollectionDTO {
  reversalReason: string;
}

export interface RenewGirviLoanDTO {
  newDueDate: string;
  remarks?: string;
}

export interface GirviCollectionQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  girviLoanId?: string;
  paymentMethod?: GirviPaymentMethod;
  status?: GirviCollectionStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OverdueLoansQueryDTO {
  page?: number;
  limit?: number;
  branchId?: string;
  companyId?: string;
  daysThreshold?: number; // Filter due-soon within X days or overdue
}

export interface SettleGirviLoanDTO {
  paymentMethod: GirviPaymentMethod;
  totalSettlementAmount?: number;
  principalSettled?: number;
  interestSettled?: number;
  transactionReference?: string;
  settlementDate?: string;
  remarks?: string;
}

export interface GirviSettlementQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  girviLoanId?: string;
  paymentMethod?: GirviPaymentMethod;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GirviReportQueryDTO {
  companyId?: string;
  branchId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GirviAuditQueryDTO {
  girviLoanId?: string;
  sortOrder?: 'asc' | 'desc';
}


