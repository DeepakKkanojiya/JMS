# Phase 5 — Sprint 5.7 Subsystem Report: Stock Audit, Stocktake & Inventory Reconciliation

## Executive Summary

Sprint 5.7 establishes the **Stock Audit, Stocktake & Inventory Reconciliation** subsystem within the Jewellery Management System (JMS) backend. This subsystem enables store managers and auditors to conduct physical barcode/RFID stocktaking for store locations or product categories, snapshot expected inventory, identify discrepancies (Missing Items, Unexpected Extra Items, Weight Mismatches), reconcile physical inventory with system records, update missing item statuses (`AUDIT_MISSING`), log `StockMovement` audit records (`STOCKTAKE_MISSING`), and issue automated `StockAdjustment` records for weight variances.

> [!IMPORTANT]
> - **Backend ONLY**: Frontend UI for Phase 5 has NOT been implemented.
> - **Inventory Snapshot**: Creating a Stock Audit session snapshots all `"AVAILABLE"` inventory items for the target branch/category scope.
> - **Automatic Missing Item Identification**: Submitting an audit session compares scanned items against the expected snapshot and automatically records unscanned items as `"MISSING"`.
> - **Stock Movement & Weight Adjustments**: Reconciling an audit session updates missing item statuses to `"AUDIT_MISSING"`, logs `"STOCKTAKE_MISSING"` stock movements, and creates `StockAdjustment` entries for weight mismatches.

---

## 1. Stock Audit Lifecycle

```
STOCK AUDIT CREATION (AUD-YYYYMMDD-XXXX)
Status: IN_PROGRESS ──► SUBMITTED ──► RECONCILED / CANCELLED
           │                │             │
           ▼                ▼             ▼
  PHYSICAL ITEM SCAN    MISSING ITEM    STOCK ADJUSTMENT &
  (Barcode / RFID)      DETECTION       AUDIT_MISSING STATUS
```

---

## 2. Database Schema & Data Models

### Enums
- **`AuditSessionStatus`**: `IN_PROGRESS`, `SUBMITTED`, `RECONCILED`, `CANCELLED`
- **`AuditItemStatus`**: `MATCHED`, `MISSING`, `UNEXPECTED`, `WEIGHT_MISMATCH`

### Model `StockAuditSession` (`public.stock_audit_sessions`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Audit session identifier |
| `auditNumber` | String | Unique (`AUD-YYYYMMDD-XXXX`) | Sequential audit reference |
| `companyId`, `branchId` | UUID | Foreign Keys | References Company and Branch |
| `categoryId` | UUID? | Foreign Key | Optional Product Category filter |
| `status` | Enum | `AuditSessionStatus` | Default `IN_PROGRESS` |
| `totalExpectedItems` | Int | Default `0` | Expected item snapshot count |
| `totalScannedItems` | Int | Default `0` | Physical scanned item count |
| `totalMatchedItems` | Int | Default `0` | Matched item count |
| `totalMissingItems` | Int | Default `0` | Missing item count |
| `totalUnexpectedItems` | Int | Default `0` | Unexpected item count |
| `totalWeightMismatchItems` | Int | Default `0` | Weight discrepancy count |
| `totalExpectedNetWeight` | Decimal(12,3) | Default `0.000` | Expected total net weight |
| `totalScannedNetWeight` | Decimal(12,3) | Default `0.000` | Scanned total net weight |
| `notes` | String? | | Optional auditor notes |
| `auditedBy`, `reconciledBy` | UUID? | | User ID references |
| `reconciledAt` | DateTime? | | Timestamp of reconciliation |
| `cancellationReason` | String? | | Mandatory reason if cancelled |

### Model `StockAuditItem` (`public.stock_audit_items`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `auditSessionId` | UUID | Foreign Key to `StockAuditSession` |
| `inventoryItemId` | UUID? | Optional link to `InventoryItem` |
| `barcode`, `rfidEpc` | String? | Scanned physical identifiers |
| `status` | Enum | `AuditItemStatus` |
| `expectedGrossWeight`, `scannedGrossWeight` | Decimal(12,3)? | Gross weights |
| `expectedNetWeight`, `scannedNetWeight` | Decimal(12,3)? | Net weights |
| `weightDiscrepancy` | Decimal(12,3) | Calculated weight difference |

---

## 3. Business & Concurrency Rules

1. **Active Audit Guard**:
   - Only one active (`IN_PROGRESS`) audit session is permitted per branch at any given time. Attempts to create a concurrent session return `409 Conflict`.
2. **Item Scanning Logic**:
   - Items scanned by Barcode, RFID, or ID are matched against expected inventory.
   - If not found or not in `"AVAILABLE"` status $\rightarrow$ status = `"UNEXPECTED"`.
   - If weight difference $> 0.05\text{g}$ $\rightarrow$ status = `"WEIGHT_MISMATCH"`.
   - Otherwise $\rightarrow$ status = `"MATCHED"`.
3. **Reconciliation Actions**:
   - Reconciling updates `MISSING` items to `"AUDIT_MISSING"` status and creates `"STOCKTAKE_MISSING"` `StockMovement` logs.
   - Creates `StockAdjustment` records for `WEIGHT_MISMATCH` items.
4. **Cancellation Safeguard**:
   - Audit sessions can be cancelled from `IN_PROGRESS` or `SUBMITTED` with a mandatory `cancellationReason`. `RECONCILED` sessions cannot be cancelled.

---

## 4. REST API Endpoint Catalog

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/stock-audits` | Create IN_PROGRESS Stock Audit session | `stock_audit.create` |
| `GET` | `/api/v1/stock-audits` | List paginated Stock Audit sessions | `stock_audit.read` |
| `GET` | `/api/v1/stock-audits/:id` | Get Stock Audit session details | `stock_audit.read` |
| `POST` | `/api/v1/stock-audits/:id/scan` | Scan physical item into audit session | `stock_audit.scan` |
| `POST` | `/api/v1/stock-audits/:id/submit` | Submit audit session (identifies missing items) | `stock_audit.submit` |
| `POST` | `/api/v1/stock-audits/:id/reconcile` | Reconcile audit session & update stock | `stock_audit.reconcile` |
| `POST` | `/api/v1/stock-audits/:id/cancel` | Cancel audit session with mandatory reason | `stock_audit.cancel` |
| `GET` | `/api/v1/stock-audits/:id/discrepancies` | Get audit discrepancy report | `stock_audit.read` |

---

## 5. RBAC & Access Matrix

- **`stock_audit.create`**, **`submit`**, **`reconcile`**, **`cancel`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`
- **`stock_audit.read`**, **`scan`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `CASHIER`

---

## 6. Verification & Test Results

- **Integration Test Suite**: `test/stock_audit.test.ts` (26/26 scenarios passing 100%).
- **Postman Collection**: Folder `35. Stock Audit & Inventory Reconciliation` added to Postman collection.
- **Swagger Documentation**: OpenAPI 3.0 path documentation registered under `/docs`.
- **Regression Safety**: All Phase 1–5.6 test suites passing 100%.

---

Phase 5 Sprint 5.7 Backend is COMPLETE. Frontend has NOT been implemented.
