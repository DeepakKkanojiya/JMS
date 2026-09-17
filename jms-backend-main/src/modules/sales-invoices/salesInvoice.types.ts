import { SalesInvoiceStatus } from '../../generated/prisma';

export interface CreateSalesInvoiceItemInput {
  inventoryItemId: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
}

export interface CreateSalesInvoiceInput {
  customerId: string;
  branchId: string;
  salespersonId?: string;
  invoiceDate?: string;
  notes?: string;
  items: CreateSalesInvoiceItemInput[];
}

export interface UpdateSalesInvoiceItemInput {
  inventoryItemId: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
}

export interface UpdateSalesInvoiceInput {
  customerId?: string;
  branchId?: string;
  salespersonId?: string;
  notes?: string;
  items?: UpdateSalesInvoiceItemInput[];
}

export interface SalesInvoiceQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  customerId?: string;
  salespersonId?: string;
  status?: SalesInvoiceStatus | string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'invoiceNumber' | 'invoiceDate' | 'grandTotal';
  sortOrder?: 'asc' | 'desc';
}
