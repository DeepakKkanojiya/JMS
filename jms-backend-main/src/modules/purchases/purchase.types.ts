  import { MetalType, PurchaseOrderStatus, Prisma } from '../../generated/prisma';

  export interface CreatePurchaseOrderItemInput {
    productId?: string | null;
    metalType: MetalType;
    purity: string;
    itemName: string;
    description?: string | null;
    orderedQuantity?: number;
    grossWeight: number | Prisma.Decimal;
    netWeight: number | Prisma.Decimal;
    stoneWeight?: number | Prisma.Decimal;
    expectedRate: number | Prisma.Decimal;
    makingCharges?: number | Prisma.Decimal;
    taxRate?: number | Prisma.Decimal;
  }

  export interface CreatePurchaseOrderInput {
    vendorId: string;
    branchId: string;
    orderDate?: string;
    expectedDeliveryDate?: string | null;
    notes?: string | null;
    termsConditions?: string | null;
    items: CreatePurchaseOrderItemInput[];
  }

  export interface UpdatePurchaseOrderItemInput {
    id?: string;
    productId?: string | null;
    metalType: MetalType;
    purity: string;
    itemName: string;
    description?: string | null;
    orderedQuantity?: number;
    grossWeight: number | Prisma.Decimal;
    netWeight: number | Prisma.Decimal;
    stoneWeight?: number | Prisma.Decimal;
    expectedRate: number | Prisma.Decimal;
    makingCharges?: number | Prisma.Decimal;
    taxRate?: number | Prisma.Decimal;
  }

  export interface UpdatePurchaseOrderInput {
    vendorId?: string;
    branchId?: string;
    orderDate?: string;
    expectedDeliveryDate?: string | null;
    notes?: string | null;
    termsConditions?: string | null;
    items?: UpdatePurchaseOrderItemInput[];
  }

  export interface CancelPurchaseOrderInput {
    cancellationReason: string;
  }

  export interface PurchaseOrderQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    vendorId?: string;
    branchId?: string;
    companyId?: string;
    status?: PurchaseOrderStatus | string;
    fromDate?: string;
    toDate?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'purchaseOrderNumber' | 'orderDate' | 'grandTotal';
    sortOrder?: 'asc' | 'desc';
  }

  export interface ReceivePurchaseItemInput {
    purchaseOrderItemId: string;
    receivedQuantity: number;
    grossWeight: number | Prisma.Decimal;
    netWeight: number | Prisma.Decimal;
    stoneWeight?: number | Prisma.Decimal;
    purchaseRate: number | Prisma.Decimal;
    makingCharges?: number | Prisma.Decimal;
    taxRate?: number | Prisma.Decimal;
  }

  export interface ReceivePurchaseInput {
    receivedDate?: string;
    remarks?: string | null;
    items: ReceivePurchaseItemInput[];
  }

  export interface PurchaseReceiptQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    branchId?: string;
    purchaseOrderId?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'purchaseReceiptNumber' | 'receivedDate' | 'grandTotal';
    sortOrder?: 'asc' | 'desc';
  }

