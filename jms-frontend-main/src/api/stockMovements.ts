import { apiClient } from './client';

export type MovementType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'SALE'
  | 'SALE_RETURN'
  | 'PURCHASE'
  | 'PURCHASE_RETURN'
  | 'REPAIR_OUT'
  | 'REPAIR_IN'
  | 'APPROVAL_OUT'
  | 'APPROVAL_RETURN';

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  fromBranchId?: string;
  toBranchId?: string;
  movementType: MovementType;
  referenceType?: string;
  referenceId?: string;
  remarks?: string;
  performedBy?: string;
  createdAt: string;
  inventoryItem?: any;
  fromBranch?: any;
  toBranch?: any;
  performedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export const stockMovementsApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/stock-movements', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/stock-movements/${id}`);
    return res.data;
  },

  create: async (data: {
    inventoryItemId: string;
    fromBranchId?: string;
    toBranchId?: string;
    movementType: MovementType;
    referenceType?: string;
    referenceId?: string;
    remarks?: string;
  }) => {
    const res = await apiClient.post('/stock-movements', data);
    return res.data;
  },
  // Note: PUT and DELETE endpoints do NOT exist because stock movements are immutable audit records.
};
