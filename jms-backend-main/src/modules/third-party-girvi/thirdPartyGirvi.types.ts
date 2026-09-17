import { ThirdPartyGirviStatus, GirviInterestPeriod } from '../../generated/prisma';

export interface CreateThirdPartyLenderDTO {
  companyId: string;
  branchId?: string;
  lenderCode: string;
  name: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  address?: string;
}

export interface CreateThirdPartyCollateralDTO {
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

export interface CreateThirdPartyGirviDTO {
  companyId: string;
  branchId: string;
  customerId: string;
  thirdPartyLenderId: string;
  externalLoanNumber: string;
  dueDate: string;
  principalAmount: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string;
  documentRef?: string;
  collaterals?: CreateThirdPartyCollateralDTO[];
}

export interface UpdateThirdPartyGirviDTO {
  dueDate?: string;
  principalAmount?: number;
  valuationAmount?: number;
  interestRate?: number;
  interestPeriod?: GirviInterestPeriod;
  notes?: string;
  documentRef?: string;
}

export interface CloseThirdPartyGirviDTO {
  closureReason: string;
}

export interface CancelThirdPartyGirviDTO {
  cancellationReason: string;
}

export interface ThirdPartyGirviQueryDTO {
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
