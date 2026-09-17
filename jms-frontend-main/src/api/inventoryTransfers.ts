import { apiClient } from './client';

export type TransferStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';

export interface InventoryTransfer {
  id: string;
  transferCode: string;
  inventoryItemId: string;
  fromBranchId: string;
  toBranchId: string;
  status: TransferStatus;
  remarks?: string;
  rejectionReason?: string;
  requestedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  inventoryItem?: any;
  fromBranch?: any;
  toBranch?: any;
  requestedByUser?: any;
  approvedByUser?: any;
  rejectedByUser?: any;
  dispatchedByUser?: any;
  receivedByUser?: any;
}

export const inventoryTransfersApi = {
  list: async (params?: any) => {
    const res = await apiClient.get('/inventory-transfers', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/inventory-transfers/${id}`);
    return res.data;
  },

  create: async (data: { inventoryItemId: string; fromBranchId: string; toBranchId: string; remarks?: string }) => {
    const res = await apiClient.post('/inventory-transfers', data);
    return res.data;
  },

  approve: async (id: string) => {
    const res = await apiClient.post(`/inventory-transfers/${id}/approve`);
    return res.data;
  },

  reject: async (id: string, rejectionReason: string) => {
    const res = await apiClient.post(`/inventory-transfers/${id}/reject`, { rejectionReason });
    return res.data;
  },

  dispatch: async (id: string) => {
    const res = await apiClient.post(`/inventory-transfers/${id}/dispatch`);
    return res.data;
  },

  receive: async (id: string) => {
    const res = await apiClient.post(`/inventory-transfers/${id}/receive`);
    return res.data;
  },
};
