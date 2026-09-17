export interface CreateInventoryTagDTO {
  barcode?: string;
  rfidEpc?: string | null;
  isActive?: boolean;
}

export interface UpdateInventoryTagDTO {
  barcode?: string;
  rfidEpc?: string | null;
  isActive?: boolean;
}

export interface UpdateTagStatusDTO {
  isActive: boolean;
}

export interface InventoryTagQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  barcode?: string;
  inventoryItemId?: string;
  branchId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
