import { PurchaseBillStatus } from '../../generated/prisma';

export interface CreatePurchaseBillItemInput {
  purchaseOrderItemId?: string;
  purchaseReceiptItemId?: string;
  inventoryItemId?: string;
  itemName: string;
  description?: string;
  quantity?: number;
  grossWeight?: number;
  stoneWeight?: number;
  netWeight?: number;
  purchaseRate?: number;
  makingCharges?: number;
  discountAmount?: number;
  taxRate?: number;
}

export interface CreatePurchaseBillInput {
  purchaseOrderId: string;
  vendorId: string;
  branchId: string;
  billDate?: string;
  dueDate?: string;
  discountAmount?: number;
  notes?: string;
  items: CreatePurchaseBillItemInput[];
}

export interface UpdatePurchaseBillInput {
  dueDate?: string;
  discountAmount?: number;
  notes?: string;
  items?: CreatePurchaseBillItemInput[];
}

export interface CancelPurchaseBillInput {
  cancellationReason: string;
}

export interface PurchaseBillQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  branchId?: string;
  companyId?: string;
  purchaseOrderId?: string;
  status?: PurchaseBillStatus | string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
