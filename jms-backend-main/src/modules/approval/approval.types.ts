import { ApprovalStatus, ApprovalItemStatus, PaymentMethod, PaymentStatus } from '../../generated/prisma';

export interface CreateApprovalItemInput {
  inventoryItemId: string;
  quantity?: number;
  unitPrice?: number;
  notes?: string;
}

export interface CreateApprovalDTO {
  companyId: string;
  branchId: string;
  customerId: string;
  salespersonId?: string;
  dueDate: string;
  notes?: string;
  requiredDepositAmount?: number;
  items: CreateApprovalItemInput[];
  createdBy?: string;
}

export interface UpdateApprovalDTO {
  customerId?: string;
  salespersonId?: string;
  dueDate?: string;
  notes?: string;
  requiredDepositAmount?: number;
  items?: CreateApprovalItemInput[];
  updatedBy?: string;
}

export interface ApprovalQueryDTO {
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateApprovalDepositDTO {
  approvalId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionReference?: string;
  paymentDate?: string;
  remarks?: string;
  receivedBy?: string;
}

export interface ReverseApprovalDepositDTO {
  reversalReason: string;
  reversedBy?: string;
}

export interface ApprovalDepositQueryDTO {
  page?: number | string;
  limit?: number | string;
  search?: string;
  companyId?: string;
  branchId?: string;
  customerId?: string;
  approvalId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export enum DepositSummaryStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
}

export interface ApprovalDepositSummary {
  approvalId: string;
  approvalNumber: string;
  requiredDeposit: number;
  completedDeposit: number;
  reversedDeposit: number;
  outstandingDeposit: number;
  depositStatus: DepositSummaryStatus;
}

export interface ReturnApprovalDTO {
  returnReason?: string;
}

export interface PurchaseApprovalDTO {
  notes?: string;
  discountAmount?: number;
}
