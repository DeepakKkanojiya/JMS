# Phase 5 — Sprint 5.4 Subsystem Report: Vendor Payment & Payable Settlement

## Executive Summary

Sprint 5.4 completes the financial procurement settlement lifecycle by establishing a dedicated, audit-safe **Vendor Payment & Payable Settlement** subsystem. Once purchase orders are physically received and approved purchase bills are generated, Sprint 5.4 enables the enterprise to record full, partial, and multi-method payments against approved purchase bills, track vendor payable balances, and safely reverse payments when necessary.

> [!IMPORTANT]
> - **Backend ONLY**: Frontend UI for Phase 5 has NOT been implemented.
> - **Internal Financial Ledger**: Uses internal settlement records. External payment gateway integration is NOT implemented.
> - **Isolated Subsystem**: Vendor payments use a dedicated procurement ledger model (`VendorPayment`) and are NOT coupled to customer sales payments (`SalesPayment`).

---

## 1. Subsystem Architecture & Procurement Flow

```
PURCHASE ORDER (PO-YYYYMMDD-XXXX)
       │
       ▼
PHYSICAL RECEIVING (RCV-YYYYMMDD-XXXX) & INVENTORY INTAKE
       │
       ▼
PURCHASE BILL (PB-YYYYMMDD-XXXX)
       │
       ▼
APPROVED PURCHASE BILL / VENDOR PAYABLE
       │
       ▼
VENDOR PAYMENT (VPAY-YYYY-XXXXX) [CASH, CARD, UPI, BANK_TRANSFER, CHEQUE]
       │
       ▼
PURCHASE BILL STATUS: PARTIALLY_PAID / PAID
```

---

## 2. Database Schema & Data Models

### Enums
- **`VendorPaymentMethod`**: `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`
- **`VendorPaymentStatus`**: `PENDING`, `COMPLETED`, `FAILED`, `REVERSED`

### Model `VendorPayment` (`public.vendor_payments`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique payment identifier |
| `purchaseBillId` | UUID | Foreign Key | References `PurchaseBill.id` |
| `vendorId` | UUID | Foreign Key | References `Vendor.id` |
| `branchId` | UUID | Foreign Key | References `Branch.id` |
| `paymentNumber` | String | Unique (`VPAY-YYYY-XXXXX`) | Collision-safe sequential payment reference |
| `paymentMethod` | Enum | `VendorPaymentMethod` | `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE` |
| `amount` | Decimal(12,2) | Non-negative, > 0 | Payment amount |
| `status` | Enum | `VendorPaymentStatus` | Default `COMPLETED` |
| `transactionReference` | String? | Nullable | External reference (UTR, Cheque No, Transaction ID) |
| `paymentDate` | DateTime | Timestamptz | Date of payment transaction |
| `remarks` | String? | Nullable | Payment notes or notes |
| `receivedBy` | UUID? | Nullable | User ID who received/recorded the payment |
| `processedBy` | UUID? | Nullable | User ID who processed the payment |
| `reversedAt` | DateTime? | Nullable Timestamptz | Reversal timestamp |
| `reversedBy` | UUID? | Nullable | User ID who performed reversal |
| `reversalReason` | String? | Nullable | Mandatory reason for payment reversal |

---

## 3. Business & Concurrency Rules

1. **Status Protection**:
   - Payments can ONLY be created for purchase bills with `status` = `APPROVED` or `PARTIALLY_PAID`.
   - Creation attempts on `DRAFT`, `SUBMITTED`, `CANCELLED`, or `PAID` bills are rejected with `400 Bad Request` or `409 Conflict`.
2. **Overpayment Protection Engine**:
   - Payment creation executes inside an atomic `prisma.$transaction()`.
   - Outstanding balance: $\text{Outstanding} = \text{PurchaseBill.grandTotal} - \text{SUM}(\text{COMPLETED Payments})$.
   - Payment amount exceeding remaining outstanding balance returns `409 Conflict`.
3. **Decimal Precision**:
   - All financial math uses `Prisma.Decimal` with `toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)`. Floating point arithmetic is strictly prohibited.
4. **Immutable Ledger & Reversal Rules**:
   - Vendor payments are NEVER physically deleted (no `DELETE` route exists).
   - Completed payments can be reversed via `POST /api/v1/vendor-payments/:id/reverse` with a mandatory `reversalReason`.
   - Reversal updates `status` to `REVERSED` and recalculates `PurchaseBill` `totalPaid`, `outstandingAmount`, and `status` (`PAID` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `APPROVED`).
   - Already `REVERSED` payments cannot be reversed again.

---

## 4. REST API Endpoint Catalog

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchase-bills/:id/payments` | Record vendor payment against an approved purchase bill | `vendor_payment.create` |
| `GET` | `/api/v1/purchase-bills/:id/payments` | Get payment history for a purchase bill | `vendor_payment.read` |
| `GET` | `/api/v1/purchase-bills/:id/payment-summary` | Get payment method breakdown and total paid/outstanding summary | `vendor_payment.read` |
| `GET` | `/api/v1/vendor-payments` | List paginated vendor payments with filters (search, vendor, bill, method, status, dates) | `vendor_payment.read` |
| `GET` | `/api/v1/vendor-payments/:id` | Get single vendor payment details by ID | `vendor_payment.read` |
| `POST` | `/api/v1/vendor-payments/:id/reverse` | Reverse a completed vendor payment with mandatory reason | `vendor_payment.reverse` |
| `GET` | `/api/v1/vendors/:id/payments` | Get all payment records for a vendor | `vendor_payment.read` |
| `GET` | `/api/v1/vendors/:id/payable-summary` | Get vendor payable summary (approved bills count, total billed, total paid, total outstanding, overdue count) | `vendor_payment.read` |

---

## 5. RBAC & Access Matrix

- **`vendor_payment.create`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`
- **`vendor_payment.read`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `CASHIER`, `KARIGAR_SUPERVISOR`
- **`vendor_payment.reverse`**: `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`

---

## 6. Testing & Quality Gate Verification

- **Integration Test Suite**: `test/vendor_payment.test.ts` (40/40 scenarios passing 100%).
- **Postman Collection**: Folder `32. Vendor Payments & Payable Settlement` in `postman/IAM.postman_collection.json`.
- **Swagger Documentation**: Interactive OpenAPI 3.0 path documentation registered under `/docs`.
- **Regression Safety**: All Phase 1–4 test suites and Phase 5.1–5.3 test suites (`test:purchase-order`, `test:purchase-receive`, `test:purchase-bill`, `test:postman`, `npm run build`) passing 100%.

---

Phase 5 Sprint 5.4 Backend is COMPLETE. Frontend has NOT been implemented.
