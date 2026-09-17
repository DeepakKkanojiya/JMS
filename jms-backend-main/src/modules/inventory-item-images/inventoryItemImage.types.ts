export interface InventoryItemImageResponse {
  id: string;
  inventoryItemId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateInventoryItemImagePayload {
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}
