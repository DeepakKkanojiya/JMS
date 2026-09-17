import { TransferStatus } from '../../generated/prisma';

export interface CreateTransferDTO {
  inventoryItemId: string;
  toBranchId: string;
  fromBranchId?: string;
  remarks?: string;
}

export interface RejectTransferDTO {
  rejectionReason: string;
}

export interface InventoryTransferQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransferStatus;
  fromBranchId?: string;
  toBranchId?: string;
  inventoryItemId?: string;
  transferCode?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
