# Physical Inventory & Item Tracking Subsystem Specification

## Overview

This document provides complete technical, architectural, database, and API specifications for **Phase 3: Inventory & Item Tracking** of the Jewellery Management System (JMS) backend.

It covers unique physical inventory items, barcode/QR tag generation, stock movement audit ledgers, inter-branch stock transfers, and high-resolution image management.

---

## Data Models & Core Schemas

### 1. `InventoryItem` (`public.inventory_items`)
- `id`: UUID (Primary Key)
- `productId`: UUID (FK to `Product`)
- `branchId`: UUID (FK to `Branch`)
- `itemCode`: String (Unique auto-generated, e.g. `ITM-2026-00001`)
- `grossWeight`, `netWeight`, `stoneWeight`: Decimal(10, 3)
- `purity`: String (`22K`, `18K`, `24K`)
- `status`: Enum (`AVAILABLE`, `RESERVED`, `SOLD`, `TRANSFERRED`)
- `createdBy`, `updatedBy`: UUID?

### 2. `StockMovement` (`public.stock_movements`)
- `id`: UUID (Primary Key)
- `inventoryItemId`: UUID (FK to `InventoryItem`)
- `movementType`: Enum (`STOCK_IN`, `SALE`, `TRANSFER`, `ADJUSTMENT`)
- `fromBranchId`, `toBranchId`: UUID?
- `quantity`: Int @default(1)
- `referenceNumber`: String? (e.g. `INV-123`, `TRF-456`)
- `performedBy`: UUID?
- `createdAt`: Timestamptz

### 3. `InventoryTag` (`public.inventory_tags`)
- `id`: UUID (Primary Key)
- `inventoryItemId`: UUID (FK to `InventoryItem`, Unique)
- `barcodeNumber`: String (Unique, e.g. `BC-ITM-00001`)
- `qrCodeData`: String (Unique, e.g. `QR-ITM-00001`)
- `rfidEpc`: String? (Unique)
- `isActive`: Boolean @default(true)

### 4. `InventoryTransfer` (`public.inventory_transfers`)
- `id`: UUID (Primary Key)
- `transferNumber`: String (Unique, e.g. `TRF-2026-00001`)
- `inventoryItemId`: UUID (FK to `InventoryItem`)
- `fromBranchId`, `toBranchId`: UUID
- `status`: Enum (`REQUESTED`, `APPROVED`, `REJECTED`, `DISPATCHED`, `RECEIVED`, `CANCELLED`)

---

## Key Workflows & APIs

### 1. Item Creation & Tag Auto-Generation
When `POST /api/v1/inventory-items` is executed:
- Creates `InventoryItem` in `AVAILABLE` status.
- Automatically creates `InventoryTag` with `barcodeNumber = BC-<itemCode>` and `qrCodeData = QR-<itemCode>`.
- Automatically logs a `STOCK_IN` record in `StockMovement`.

### 2. Inter-Branch Transfer Workflow
State transitions for stock transfer:
`REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `RECEIVED`.
On `RECEIVED`:
- Update `InventoryItem.branchId = toBranchId`.
- Log `TRANSFER` in `StockMovement`.

### 3. Product & Inventory Image Management
- `POST /api/v1/product-images/:productId`: Upload master product template images.
- `POST /api/v1/inventory-item-images/:itemId`: Upload physical item photographs with primary image flag.
