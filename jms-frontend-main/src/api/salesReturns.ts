import { apiClient } from './client';

export type SalesReturnStatus = 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'CANCELLED';

export interface SalesReturnItem {
  id?: string;
  salesReturnId?: string;
  salesInvoiceItemId: string;
  inventoryItemId: string;
  quantity?: number;
  originalAmount?: number | string;
  taxAmount?: number | string;
  deductionAmount?: number | string;
  refundAmount?: number | string;
  reason?: string | null;
  remarks?: string | null;
  inventoryItem?: {
    id: string;
    itemCode: string;
    grossWeight: number | string;
    netWeight: number | string;
    purity: string;
    status: string;
    product?: {
      id: string;
      name: string;
      sku: string;
    };
  };
  salesInvoiceItem?: {
    id: string;
    lineTotal: number | string;
    unitPrice: number | string;
    taxAmount: number | string;
  };
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  salesInvoiceId: string;
  customerId: string;
  branchId: string;
  status: SalesReturnStatus;
  subtotal: number | string;
  taxAmount: number | string;
  deductionAmount: number | string;
  refundAmount: number | string;
  reason?: string | null;
  remarks?: string | null;
  requestedBy?: string | null;
  approvedBy?: string | null;
  processedBy?: string | null;
  cancelledBy?: string | null;
  approvedAt?: string | null;
  processedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: SalesReturnItem[];
  refunds?: any[];
  customer?: {
    id: string;
    firstName: string;
    lastName?: string;
    mobile: string;
    email?: string;
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
    invoiceDate: string;
  };
}

export interface CreateSalesReturnPayload {
  salesInvoiceId: string;
  reason?: string;
  remarks?: string;
  items: Array<{
    salesInvoiceItemId: string;
    inventoryItemId: string;
    quantity?: number;
    deductionAmount?: number;
    reason?: string;
    remarks?: string;
  }>;
}

export interface SalesReturnFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  returnNumber?: string;
  customerId?: string;
  salesInvoiceId?: string;
  branchId?: string;
  status?: SalesReturnStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'returnNumber' | 'refundAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const salesReturnsApi = {
  create: async (payload: CreateSalesReturnPayload) => {
    const res = await apiClient.post('/sales/returns', payload);
    return res.data;
  },

  list: async (params?: SalesReturnFilterParams) => {
    const res = await apiClient.get('/sales/returns', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/sales/returns/${id}`);
    return res.data;
  },

  getHistory: async (id: string) => {
    const res = await apiClient.get(`/sales/returns/${id}/history`);
    return res.data;
  },

  approve: async (id: string, remarks?: string) => {
    const res = await apiClient.post(`/sales/returns/${id}/approve`, { remarks });
    return res.data;
  },

  process: async (id: string, remarks?: string) => {
    const res = await apiClient.post(`/sales/returns/${id}/process`, { remarks });
    return res.data;
  },

  cancel: async (id: string, cancellationReason: string, remarks?: string) => {
    const res = await apiClient.post(`/sales/returns/${id}/cancel`, { cancellationReason, remarks });
    return res.data;
  },

  getByInvoiceId: async (invoiceId: string) => {
    const res = await apiClient.get(`/sales/invoices/${invoiceId}/returns`);
    return res.data;
  },
};
