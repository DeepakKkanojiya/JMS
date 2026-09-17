import { apiClient } from './client';
import { PaymentMethod } from './salesPayments';

export type RefundStatus = 'PENDING' | 'COMPLETED' | 'REVERSED';

export interface SalesRefund {
  id: string;
  salesReturnId: string;
  refundNumber: string;
  refundMethod: PaymentMethod;
  amount: number | string;
  status: RefundStatus;
  transactionReference?: string | null;
  remarks?: string | null;
  processedBy?: string | null;
  reversedAt?: string | null;
  reversedBy?: string | null;
  reversalReason?: string | null;
  createdAt: string;
  updatedAt: string;
  salesReturn?: {
    id: string;
    returnNumber: string;
    salesInvoiceId: string;
    customerId: string;
    branchId: string;
    status: string;
    refundAmount: number | string;
    customer?: {
      id: string;
      firstName: string;
      lastName?: string;
      mobile: string;
    };
    salesInvoice?: {
      id: string;
      invoiceNumber: string;
    };
  };
}

export interface CreateSalesRefundPayload {
  salesReturnId: string;
  refundMethod: PaymentMethod;
  amount: number;
  transactionReference?: string;
  remarks?: string;
}

export interface SalesRefundFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  refundNumber?: string;
  salesReturnId?: string;
  refundMethod?: PaymentMethod;
  status?: RefundStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'refundNumber' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const salesRefundsApi = {
  create: async (payload: CreateSalesRefundPayload) => {
    const res = await apiClient.post('/sales/refunds', payload);
    return res.data;
  },

  list: async (params?: SalesRefundFilterParams) => {
    const res = await apiClient.get('/sales/refunds', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/sales/refunds/${id}`);
    return res.data;
  },

  reverse: async (id: string, reversalReason: string) => {
    const res = await apiClient.post(`/sales/refunds/${id}/reverse`, { reversalReason });
    return res.data;
  },

  getByReturnId: async (returnId: string) => {
    const res = await apiClient.get(`/sales/returns/${returnId}/refunds`);
    return res.data;
  },
};
