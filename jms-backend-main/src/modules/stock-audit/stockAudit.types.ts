import { AuditSessionStatus, AuditItemStatus } from '../../generated/prisma';

export interface CreateStockAuditSessionDTO {
  companyId: string;
  branchId: string;
  categoryId?: string;
  notes?: string;
}

export interface ScanAuditItemDTO {
  identifier: string; // Barcode, RFID EPC, or InventoryItem ID
  scannedGrossWeight?: number;
  scannedNetWeight?: number;
  remarks?: string;
}

export interface CancelStockAuditSessionDTO {
  cancellationReason: string;
}

export interface StockAuditSessionQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  categoryId?: string;
  status?: AuditSessionStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
