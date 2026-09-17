import { apiClient } from './client';

export type SalesInvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SalesInvoiceItem {
  id: string;
  salesInvoiceId: string;
  inventoryItemId: string;
  inventoryItem?: {
    id: string;
    itemCode: string;
    grossWeight: number | string;
    netWeight: number | string;
    stoneWeight: number | string;
    purity: string;
    status: string;
    product?: {
      id: string;
      name: string;
      sku: string;
      metalType: string;
    };
    images?: Array<{ id: string; imageUrl: string; isPrimary: boolean }>;
  };
  quantity: number;
  unitPrice: number | string;
  metalValue: number | string;
  wastagePercent: number | string;
  wastageWeight: number | string;
  wastageValue: number | string;
  makingChargeType?: 'PER_GRAM' | 'FIXED' | 'PERCENTAGE' | null;
  makingChargeRate: number | string;
  makingChargeAmount: number | string;
  taxableAmount: number | string;
  taxRate: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  lineTotal: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesInvoiceMetalRateSnapshot {
  id: string;
  salesInvoiceId: string;
  metalRateId?: string | null;
  metalType: 'GOLD' | 'SILVER' | 'PLATINUM';
  purity: string;
  ratePerGram: number | string;
  lockedAt: string;
  createdAt: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: {
    id: string;
    customerCode?: string;
    firstName: string;
    lastName?: string;
    mobile: string;
    email?: string;
    city?: string;
  };
  branchId: string;
  branch?: {
    id: string;
    name: string;
    branchCode: string;
    city?: string;
  };
  salespersonId?: string | null;
  salesperson?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName?: string;
    designation?: string;
  } | null;
  status: SalesInvoiceStatus;
  invoiceDate: string;
  subtotal: number | string;
  metalValue: number | string;
  wastageValue: number | string;
  makingCharges: number | string;
  taxableAmount: number | string;
  discountAmount: number | string;
  cgstAmount: number | string;
  sgstAmount: number | string;
  igstAmount: number | string;
  taxAmount: number | string;
  grandTotal: number | string;
  pricingCalculated: boolean;
  pricingCalculatedAt?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  metalRateLocked: boolean;
  metalRateLockedAt?: string | null;
  totalPaid: number | string;
  outstandingAmount: number | string;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  exchangeCredit: number | string;
  createdAt: string;
  updatedAt: string;
  items?: SalesInvoiceItem[];
  metalRateSnapshot?: SalesInvoiceMetalRateSnapshot | null;
  payments?: any[];
  goldExchanges?: any[];
  salesReturns?: any[];
}

export interface CreateSalesInvoiceItemPayload {
  inventoryItemId: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
}

export interface CreateSalesInvoicePayload {
  customerId: string;
  branchId: string;
  salespersonId?: string | null;
  invoiceDate?: string;
  notes?: string | null;
  items: CreateSalesInvoiceItemPayload[];
}

export interface UpdateSalesInvoicePayload {
  customerId?: string;
  branchId?: string;
  salespersonId?: string | null;
  notes?: string | null;
  items?: CreateSalesInvoiceItemPayload[];
}

export interface SalesInvoiceFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  customerId?: string;
  salespersonId?: string;
  status?: SalesInvoiceStatus | '';
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'invoiceNumber' | 'invoiceDate' | 'grandTotal';
  sortOrder?: 'asc' | 'desc';
}

export interface PosAvailableItem {
  id: string;
  productId: string;
  branchId: string;
  itemCode: string;
  grossWeight: number | string;
  netWeight: number | string;
  stoneWeight: number | string;
  purity: string;
  status: string;
  product: {
    id: string;
    name: string;
    sku: string;
    metalType: string;
    purity: string;
    grossWeight: number | string;
    netWeight: number | string;
    subCategory?: {
      id: string;
      name: string;
      category?: {
        id: string;
        name: string;
      };
    };
  };
  branch: {
    id: string;
    name: string;
    branchCode: string;
  };
  inventoryTag?: {
    barcode: string;
    qrCode: string;
    rfidEpc?: string | null;
  } | null;
  images?: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    isPrimary: boolean;
  }>;
}

export const salesInvoiceApi = {
  list: async (params?: SalesInvoiceFilterParams) => {
    const res = await apiClient.get('/sales/invoices', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/sales/invoices/${id}`);
    return res.data;
  },

  getItems: async (id: string) => {
    const res = await apiClient.get(`/sales/invoices/${id}/items`);
    return res.data;
  },

  create: async (payload: CreateSalesInvoicePayload) => {
    const res = await apiClient.post('/sales/invoices', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateSalesInvoicePayload) => {
    const res = await apiClient.put(`/sales/invoices/${id}`, payload);
    return res.data;
  },

  lockMetalRate: async (id: string) => {
    const res = await apiClient.post(`/sales/invoices/${id}/lock-metal-rate`);
    return res.data;
  },

  getMetalRate: async (id: string) => {
    const res = await apiClient.get(`/sales/invoices/${id}/metal-rate`);
    return res.data;
  },

  recalculatePricing: async (id: string, options?: {
    taxType?: 'INTRA_STATE' | 'INTER_STATE';
    wastagePercent?: number;
    makingChargeType?: 'PER_GRAM' | 'FIXED' | 'PERCENTAGE';
    makingChargeRate?: number;
    taxRate?: number;
  }) => {
    const res = await apiClient.post(`/sales/invoices/${id}/calculate-pricing`, options || {});
    return res.data;
  },

  confirm: async (id: string) => {
    const res = await apiClient.post(`/sales/invoices/${id}/confirm`);
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await apiClient.post(`/sales/invoices/${id}/cancel`);
    return res.data;
  },

  lookupPosItem: async (identifier: string): Promise<{ success: boolean; data: PosAvailableItem }> => {
    const res = await apiClient.get(`/sales/pos/inventory/${encodeURIComponent(identifier)}`);
    return res.data;
  },
};
