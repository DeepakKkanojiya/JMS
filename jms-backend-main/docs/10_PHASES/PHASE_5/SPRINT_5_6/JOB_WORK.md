# Phase 5 — Sprint 5.6 Subsystem Report: Karigar / Artisan Job Work & Material Issue Management

## Executive Summary

Sprint 5.6 establishes the **Karigar / Artisan Job Work & Material Issue Management** subsystem within the Jewellery Management System (JMS) backend. This subsystem tracks issuing raw precious metal (gold bullion) and inventory stock items to Karigars (goldsmiths / artisans), manufacturing job orders, wastage percentage tracking, labor making charges, finished goods intake into store inventory, and Karigar metal & financial ledger aggregations.

> [!IMPORTANT]
> - **Backend ONLY**: Frontend UI for Phase 5 has NOT been implemented.
> - **Stock Movement Audit**: Issuing stock to Karigars updates `InventoryItem` status to `"ISSUED_TO_KARIGAR"` and logs an `"ISSUED_TO_KARIGAR"` `StockMovement`.
> - **Finished Goods Tagging**: Receiving finished jewellery from Karigars generates a new `InventoryItem` barcode tag in `"AVAILABLE"` status and logs a `"KARIGAR_RECEIVING"` `StockMovement`.
> - **Karigar Balance Summary**: Tracks total fine gold issued vs fine gold received, actual wastage, net pending gold weight balance, and total making charges payable per Karigar.

---

## 1. Job Work & Material Lifecycle

```
JOB WORK ORDER CREATION (JW-YYYYMMDD-XXXX)
Status: DRAFT ──► SUBMITTED ──► ASSIGNED
                                   │
                                   ▼
MATERIAL ISSUANCE ─────────► IN_PROGRESS
- Raw Gold Bullion / Loose Stones
- InventoryItem (Status: ISSUED_TO_KARIGAR)
- StockMovement: ISSUED_TO_KARIGAR
                                   │
                                   ▼
FINISHED GOODS RECEIVING ──► COMPLETED
- Finished Jewellery Tag Creation (Status: AVAILABLE)
- StockMovement: KARIGAR_RECEIVING
- Wastage & Labor Making Charges Ledger
```

---

## 2. Database Schema & Data Models

### Enums
- **`JobWorkOrderStatus`**: `DRAFT`, `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- **`JobWorkItemType`**: `RAW_METAL`, `LOOSE_STONE`, `INVENTORY_ITEM`

### Model `JobWorkOrder` (`public.job_work_orders`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Order identifier |
| `orderNumber` | String | Unique (`JW-YYYYMMDD-XXXX`) | Sequential order reference |
| `companyId`, `branchId`, `vendorId` | UUID | Foreign Keys | References Company, Branch, and Vendor (Karigar) |
| `status` | Enum | `JobWorkOrderStatus` | Default `DRAFT` |
| `targetItemName` | String | | Description of target jewellery to craft |
| `metalType`, `purity` | String | Default `GOLD`, `22K` | Target metal specifications |
| `agreedWastagePercent` | Decimal(5,2) | Default `0.00` | Agreed allowed wastage % |
| `agreedMakingChargePerGram` | Decimal(12,2) | Default `0.00` | Agreed labor rate per gram |
| `totalIssuedFineWeight` | Decimal(12,3) | Default `0.000` | Total fine gold issued |
| `totalReceivedFineWeight` | Decimal(12,3) | Default `0.000` | Total fine gold received in finished goods |
| `totalWastageWeight` | Decimal(12,3) | Default `0.000` | Actual wastage weight recorded |
| `totalMakingCharges` | Decimal(12,2) | Default `0.00` | Total labor charges calculated |

### Model `JobWorkMaterialIssue` (`public.job_work_material_issues`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `jobWorkOrderId` | UUID | Foreign Key to `JobWorkOrder` |
| `itemType` | Enum | `RAW_METAL`, `LOOSE_STONE`, or `INVENTORY_ITEM` |
| `inventoryItemId` | UUID? | Optional link to issued `InventoryItem` |
| `description` | String | Material description |
| `grossWeight`, `stoneWeight`, `netWeight`, `fineWeight` | Decimal(12,3) | Weights and fine gold purity |

### Model `JobWorkReceipt` (`public.job_work_receipts`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `receiptNumber` | String | Unique (`JWR-YYYYMMDD-XXXX`) |
| `jobWorkOrderId` | UUID | Foreign Key to `JobWorkOrder` |
| `inventoryItemId` | UUID? | Link to newly generated finished product `InventoryItem` |
| `itemName` | String | Received item name |
| `grossWeight`, `stoneWeight`, `netWeight`, `fineWeight` | Decimal(12,3) | Received weights |
| `actualWastageWeight` | Decimal(12,3) | Actual wastage recorded |
| `makingCharges` | Decimal(12,2) | Calculated or custom labor charge |

---

## 3. Business & Concurrency Rules

1. **State Machine Enforcement**:
   - `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.
   - `CANCELLED` is permitted from `DRAFT`, `SUBMITTED`, or `ASSIGNED` prior to material issuance with a mandatory `cancellationReason`. Once material has been issued, orders cannot be cancelled.
2. **Stock Issuance Rules**:
   - Issuing an `InventoryItem` verifies that the item is in `"AVAILABLE"` status. If not, issuance returns `409 Conflict`.
   - Transitioning to `ISSUED_TO_KARIGAR` locks the item from sale, transfer, or return.
3. **Finished Goods Intake**:
   - Receiving finished jewellery generates a new barcode tag (`TAG-JW-...`) and puts the item into `"AVAILABLE"` inventory status.
4. **Karigar Metal & Financial Balance**:
   - `getKarigarSummary` aggregates net pending fine gold weight ($\text{Net Pending} = \text{Issued Fine} - \text{Received Fine} - \text{Wastage}$) and total labor making charges.

---

## 4. REST API Endpoint Catalog

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/job-work/orders` | Create draft job work order | `job_work.create` |
| `GET` | `/api/v1/job-work/orders` | List paginated job work orders | `job_work.read` |
| `GET` | `/api/v1/job-work/orders/:id` | Get job work order details by ID | `job_work.read` |
| `PUT` | `/api/v1/job-work/orders/:id` | Update draft job work order | `job_work.update` |
| `POST` | `/api/v1/job-work/orders/:id/submit` | Submit draft job work order | `job_work.submit` |
| `POST` | `/api/v1/job-work/orders/:id/assign` | Assign submitted order to Karigar | `job_work.assign` |
| `POST` | `/api/v1/job-work/orders/:id/issue-material` | Issue raw metal, stones, or stock to Karigar | `job_work.issue` |
| `POST` | `/api/v1/job-work/orders/:id/receive` | Receive finished goods / material from Karigar | `job_work.receive` |
| `POST` | `/api/v1/job-work/orders/:id/cancel` | Cancel order prior to material issue | `job_work.cancel` |
| `GET` | `/api/v1/karigars/:id/job-work-summary` | Get Karigar job work ledger summary | `job_work.read` |

---

## 5. RBAC & Access Matrix

- **`job_work.create`**, **`update`**, **`submit`**, **`assign`**, **`issue`**, **`receive`**, **`cancel`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `KARIGAR_SUPERVISOR`
- **`job_work.read`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `KARIGAR_SUPERVISOR`, `STAFF`, `SALESPERSON`, `CASHIER`

---

## 6. Verification & Test Results

- **Integration Test Suite**: `test/job_work.test.ts` (27/27 scenarios passing 100%).
- **Postman Collection**: Folder `34. Karigar Job Work & Material Issue` added to Postman collection.
- **Swagger Documentation**: OpenAPI 3.0 path documentation registered under `/docs`.
- **Regression Safety**: All Phase 1–5.5 test suites passing 100%.

---

Phase 5 Sprint 5.6 Backend is COMPLETE. Frontend has NOT been implemented.
