export interface ProductImageResponse {
  id: string;
  productId: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProductImagePayload {
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}
