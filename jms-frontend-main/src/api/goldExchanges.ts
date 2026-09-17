import { apiClient } from './client';
import { MetalType } from './metalRates';

export type ExchangeStatus = 'REQUESTED' | 'VALUED' | 'APPLIED' | 'CANCELLED';

export interface GoldExchangeItem {
  id?: string;
  exchangeId?: string;
  metalType: MetalType;
  purity: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight?: number;
  metalRateId?: string | null;
  ratePerGram?: number | string;
  metalValue?: number | string;
  deductionPercent?: number;
  deductionAmount?: number | string;
  exchangeValue?: number | string;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerGoldExchange {
  id: string;
  exchangeNumber: string;
  salesInvoiceId: string;
  customerId: string;
  branchId: string;
  status: ExchangeStatus;
  totalGrossWeight: number | string;
  totalStoneWeight: number | string;
  totalNetWeight: number | string;
  totalMetalValue: number | string;
  totalDeductionAmount: number | string;
  totalExchangeValue: number | string;
  remarks?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  appliedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: GoldExchangeItem[];
  customer?: {
    id: string;
    firstName: string;
    lastName?: string;
    mobile: string;
  };
  branch?: {
    id: string;
    name: string;
    branchCode: string;
  };
  salesInvoice?: {
    id: string;
    invoiceNumber: string;
    grandTotal: number | string;
    status: string;
  };
}

export interface CreateGoldExchangePayload {
  customerId?: string;
  remarks?: string;
  items: Array<{
    metalType: MetalType;
    purity: string;
    grossWeight: number;
    stoneWeight?: number;
    deductionPercent?: number;
    remarks?: string;
  }>;
}

export interface GoldExchangeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  exchangeNumber?: string;
  customerId?: string;
  salesInvoiceId?: string;
  branchId?: string;
  status?: ExchangeStatus;
  metalType?: MetalType;
  purity?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const goldExchangesApi = {
  createForInvoice: async (invoiceId: string, payload: CreateGoldExchangePayload) => {
    const res = await apiClient.post(`/sales/invoices/${invoiceId}/gold-exchanges`, payload);
    return res.data;
  },

  getInvoiceExchanges: async (invoiceId: string) => {
    const res = await apiClient.get(`/sales/invoices/${invoiceId}/gold-exchanges`);
    return res.data;
  },

  list: async (params?: GoldExchangeFilterParams) => {
    const res = await apiClient.get('/gold-exchanges', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/gold-exchanges/${id}`);
    return res.data;
  },

  valueExchange: async (id: string) => {
    const res = await apiClient.post(`/gold-exchanges/${id}/value`);
    return res.data;
  },

  applyExchange: async (id: string) => {
    const res = await apiClient.post(`/gold-exchanges/${id}/apply`);
    return res.data;
  },

  cancelExchange: async (id: string) => {
    const res = await apiClient.post(`/gold-exchanges/${id}/cancel`);
    return res.data;
  },

  getHistory: async (id: string) => {
    const res = await apiClient.get(`/gold-exchanges/${id}/history`);
    return res.data;
  },
};
