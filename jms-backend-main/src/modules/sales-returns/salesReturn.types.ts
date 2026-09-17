import { SalesReturnStatus, Prisma } from '../../generated/prisma';

export interface CreateSalesReturnDTO {
  salesInvoiceId: string;
  reason?: string;
  remarks?: string;
  items: {
    salesInvoiceItemId: string;
    inventoryItemId: string;
    quantity?: number;
    deductionAmount?: number;
    reason?: string;
    remarks?: string;
  }[];
}

export interface ApproveSalesReturnDTO {
  remarks?: string;
}

export interface ProcessSalesReturnDTO {
  remarks?: string;
}

export interface CancelSalesReturnDTO {
  cancellationReason: string;
  remarks?: string;
}

export interface SalesReturnFilters {
  search?: string;
  returnNumber?: string;
  customerId?: string;
  salesInvoiceId?: string;
  branchId?: string;
  status?: SalesReturnStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
