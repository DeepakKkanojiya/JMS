# JMS — PHASE 7 SPRINT 7.3 COMPLETION REPORT
## Sell on Approval — Deposit & Payment Foundation (Backend)

### 1. Architectural Summary & Business Workflow
Sprint 7.3 establishes the backend security deposit and payment foundation for the **Sell on Approval** subsystem in JMS.

When jewellery is issued to a customer on approval, a security deposit may be required (`requiredDepositAmount`). Deposit payments are recorded into an immutable financial ledger (`ApprovalDeposit`) mapped to the `public.approval_deposits` PostgreSQL table.

- **Payment Methods Supported**: `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`.
- **Immutable Payment Lifecycle**: `COMPLETED`, `REVERSED`. Deletion is disallowed. Reversal requires a mandatory `reversalReason` (minimum 3 characters), set timestamp (`reversedAt`), and audit tracking (`reversedBy`).
- **Financial Calculation & Overpayment Prevention**:
  - `Completed Deposit` = `SUM(COMPLETED payments)`
  - `Outstanding Deposit` = `MAX(0, Required Deposit - Completed Deposit)`
  - `Deposit Status`: `NOT_REQUIRED`, `PENDING`, `PARTIALLY_PAID`, `FULLY_PAID`.
  - Attempts to exceed the outstanding deposit balance are atomically rejected with `409 Conflict`.
- **Financial Isolation**: Approval deposits remain completely separate from `SalesPayment`, `VendorPayment`, and `GirviCollection`. Deposits produce no inventory movements or stock status changes.

---

### 2. API Reference

| Method | Endpoint | Description | Permission | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/approvals/:id/deposits` | Record security deposit payment | `approval.deposit.create` | 400, 401, 403, 404, 409 |
| `GET` | `/api/v1/approvals/:id/deposits` | List deposits for specific approval | `approval.deposit.read` | 401, 403, 404 |
| `GET` | `/api/v1/approvals/:id/deposit-summary` | Get backend-authoritative deposit summary | `approval.deposit.read` | 401, 403, 404 |
| `GET` | `/api/v1/approval-deposits` | Global paginated deposit ledger | `approval.deposit.read` | 401, 403 |
| `GET` | `/api/v1/approval-deposits/:id` | Get deposit payment details by ID | `approval.deposit.read` | 401, 403, 404 |
| `POST` | `/api/v1/approval-deposits/:id/reverse` | Reverse completed deposit payment | `approval.deposit.reverse` | 400, 401, 403, 404 |

---

### 3. Verification & Test Results
- `npm run test:approval`: **PASSED (11/11 tests passed 100%)**
- `npm run test:approval-inventory-locking`: **PASSED (9/9 suite tests passed 100%)**
- `npm run test:approval-deposit`: **PASSED (12/12 suite tests passed 100% including parallel race condition overpayment protection)**
- `npm run test:postman`: **PASSED (100% success)**
- `npm run build`: **PASSED (Exit Code 0, 0 TypeScript errors)**

---

> [!NOTE]
> **Scope Boundaries**: Customer jewellery returns, POS/purchase conversion, deposit refund workflows, and frontend UI belong to subsequent Phase 7 sprints and are intentionally excluded from Sprint 7.3.
