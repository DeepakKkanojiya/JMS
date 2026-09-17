# JMS — PHASE 7 SPRINT 7.4 COMPLETION REPORT
## Sell on Approval — Return & Purchase Confirmation (Backend)

### 1. Architectural Summary & Business Workflow
Sprint 7.4 introduces the two mutually exclusive outcomes for **Sell on Approval** items in JMS:

1. **Customer Jewellery Return (`POST /api/v1/approvals/:id/return`)**:
   - Status Transition: `ON_APPROVAL` → `AVAILABLE`.
   - Approval Status Transition: `ISSUED` / `WITH_CUSTOMER` → `RETURNED`.
   - Immutable Stock Movement: `movementType = 'APPROVAL_RETURN'`, `referenceType = 'SALES_APPROVAL'`, `referenceId = approval.id`.
   - Deposit Settlement: Original `ApprovalDeposit` audit history is preserved and accessible.

2. **Purchase Confirmation (`POST /api/v1/approvals/:id/purchase`)**:
   - Status Transition: `ON_APPROVAL` → `SOLD`.
   - Sales Engine Integration: Converts approval to a `CONFIRMED` `SalesInvoice` with 3% GST calculation and pricing.
   - Deposit Application: Paid approval deposits are applied as a `SalesPayment` credit against the generated `SalesInvoice`.
   - Immutable Stock Movement: `movementType = 'SALE'`, `referenceType = 'SALES_INVOICE'`, `referenceId = salesInvoice.id`.
   - Approval Status Transition: `ISSUED` / `WITH_CUSTOMER` → `PURCHASED`.

- **Concurrency & Atomicity**:
  - Encapsulated within PostgreSQL atomic `prisma.$transaction`.
  - Conditional update guards protect against simultaneous `RETURN` vs `PURCHASE` race conditions (`409 Conflict`).
  - Multi-item failure triggers full transaction rollback (no partial inventory or financial state).

---

### 2. API Reference

| Method | Endpoint | Description | Permission | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/approvals/:id/return` | Process customer jewellery return (`ON_APPROVAL` → `AVAILABLE`) | `approval.return` | 400, 401, 403, 404, 409 |
| `POST` | `/api/v1/approvals/:id/purchase` | Convert approval into confirmed purchase invoice (`ON_APPROVAL` → `SOLD`) | `approval.purchase` | 400, 401, 403, 404, 409 |

---

### 3. Verification & Test Results
- `npm run test:approval`: **PASSED (11/11 tests passed 100%)**
- `npm run test:approval-inventory-locking`: **PASSED (9/9 suite tests passed 100%)**
- `npm run test:approval-deposit`: **PASSED (12/12 suite tests passed 100%)**
- `npm run test:approval-return-purchase`: **PASSED (Complete RETURN, PURCHASE, deposit credit, & 409 race condition test passed 100%)**
- `npm run test:postman`: **PASSED (100% success)**
- `npm run build`: **PASSED (Exit Code 0, 0 TypeScript errors)**

---

> [!NOTE]
> **Scope Boundaries**: Frontend UI and Phase 7.5 reports/final integration belong to subsequent Phase 7 sprints and are intentionally excluded from Sprint 7.4.
