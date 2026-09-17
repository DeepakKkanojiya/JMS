export interface CreateStockMovementDTO {
  inventoryItemId: string;
  fromBranchId?: string | null;
  toBranchId?: string | null;
  movementType: string;
  referenceType?: string | null;
  referenceId?: string | null;
  remarks?: string | null;
}

export interface StockMovementQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  inventoryItemId?: string;
  fromBranchId?: string;
  toBranchId?: string;
  branchId?: string;
  movementType?: string;
  referenceType?: string;
  referenceId?: string;
  performedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
