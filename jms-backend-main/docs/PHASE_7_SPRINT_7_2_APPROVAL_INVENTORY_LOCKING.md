# JMS — PHASE 7 SPRINT 7.2 COMPLETION REPORT
## Sell on Approval — Issue & Inventory Locking (Backend)

### 1. Architectural Summary & Business Workflow
Sprint 7.2 implements the physical inventory control and atomic concurrency protection layer for the **Sell on Approval** subsystem in JMS. 

When an approval slip is issued to a customer (`DRAFT` → `ISSUED`), physical inventory control is automatically enforced:
- **Inventory Item Status Transition**: `AVAILABLE` → `ON_APPROVAL`.
- **Immutable Stock Ledger Movement**: `movementType = "APPROVAL_ISSUE"`, `referenceType = "SALES_APPROVAL"`.
- **Multi-Item Atomicity & Concurrency Locking**: Executed inside a single `prisma.$transaction()`. Atomic conditional updates (`updateMany` with `where: { id, status: 'AVAILABLE', branchId, companyId }`) ensure that if an item is sold, reserved, cross-branch, or concurrently locked by another user, the transaction immediately rolls back and returns `400 Bad Request` or `409 Conflict`.

### 2. Key Inventory State & Concurrency Rules

> [!IMPORTANT]
> **Inventory Protection Rule**: Items with `status = "ON_APPROVAL"` are physically held with a customer and automatically locked from normal showroom operations. Existing modules (`SalesInvoice`, `InventoryTransfer`, `JobWork`) strictly require `status === "AVAILABLE"`, ensuring zero double-sale or unauthorized allocation.

> [!NOTE]
> **Atomic Race Condition Prevention**: Conditional row updates throw `409 Conflict` if `count === 0` during parallel issue requests, guaranteeing that exactly one transaction succeeds and no partial stock movements are persisted.

### 3. API Summary
| Method | Endpoint | Description | Permission | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/approvals` | Create draft Sell on Approval slip | `approval.create` | 400, 401, 403 |
| `GET` | `/api/v1/approvals` | List paginated approval slips | `approval.read` | 401, 403 |
| `GET` | `/api/v1/approvals/:id` | Get approval slip details by ID | `approval.read` | 401, 403, 404 |
| `PUT` | `/api/v1/approvals/:id` | Update draft approval slip | `approval.update` | 400, 401, 403, 404 |
| `POST` | `/api/v1/approvals/:id/issue` | Issue approval slip & lock inventory (`AVAILABLE` → `ON_APPROVAL`) | `approval.issue` | 400, 401, 403, 404, 409 |
| `POST` | `/api/v1/approvals/:id/cancel` | Cancel draft approval slip | `approval.cancel` | 400, 401, 403, 404 |

### 4. Verification & Test Results
- `npm run test:approval`: **PASSED (11/11 tests passed)**
- `npm run test:approval-inventory-locking`: **PASSED (9/9 suite tests passed including race condition & rollback checks)**
- `npm run test:postman`: **PASSED (100% success)**
- `npm run build`: **PASSED (Exit Code 0, 0 TypeScript errors)**

> [!NOTE]
> **Scope Boundary**: Frontend UI, customer return workflows, POS/purchase conversion, deposit payments, and reporting belong to subsequent Phase 7 sprints and are intentionally excluded from Sprint 7.2.
