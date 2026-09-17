import { JobWorkOrderStatus, JobWorkItemType } from '../../generated/prisma';

export interface CreateJobWorkOrderDTO {
  companyId: string;
  branchId: string;
  vendorId: string;
  targetItemName: string;
  metalType?: string;
  purity?: string;
  expectedDeliveryDate?: string;
  agreedWastagePercent?: number;
  agreedMakingChargePerGram?: number;
  notes?: string;
}

export interface UpdateJobWorkOrderDTO {
  targetItemName?: string;
  metalType?: string;
  purity?: string;
  expectedDeliveryDate?: string;
  agreedWastagePercent?: number;
  agreedMakingChargePerGram?: number;
  notes?: string;
}

export interface IssueMaterialDTO {
  itemType?: JobWorkItemType;
  inventoryItemId?: string;
  description: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  purity: string;
  fineWeight: number;
}

export interface ReceiveJobWorkDTO {
  itemName: string;
  grossWeight: number;
  stoneWeight?: number;
  netWeight: number;
  purity: string;
  fineWeight: number;
  actualWastageWeight?: number;
  makingCharges?: number;
  remarks?: string;
  createInventoryItem?: boolean;
  productId?: string;
}

export interface CancelJobWorkOrderDTO {
  cancellationReason: string;
}

export interface JobWorkOrderQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  branchId?: string;
  vendorId?: string;
  status?: JobWorkOrderStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
