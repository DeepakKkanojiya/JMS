import { apiClient } from './client';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface SalesPayment {
  id: string;
  salesInvoiceId: string;
  paymentNumber: string;
  paymentMethod: PaymentMethod;
  amount: number | string;
  status: PaymentStatus;
  transactionReference?: string | null;
  paymentDate: string;
  remarks?: string | null;
  receivedBy?: string | null;
  reversedAt?: string | null;
  reversedBy?: string | null;
  reversalReason?: string | null;
  createdAt: string;
  updatedAt: string;
  salesInvoice?: {
    id: string;
    invoiceNumber: string;
    grandTotal: number | string;
    outstandingAmount: number | string;
    paymentStatus: string;
    customer?: {
      id: string;
      firstName: string;
      lastName?: string;
      mobile: string;
    };
  };
}

export interface CreateSalesPaymentPayload {
  salesInvoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionReference?: string | null;
  paymentDate?: string;
  remarks?: string | null;
}

export interface SalesPaymentFilterParams {
  page?: number;
  limit?: number;
  salesInvoiceId?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'createdAt' | 'paymentDate' | 'amount' | 'paymentNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface InvoicePaymentSummary {
  invoiceId: string;
  invoiceNumber: string;
  grandTotal: number | string;
  exchangeCredit: number | string;
  netPayable: number | string;
  totalPaid: number | string;
  outstandingAmount: number | string;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  payments: SalesPayment[];
}

export const salesPaymentsApi = {
  create: async (payload: CreateSalesPaymentPayload) => {
    const res = await apiClient.post('/sales/payments', payload);
    return res.data;
  },

  list: async (params?: SalesPaymentFilterParams) => {
    const res = await apiClient.get('/sales/payments', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/sales/payments/${id}`);
    return res.data;
  },

  reverse: async (id: string, reversalReason: string) => {
    const res = await apiClient.post(`/sales/payments/${id}/reverse`, { reversalReason });
    return res.data;
  },

  getInvoicePayments: async (invoiceId: string, params?: SalesPaymentFilterParams) => {
    const res = await apiClient.get(`/sales/invoices/${invoiceId}/payments`, { params });
    return res.data;
  },

  getInvoiceSummary: async (invoiceId: string): Promise<{ success: boolean; data: InvoicePaymentSummary }> => {
    const res = await apiClient.get(`/sales/invoices/${invoiceId}/payment-summary`);
    return res.data;
  },
};
