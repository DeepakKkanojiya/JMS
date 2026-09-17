# Phase 5 — Sprint 5.5 Subsystem Report: Purchase Return & Vendor Debit Note Management

## Executive Summary

Sprint 5.5 establishes the **Purchase Return & Vendor Debit Note Management** subsystem within the Jewellery Management System (JMS) backend. This subsystem handles returning defective, excess, or wrong stock to vendors, removing returned inventory items from store intake, logging stock movement audit trails, issuing Vendor Debit Notes (`DN-YYYY-XXXXX`), and adjusting vendor bill outstanding balances.

> [!IMPORTANT]
> - **Backend ONLY**: Frontend UI for Phase 5 has NOT been implemented.
> - **Audit & Stock Safety**: Only inventory items in `"AVAILABLE"` status can be returned. Processed returns automatically set `InventoryItem` status to `"RETURNED_TO_VENDOR"` and log a `"PURCHASE_RETURN"` `StockMovement`.
> - **Financial Settlement**: Processing a return generates an official `VendorDebitNote` and automatically reduces the linked `PurchaseBill` outstanding balance.

---

## 1. Procurement Return & Debit Note Flow

```
PURCHASE BILL / RECEIVED STOCK
       │
       ▼
PURCHASE RETURN DRAFT (PR-YYYYMMDD-XXXX)
       │
       ▼
SUBMITTED ──► APPROVED
                 │
                 ▼ (Process Return)
 ┌───────────────────────────────┴───────────────────────────────┐
 │                                                               │
 ▼                                                               ▼
INVENTORY STOCK REMOVAL                               VENDOR DEBIT NOTE
Status: RETURNED_TO_VENDOR                             Number: DN-YYYY-XXXXX
StockMovement: PURCHASE_RETURN                         Status: ISSUED
                                                       Purchase Bill Outstanding Reduced
```

---

## 2. Database Schema & Data Models

### Enums
- **`PurchaseReturnStatus`**: `DRAFT`, `SUBMITTED`, `APPROVED`, `PROCESSED`, `CANCELLED`
- **`DebitNoteStatus`**: `ISSUED`, `APPLIED`, `REVERSED`

### Model `PurchaseReturn` (`public.purchase_returns`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Return identifier |
| `returnNumber` | String | Unique (`PR-YYYYMMDD-XXXX`) | Sequential return reference |
| `purchaseBillId` | UUID? | Foreign Key | Linked Purchase Bill ID |
| `purchaseOrderId` | UUID? | Foreign Key | Linked Purchase Order ID |
| `vendorId` | UUID | Foreign Key | References `Vendor.id` |
| `branchId` | UUID | Foreign Key | References `Branch.id` |
| `status` | Enum | `PurchaseReturnStatus` | Default `DRAFT` |
| `returnDate` | DateTime | Timestamptz | Date of return creation |
| `reason` | String | Default `DEFECTIVE` | Reason for return |
| `subtotal` | Decimal(12,2) | Default `0.00` | Sum of taxable line items |
| `taxAmount` | Decimal(12,2) | Default `0.00` | Total tax amount |
| `totalReturnAmount` | Decimal(12,2) | Default `0.00` | Total return value |

### Model `PurchaseReturnItem` (`public.purchase_return_items`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `purchaseReturnId` | UUID | Foreign Key to `PurchaseReturn` |
| `purchaseBillItemId` | UUID? | Optional link to line item on Purchase Bill |
| `inventoryItemId` | UUID? | Optional link to physical `InventoryItem` |
| `itemName` | String | Name of returned item |
| `quantity` | Int | Returned quantity |
| `grossWeight`, `stoneWeight`, `netWeight` | Decimal(12,3) | Physical weights |
| `purchaseRate`, `metalValue`, `makingCharges`, `taxRate`, `taxAmount`, `lineTotal` | Decimal(12,2) | Line costing breakdown |

### Model `VendorDebitNote` (`public.vendor_debit_notes`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `debitNoteNumber` | String | Unique (`DN-YYYY-XXXXX`) |
| `purchaseReturnId` | UUID | Unique relation to `PurchaseReturn` |
| `vendorId`, `branchId`, `purchaseBillId` | UUID | Relations to Vendor, Branch, Purchase Bill |
| `amount` | Decimal(12,2) | Total debit note amount |
| `status` | Enum | Default `ISSUED` |

---

## 3. Business & Concurrency Rules

1. **State Machine Enforcement**:
   - `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PROCESSED`.
   - `CANCELLED` is permitted from `DRAFT` or `SUBMITTED` with mandatory `cancellationReason`.
   - Returns in `APPROVED` or `PROCESSED` status cannot be updated or cancelled.
2. **Stock Availability Protection**:
   - Processing a return verifies that linked `InventoryItem` records are in `"AVAILABLE"` status. If an item is `"SOLD"` or `"RETURNED_TO_VENDOR"`, processing is rejected with `409 Conflict`.
3. **Audit Movement Logging**:
   - When processed, `InventoryItem` status changes to `"RETURNED_TO_VENDOR"`, and a `StockMovement` entry is logged with `movementType` = `"PURCHASE_RETURN"`.
4. **Financial Adjustment**:
   - Automatically issues `VendorDebitNote` (`DN-YYYY-XXXXX`) and reduces linked `PurchaseBill.outstandingAmount`.

---

## 4. REST API Endpoint Catalog

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchase-returns` | Create draft purchase return | `purchase_return.create` |
| `GET` | `/api/v1/purchase-returns` | List paginated purchase returns | `purchase_return.read` |
| `GET` | `/api/v1/purchase-returns/:id` | Get purchase return details by ID | `purchase_return.read` |
| `PUT` | `/api/v1/purchase-returns/:id` | Update draft purchase return | `purchase_return.update` |
| `POST` | `/api/v1/purchase-returns/:id/submit` | Submit draft purchase return (`DRAFT -> SUBMITTED`) | `purchase_return.submit` |
| `POST` | `/api/v1/purchase-returns/:id/approve` | Approve submitted return (`SUBMITTED -> APPROVED`) | `purchase_return.approve` |
| `POST` | `/api/v1/purchase-returns/:id/process` | Process approved return, update stock & issue Debit Note | `purchase_return.process` |
| `POST` | `/api/v1/purchase-returns/:id/cancel` | Cancel return with mandatory reason | `purchase_return.cancel` |
| `GET` | `/api/v1/vendor-debit-notes` | List vendor debit notes | `debit_note.read` |
| `GET` | `/api/v1/vendor-debit-notes/:id` | Get vendor debit note details | `debit_note.read` |
| `GET` | `/api/v1/vendors/:id/debit-notes` | Get debit notes for a vendor | `debit_note.read` |

---

## 5. RBAC & Access Matrix

- **`purchase_return.create`**, **`update`**, **`submit`**, **`approve`**, **`process`**, **`cancel`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`
- **`purchase_return.read`**, **`debit_note.read`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `CASHIER`, `KARIGAR_SUPERVISOR`

---

## 6. Verification & Test Results

- **Integration Test Suite**: `test/purchase_return.test.ts` (30/30 scenarios passing 100%).
- **Postman Collection**: Folder `33. Purchase Returns & Vendor Debit Notes` added to Postman collection.
- **Swagger Documentation**: OpenAPI 3.0 path documentation registered under `/docs`.
- **Regression Safety**: All Phase 1–5.4 test suites passing 100%.

---

Phase 5 Sprint 5.5 Backend is COMPLETE. Frontend has NOT been implemented.
