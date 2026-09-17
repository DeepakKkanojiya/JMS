import { VendorPaymentMethod, VendorPaymentStatus } from '../../generated/prisma';

export interface CreateVendorPaymentInput {
  purchaseBillId: string;
  vendorId: string;
  branchId: string;
  amount: number;
  paymentMethod: VendorPaymentMethod;
  transactionReference?: string;
  paymentDate?: string;
  remarks?: string;
}

export interface ReverseVendorPaymentInput {
  reversalReason: string;
}

export interface VendorPaymentQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  purchaseBillId?: string;
  branchId?: string;
  companyId?: string;
  paymentMethod?: VendorPaymentMethod;
  status?: VendorPaymentStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
