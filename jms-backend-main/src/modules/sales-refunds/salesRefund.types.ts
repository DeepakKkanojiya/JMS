import { PaymentMethod, RefundStatus, Prisma } from '../../generated/prisma';

export interface CreateSalesRefundDTO {
  salesReturnId: string;
  refundMethod: PaymentMethod;
  amount: number;
  transactionReference?: string;
  remarks?: string;
}

export interface ReverseSalesRefundDTO {
  reversalReason: string;
}

export interface SalesRefundFilters {
  search?: string;
  refundNumber?: string;
  salesReturnId?: string;
  refundMethod?: PaymentMethod;
  status?: RefundStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
