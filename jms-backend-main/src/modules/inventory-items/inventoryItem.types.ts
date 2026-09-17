export interface CreateInventoryItemInput {
  productId: string;
  branchId: string;
  itemCode: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight?: number;
  purity: string;
  status?: string;
  barcode?: string;
  rfidEpc?: string | null;
}

export interface UpdateInventoryItemInput {
  branchId?: string;
  grossWeight?: number;
  netWeight?: number;
  stoneWeight?: number;
  purity?: string;
  status?: string;
  barcode?: string;
  rfidEpc?: string | null;
  adjustmentReason?: string;
}

export interface InventoryItemQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  branchId?: string;
  status?: string;
  purity?: string;
  metalType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
