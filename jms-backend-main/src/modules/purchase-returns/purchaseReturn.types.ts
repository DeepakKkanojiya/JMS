import { PurchaseReturnStatus, DebitNoteStatus } from '../../generated/prisma';

export interface CreatePurchaseReturnItemDTO {
  purchaseBillItemId?: string;
  inventoryItemId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  purchaseRate: number;
  makingCharges?: number;
  taxRate?: number;
}

export interface CreatePurchaseReturnDTO {
  purchaseBillId?: string;
  purchaseOrderId?: string;
  vendorId: string;
  branchId: string;
  reason?: string;
  notes?: string;
  items: CreatePurchaseReturnItemDTO[];
}

export interface UpdatePurchaseReturnDTO {
  reason?: string;
  notes?: string;
}

export interface CancelPurchaseReturnDTO {
  cancellationReason: string;
}

export interface PurchaseReturnQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  purchaseBillId?: string;
  purchaseOrderId?: string;
  branchId?: string;
  status?: PurchaseReturnStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DebitNoteQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  vendorId?: string;
  purchaseBillId?: string;
  branchId?: string;
  status?: DebitNoteStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
