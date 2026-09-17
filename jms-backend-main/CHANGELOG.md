# Changelog - Jewellery ERP Backend

All notable changes to this project will be documented in this file.

## [7.5.0] - Phase 7 Sprint 7.5: Sell on Approval — Reports, Audit & Final Integration (Backend) - 2026-08-21

### Added
- **Approval Reporting & Analytics Subsystem**:
  - `GET /api/v1/approvals/reports/summary` (Aggregated summary metrics across slips, values, and deposits).
  - `GET /api/v1/approvals/reports/register` (Paginated and filterable approval register report).
  - `GET /api/v1/approvals/reports/inventory` (Physical jewellery locked under `ON_APPROVAL` status report).
  - `GET /api/v1/approvals/reports/deposits` (Deposit and payment ledger report with completed and reversed records).
  - `GET /api/v1/approvals/reports/returns-purchases` (Return vs purchase comparison report with conversion rates).
  - `GET /api/v1/approvals/reports/customer/:customerId` (Customer 360 approval history report).
  - `GET /api/v1/approvals/reports/ageing` (Overdue and ageing bucket report across 5 buckets).
  - `GET /api/v1/approvals/:id/audit-trail` (360-degree chronological audit trail timeline).
- **RBAC & Security**:
  - Added `approval.report.read` permission.
- **Automated Test Suite**:
  - Created `test/approval_reports.test.ts` (10 test groups covering summary calculations, register filters, deposit reports, return vs purchase metrics, customer history, ageing buckets, 360 audit timeline, and zero-mutation read-only safety).
- **Postman Collection Update**:
  - Added Folder `39. Sell on Approval — Reports & Audit` to `postman/Jewellery_ERP.postman_collection.json`.

## [7.4.0] - Phase 7 Sprint 7.4: Sell on Approval — Return & Purchase Confirmation (Backend) - 2026-08-21

### Added
- **Return & Purchase Confirmation Workflow**:
  - `POST /api/v1/approvals/:id/return` (Processes customer jewellery return, transitioning items `ON_APPROVAL` → `AVAILABLE` and logging `APPROVAL_RETURN` stock movements).
  - `POST /api/v1/approvals/:id/purchase` (Converts approval slip to completed `CONFIRMED` `SalesInvoice`, transitioning items `ON_APPROVAL` → `SOLD`, logging `SALE` stock movements, and applying deposit credit).
- **Concurrency & Concurrency Protection**:
  - Encapsulated within `prisma.$transaction` with conditional status guards (`409 Conflict` on race conditions).
- **RBAC Permissions & Seeders**:
  - Added `approval.return` and `approval.purchase` permissions.
- **Automated Test Suite**:
  - Created `test/approval_return_purchase.test.ts` (covers return, purchase, deposit credit application, multi-item atomicity, and parallel RETURN vs PURCHASE race condition protection).
- **Postman Collection Update**:
  - Added Folder `38. Sell on Approval — Return & Purchase Confirmation` to `postman/Jewellery_ERP.postman_collection.json`.

## [7.3.0] - Phase 7 Sprint 7.3: Sell on Approval — Deposit & Payment Foundation (Backend) - 2026-08-21

### Added
- **Approval Deposit Model & Schema (`ApprovalDeposit`)**:
  - Mapped `public.approval_deposits` table for security deposit payments.
  - Added `requiredDepositAmount` decimal field to `Approval`.
  - Reused existing `PaymentMethod` (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`) and `PaymentStatus` (`COMPLETED`, `REVERSED`) enums.
- **Deposit Service & Financial Logic**:
  - Implemented deposit payment creation with overpayment protection (`409 Conflict`).
  - Implemented deposit summary calculation (`requiredDeposit`, `completedDeposit`, `reversedDeposit`, `outstandingDeposit`, `depositStatus`).
  - Implemented deposit reversal with mandatory `reversalReason`.
- **REST APIs**:
  - `POST /api/v1/approvals/:id/deposits` (Record security deposit payment).
  - `GET /api/v1/approvals/:id/deposits` (List deposits for approval slip).
  - `GET /api/v1/approvals/:id/deposit-summary` (Get deposit financial summary).
  - `GET /api/v1/approval-deposits` (Global paginated deposit ledger).
  - `GET /api/v1/approval-deposits/:id` (Get deposit payment details).
  - `POST /api/v1/approval-deposits/:id/reverse` (Reverse deposit payment).
- **RBAC Permissions & Seeders**:
  - Added `approval.deposit.create`, `approval.deposit.read`, `approval.deposit.reverse` permissions.
- **Automated Test Suite**:
  - Created `test/approval_deposit.test.ts` (12 test groups covering payment methods, partial payments, summary calculations, overpayment rejection, reversal with mandatory reason, parallel race condition overpayment protection, and global ledger pagination).
- **Postman Collection Update**:
  - Added Folder `37. Sell on Approval — Deposit & Payment Foundation` to `postman/Jewellery_ERP.postman_collection.json`.

## [7.2.0] - Phase 7 Sprint 7.2: Sell on Approval — Issue & Inventory Locking (Backend) - 2026-08-21

### Added
- **Physical Inventory Control & Locking (`AVAILABLE` → `ON_APPROVAL`)**:
  - Implemented physical inventory locking when an approval slip is issued to a customer (`DRAFT` → `ISSUED`).
  - Item status automatically transitions to `ON_APPROVAL` inside a Prisma transaction.
  - Automatically prevents sales, transfers, job work, or duplicate approval allocation while items are on approval.
- **Atomic Concurrency & Multi-Item Rollback**:
  - Enforced atomic conditional updates (`updateMany` with `where: { id, status: 'AVAILABLE', branchId, companyId }`).
  - Throws `409 Conflict` if any item is updated concurrently or unavailable, cleanly rolling back all item status changes and stock movements.
- **Immutable Stock Ledger Entry (`APPROVAL_ISSUE`)**:
  - Logs immutable `StockMovement` entry (`movementType = "APPROVAL_ISSUE"`, `referenceType = "SALES_APPROVAL"`) for every item issued on approval.
- **Automated Integration & Concurrency Test Suite**:
  - Added `test/approval_inventory_locking.test.ts` (9 test suites covering single/multi-item issue, SOLD item rejection, cross-branch rejection, duplicate item rejection, multi-item atomic rollback, parallel race condition concurrency testing, and Sales Invoice rejection).
- **Postman Collection Update**:
  - Added Folder `36. Sell on Approval — Issue & Inventory Locking` to `postman/Jewellery_ERP.postman_collection.json`.

## [7.1.0] - Phase 7 Sprint 7.1: Sell on Approval Foundation (Backend) - 2026-08-21

### Added
- **Approval Data Models & Schema (`prisma/schema.prisma`)**:
  - `ApprovalStatus` enum (`DRAFT`, `ISSUED`, `WITH_CUSTOMER`, `RETURNED`, `PURCHASED`, `EXPIRED`, `CANCELLED`).
  - `ApprovalItemStatus` enum (`ISSUED`, `RETURNED`, `PURCHASED`, `CANCELLED`).
  - `Approval` model mapped to `public.approvals` table.
  - `ApprovalItem` model mapped to `public.approval_items` table.
  - Model relations on `Company`, `Branch`, `Customer`, `Employee`, and `InventoryItem`.
- **Approval Repository & Service Layer**:
  - Concurrency-safe number generation (`APP-YYYYMMDD-XXXX`).
  - Transactional creation, retrieval, listing, updates, issuing, and cancellation.
  - Robust validations for customer company ownership, branch assignment, salesperson validity, due date constraints, and inventory item availability.
- **REST APIs (`/api/v1/approvals`)**:
  - `POST /api/v1/approvals` (Create draft approval slip).
  - `GET /api/v1/approvals` (List paginated approval slips with filters).
  - `GET /api/v1/approvals/:id` (Get approval details by ID).
  - `PUT /api/v1/approvals/:id` (Update draft approval slip).
  - `POST /api/v1/approvals/:id/issue` (Issue approval slip to customer).
  - `POST /api/v1/approvals/:id/cancel` (Cancel draft approval slip).
- **RBAC & Seeding**:
  - Added permissions: `approval.create`, `approval.read`, `approval.update`, `approval.issue`, `approval.cancel`.
  - Seeded permission catalog and matrix assignments in `prisma/seed/approval_permissions.ts`.
- **OpenAPI Swagger Documentation**:
  - Integrated `approval.swagger.ts` into OpenAPI 3.0 docs under `Sell on Approval Subsystem`.
- **Automated Integration Testing**:
  - Added `test/approval.test.ts` (11 test cases covering complete workflow and validation edge cases, 100% passing).

## [6.5.0] - Phase 6 Sprint 6.5: Girvi Reports & Final Integration Backend - 2026-08-21

### Added
- **Unified Girvi Reporting & Integration Layer**:
  - `GET /api/v1/girvi/reports/portfolio`: Self Girvi portfolio financial summary report with Third-Party metrics separated.
  - `GET /api/v1/girvi/reports/overdue-aging`: Overdue aging analysis report (0-30, 31-60, 61-90, 90+ days overdue).
  - `GET /api/v1/girvi/loans/:id/audit-trail`: Complete 360-degree chronological audit trail for loan lifecycle events.
  - `GET /api/v1/girvi/collections`: Collection ledger report supporting historical reversed collection visibility.
  - `GET /api/v1/girvi/settlements`: Settlement & collateral release ledger report.
  - `GET /api/v1/girvi/loans/:id/released-collateral`: Released pledged collateral jewellery report.
  - `GET /api/v1/girvi/third-party/loans`: Third-Party Girvi report with strict financial isolation from store accounts.
- **Security & Safety Compliance**:
  - All reporting APIs are strictly read-only and generate zero database mutations.
  - Multi-tenant company and branch isolation enforced.
  - Dynamic RBAC permission guard (`girvi.report.read`) enforced.
- **Integration Test Suite**:
  - `test/girvi_reports_integration.test.ts` (18/18 integration scenarios passing 100%).
  - Verified regression stability across Phase 6.1 (`test/girvi.test.ts`), 6.2 (`test/girvi_interest_collection.test.ts`), 6.3 (`test/girvi_settlement_release.test.ts`), 6.4 (`test/third_party_girvi.test.ts`), 6.5 (`test/girvi_reports_audit.test.ts`).


## [5.7.0] - Phase 5 Sprint 5.7: Stock Audit, Stocktake & Inventory Reconciliation - 2026-08-20

### Added
- **Stock Audit & Reconciliation Data Models**:
  - `enum AuditSessionStatus` (`IN_PROGRESS`, `SUBMITTED`, `RECONCILED`, `CANCELLED`).
  - `enum AuditItemStatus` (`MATCHED`, `MISSING`, `UNEXPECTED`, `WEIGHT_MISMATCH`).
  - `StockAuditSession` (`public.stock_audit_sessions`): Subsystem model tracking `auditNumber` (`AUD-YYYYMMDD-XXXX`), `companyId`, `branchId`, `categoryId`, `status`, expected/scanned item counts and weights, audit notes, user IDs, and timestamps.
  - `StockAuditItem` (`public.stock_audit_items`): Line item model tracking scanned barcode/RFID identifiers, expected vs scanned weights, discrepancy weight, and status.
- **REST APIs**:
  - `POST /api/v1/stock-audits`: Create IN_PROGRESS Stock Audit session.
  - `GET /api/v1/stock-audits`: List paginated Stock Audit sessions with filters.
  - `GET /api/v1/stock-audits/:id`: Get Stock Audit session details.
  - `POST /api/v1/stock-audits/:id/scan`: Scan physical item into audit session.
  - `POST /api/v1/stock-audits/:id/submit`: Submit audit session (identifies missing items).
  - `POST /api/v1/stock-audits/:id/reconcile`: Reconcile audit session (`AUDIT_MISSING` status, `STOCKTAKE_MISSING` stock movement logs, `StockAdjustment` records).
  - `POST /api/v1/stock-audits/:id/cancel`: Cancel audit session with mandatory reason.
  - `GET /api/v1/stock-audits/:id/discrepancies`: Get audit discrepancy report.
- **RBAC Matrix**: Seeded `stock_audit.*` permissions across `OWNER`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `CASHIER` roles.
- **Automated Tests**: 26/26 integration scenarios passing in `test/stock_audit.test.ts`.

## [5.6.0] - Phase 5 Sprint 5.6: Karigar / Artisan Job Work & Material Issue Management - 2026-08-20

### Added
- **Karigar Job Work Data Models**:
  - `enum JobWorkOrderStatus` (`DRAFT`, `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - `enum JobWorkItemType` (`RAW_METAL`, `LOOSE_STONE`, `INVENTORY_ITEM`).
  - `JobWorkOrder` (`public.job_work_orders`): Subsystem model tracking `orderNumber` (`JW-YYYYMMDD-XXXX`), `companyId`, `branchId`, `vendorId` (Karigar), `status`, `targetItemName`, `metalType`, `purity`, `agreedWastagePercent`, `agreedMakingChargePerGram`, `totalIssuedFineWeight`, `totalReceivedFineWeight`, `totalWastageWeight`, `totalMakingCharges`, audit timestamps and user IDs.
  - `JobWorkMaterialIssue` (`public.job_work_material_issues`): Model tracking raw bullion or inventory stock issued to Karigars.
  - `JobWorkReceipt` (`public.job_work_receipts`): Model tracking finished jewellery or returned raw material received from Karigars (`JWR-YYYYMMDD-XXXX`).
- **REST APIs**:
  - `POST /api/v1/job-work/orders`: Create draft job work order.
  - `GET /api/v1/job-work/orders`: List paginated job work orders with filters.
  - `GET /api/v1/job-work/orders/:id`: Get job work order details by ID.
  - `PUT /api/v1/job-work/orders/:id`: Update draft job work order.
  - `POST /api/v1/job-work/orders/:id/submit`: Submit draft job work order (`DRAFT -> SUBMITTED`).
  - `POST /api/v1/job-work/orders/:id/assign`: Assign order to Karigar (`SUBMITTED -> ASSIGNED`).
  - `POST /api/v1/job-work/orders/:id/issue-material`: Issue raw metal, loose stones, or inventory stock (`ISSUED_TO_KARIGAR`).
  - `POST /api/v1/job-work/orders/:id/receive`: Receive finished goods, create inventory tag (`AVAILABLE`), log `KARIGAR_RECEIVING` `StockMovement`.
  - `POST /api/v1/job-work/orders/:id/cancel`: Cancel order prior to material issue with mandatory reason.
  - `GET /api/v1/karigars/:id/job-work-summary`: Get Karigar fine gold and labor charges ledger summary.
- **RBAC Matrix**: Seeded `job_work.*` permissions across `OWNER`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, and `KARIGAR_SUPERVISOR` roles.
- **Automated Tests**: 27/27 integration scenarios passing in `test/job_work.test.ts`.

## [5.5.0] - Phase 5 Sprint 5.5: Purchase Return & Vendor Debit Note Management - 2026-08-20

### Added
- **Purchase Return & Vendor Debit Note Models**:
  - `enum PurchaseReturnStatus` (`DRAFT`, `SUBMITTED`, `APPROVED`, `PROCESSED`, `CANCELLED`).
  - `enum DebitNoteStatus` (`ISSUED`, `APPLIED`, `REVERSED`).
  - `PurchaseReturn` (`public.purchase_returns`): Subsystem model tracking `returnNumber` (`PR-YYYYMMDD-XXXX`), `purchaseBillId`, `purchaseOrderId`, `vendorId`, `branchId`, `status`, `reason`, `subtotal`, `taxAmount`, `totalReturnAmount`, audit timestamps and user IDs.
  - `PurchaseReturnItem` (`public.purchase_return_items`): Line item model capturing returned inventory items, physical weights, rates, and line totals.
  - `VendorDebitNote` (`public.vendor_debit_notes`): Financial debit note model tracking `debitNoteNumber` (`DN-YYYY-XXXXX`), `purchaseReturnId`, `vendorId`, `branchId`, `purchaseBillId`, `amount`, and `status`.
- **REST APIs**:
  - `POST /api/v1/purchase-returns`: Create draft purchase return.
  - `GET /api/v1/purchase-returns`: List paginated purchase returns with filters.
  - `GET /api/v1/purchase-returns/:id`: Get purchase return details by ID.
  - `PUT /api/v1/purchase-returns/:id`: Update draft purchase return.
  - `POST /api/v1/purchase-returns/:id/submit`: Submit draft purchase return (`DRAFT -> SUBMITTED`).
  - `POST /api/v1/purchase-returns/:id/approve`: Approve submitted purchase return (`SUBMITTED -> APPROVED`).
  - `POST /api/v1/purchase-returns/:id/process`: Process approved return, remove inventory (`RETURNED_TO_VENDOR`), log `PURCHASE_RETURN` `StockMovement`, issue `VendorDebitNote`, and adjust bill balance.
  - `POST /api/v1/purchase-returns/:id/cancel`: Cancel return with mandatory reason.
  - `GET /api/v1/vendor-debit-notes`: List vendor debit notes.
  - `GET /api/v1/vendor-debit-notes/:id`: Get vendor debit note details.
  - `GET /api/v1/vendors/:id/debit-notes`: Get debit notes for a vendor.
- **RBAC Matrix**: Seeded `purchase_return.*` and `debit_note.read` permissions.
- **Automated Tests**: 30/30 integration scenarios passing in `test/purchase_return.test.ts`.

## [5.4.0] - Phase 5 Sprint 5.4: Vendor Payment & Payable Settlement - 2026-08-20

### Added
- **Vendor Payment Data Models**:
  - `enum VendorPaymentMethod` (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`).
  - `enum VendorPaymentStatus` (`PENDING`, `COMPLETED`, `FAILED`, `REVERSED`).
  - `VendorPayment` (`public.vendor_payments`): Subsystem model tracking `paymentNumber` (`VPAY-YYYY-XXXXX`), `purchaseBillId`, `vendorId`, `branchId`, `amount`, `paymentMethod`, `status`, `transactionReference`, `paymentDate`, `remarks`, audit references (`receivedBy`, `processedBy`), and reversal metadata (`reversedAt`, `reversedBy`, `reversalReason`).
- **REST APIs**:
  - `POST /api/v1/purchase-bills/:id/payments`: Record vendor payment against an approved purchase bill.
  - `GET /api/v1/purchase-bills/:id/payments`: Get payment history for a purchase bill.
  - `GET /api/v1/purchase-bills/:id/payment-summary`: Get payment method breakdown and total paid/outstanding summary.
  - `GET /api/v1/vendor-payments`: List paginated vendor payments with filters.
  - `GET /api/v1/vendor-payments/:id`: Get single vendor payment details by ID.
  - `POST /api/v1/vendor-payments/:id/reverse`: Reverse a completed vendor payment with mandatory reason.
  - `GET /api/v1/vendors/:id/payments`: Get all payment records for a vendor.
  - `GET /api/v1/vendors/:id/payable-summary`: Get vendor payable summary.
- **Dynamic RBAC & Seed Matrix**:
  - Added permissions: `vendor_payment.create`, `vendor_payment.read`, `vendor_payment.reverse`.
  - Configured role assignments across `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `CASHIER`, `KARIGAR_SUPERVISOR`.
- **Automated Test Suite**:
  - Added `test/vendor_payment.test.ts` passing all 40 integration scenarios (100% pass rate).
- **Postman Collection**:
  - Added Folder 32 (`32. Vendor Payments & Payable Settlement`).
- **Documentation**:
  - Created [`docs/PHASE_5_SPRINT_5_4_VENDOR_PAYMENTS.md`](file:///e:/JMS/jms-backend/docs/PHASE_5_SPRINT_5_4_VENDOR_PAYMENTS.md).

## [5.3.0] - Phase 5 Sprint 5.3: Purchase Billing, Costing & Vendor Payable Foundation - 2026-08-20

### Added
- **Purchase Billing Data Models**:
  - `enum PurchaseBillStatus` (`DRAFT`, `SUBMITTED`, `APPROVED`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`).
  - `PurchaseBill` (`public.purchase_bills`): Header tracking `billNumber` (`PB-YYYYMMDD-XXXX`), `purchaseOrderId`, `vendorId`, `branchId`, `status`, `billDate`, `dueDate`, `subtotal`, `discountAmount`, `taxAmount`, `grandTotal`, `totalPaid` (default 0), `outstandingAmount`, `notes`, and audit metadata (`createdBy`, `submittedBy`, `approvedBy`, `cancelledBy`, `cancellationReason`).
  - `PurchaseBillItem` (`public.purchase_bill_items`): Line item record referencing `purchaseOrderItemId`, `purchaseReceiptItemId`, `inventoryItemId`, `itemName`, `quantity`, `grossWeight`, `stoneWeight`, `netWeight`, `purchaseRate`, `metalValue`, `makingCharges`, `discountAmount`, `taxableAmount`, `taxRate`, `taxAmount`, `lineTotal`.
- **REST APIs**:
  - `POST /api/v1/purchase-bills`: Create draft Purchase Bill.
  - `GET /api/v1/purchase-bills`: List paginated bills with search, vendor, branch, PO, status & date filters.
  - `GET /api/v1/purchase-bills/:id`: Get purchase bill details with line items.
  - `PUT /api/v1/purchase-bills/:id`: Update draft Purchase Bill.
  - `POST /api/v1/purchase-bills/:id/submit`: Submit draft bill (`DRAFT -> SUBMITTED`).
  - `POST /api/v1/purchase-bills/:id/approve`: Approve submitted bill (`SUBMITTED -> APPROVED`).
  - `POST /api/v1/purchase-bills/:id/cancel`: Cancel bill with mandatory reason (`DRAFT/SUBMITTED -> CANCELLED`).
  - `GET /api/v1/purchases/:id/bills`: Get purchase bills for a Purchase Order.
  - `GET /api/v1/vendors/:id/purchase-bills`: Get purchase bills for a Vendor.
  - `GET /api/v1/purchase-bills/:id/summary`: Get financial summary.
- **Dynamic RBAC & Seed Matrix**:
  - Added permissions: `purchase_bill.create`, `purchase_bill.read`, `purchase_bill.update`, `purchase_bill.submit`, `purchase_bill.approve`, `purchase_bill.cancel`.
  - Assigned permissions across `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `CASHIER`, `KARIGAR_SUPERVISOR`.
- **Automated Test Suite**:
  - Added `test/purchase_bill.test.ts` passing all 29 integration scenarios (100% pass rate).
- **Postman Collection**:
  - Added Folder 31 (`31. Purchase Bills & Costing`).
- **Documentation**:
  - Created [`docs/PHASE_5_SPRINT_5_3_PURCHASE_BILLING.md`](file:///e:/JMS/jms-backend/docs/PHASE_5_SPRINT_5_3_PURCHASE_BILLING.md).

## [5.1.0] - Phase 5 Sprint 5.1: Purchase Foundation - 2026-08-18

### Added
- **Procurement & Purchase Data Models**:
  - `enum PurchaseOrderStatus` (`DRAFT`, `SUBMITTED`, `APPROVED`, `RECEIVING`, `COMPLETED`, `CANCELLED`).
  - `PurchaseOrder` (`public.purchase_orders`): Master PO document tracking `purchaseOrderNumber` (`PO-YYYYMMDD-XXXX`), `vendorId`, `branchId`, `status`, `orderDate`, `expectedDeliveryDate`, `subtotal`, `taxAmount`, `grandTotal`, `notes`, `termsConditions`, and comprehensive lifecycle audit metadata (`createdBy`, `submittedBy`, `submittedAt`, `approvedBy`, `approvedAt`, `cancelledBy`, `cancelledAt`, `cancellationReason`).
  - `PurchaseOrderItem` (`public.purchase_order_items`): Ordered line items supporting jewellery attributes (`productId`, `metalType`, `purity`, `itemName`, `grossWeight`, `netWeight`, `stoneWeight`, `expectedRate`, `makingCharges`, `taxRate`, `taxAmount`, `itemTotal`, `orderedQuantity`, `receivedQuantity`).
- **REST APIs**:
  - `POST /api/v1/purchases`: Create draft Purchase Order with line items.
  - `GET /api/v1/purchases`: List paginated POs with search, vendor, branch, status, and date filters.
  - `GET /api/v1/purchases/:id`: Get PO details with line items and vendor/branch relations.
  - `PUT /api/v1/purchases/:id`: Update draft PO and recalculate totals.
  - `POST /api/v1/purchases/:id/submit`: Submit draft PO for review (`DRAFT -> SUBMITTED`).
  - `POST /api/v1/purchases/:id/approve`: Approve submitted PO (`SUBMITTED -> APPROVED`).
  - `POST /api/v1/purchases/:id/cancel`: Cancel PO with mandatory reason (`DRAFT/SUBMITTED/APPROVED -> CANCELLED`).
- **Dynamic RBAC & Seed Matrix**:
  - Created `purchase.create`, `purchase.read`, `purchase.update`, `purchase.submit`, `purchase.approve`, `purchase.cancel`.
  - Configured role access across `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT`, `STAFF`, `SALESPERSON`, `KARIGAR_SUPERVISOR`.
- **Automated Test Suite**:
  - Added `test/purchase_order.test.ts` passing all 22 scenarios (100% pass rate).
- **Postman Collection**:
  - Added Folder 29 (`29. Purchase Orders (Procurement)`).
- **Documentation**:
  - Created [`docs/PHASE_5_SPRINT_5_1_PURCHASE_FOUNDATION.md`](file:///e:/JMS/jms-backend/docs/PHASE_5_SPRINT_5_1_PURCHASE_FOUNDATION.md).

## [4.8.0] - Phase 4 Sprint 4.8: Final Sales System Integration, Audit & Release Hardening - 2026-08-14

### Complete Phase 4 Release & Audit Hardening
- **Phase 4 Deliverables Sign-Off**: Successfully unified and audited all Phase 4 modules (Sprint 4.1 through 4.7):
  - Phase 4.1 — Sales Transaction Foundation
  - Phase 4.2 — Metal Rate Engine & Rate Locking
  - Phase 4.3 — POS Billing & Inventory Deduction
  - Phase 4.4 — Making Charges, Wastage & GST/Tax Engine
  - Phase 4.5 — Payment Processing & Sales Settlement
  - Phase 4.6 — Gold Exchange / Old Gold Management
  - Phase 4.7 — Sales Return & Refund Management
- **Automated Integration & Audit Test Suite (`test/phase4_final_integration.test.ts`)**:
  - 30 comprehensive end-to-end audit scenarios passing 100%.
  - Full sales lifecycle: DRAFT $\rightarrow$ Lock Rate $\rightarrow$ Calculate Pricing $\rightarrow$ POS Confirm $\rightarrow$ Inventory `SOLD` $\rightarrow$ `StockMovement` `SALE` $\rightarrow$ Payment $\rightarrow$ Settlement (`PAID`, Outstanding = 0).
  - Gold Exchange lifecycle: `REQUESTED` $\rightarrow$ `VALUED` $\rightarrow$ `APPLIED` $\rightarrow$ `exchangeCredit` on invoice $\rightarrow$ Remaining outstanding settlement.
  - Sales Return & Refund lifecycle: `REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PROCESSED` $\rightarrow$ Inventory restored to `AVAILABLE` $\rightarrow$ `StockMovement` `SALE_RETURN` $\rightarrow$ `SalesRefund` ledger record.
  - Security & dynamic RBAC enforcement (401 unauthenticated, 403 unauthorized).
  - Concurrency & idempotency protection: Atomic inventory lock, overpayment prevention, and duplicate return prevention.
  - Immutability assurance: Master rate updates do not alter historical confirmed invoice snapshots, payments, or stock movement ledgers.
- **Postman Workspace**: Added Folder 28 (`28. Phase 4 Final Integration & Regression`).
- **Comprehensive Documentation**: Added [`docs/PHASE_4_FINAL_COMPLETION_REPORT.md`](file:///e:/JMS/jms-backend/docs/PHASE_4_FINAL_COMPLETION_REPORT.md), updated all Phase 4 architecture and handover documents.

## [4.7.0] - Phase 4 Sprint 4.7: Sales Return & Refund Management - 2026-08-14

### Added
- **Sales Return & Refund Data Models**:
  - `enum SalesReturnStatus` (`REQUESTED`, `APPROVED`, `PROCESSED`, `CANCELLED`).
  - `enum RefundStatus` (`PENDING`, `COMPLETED`, `REVERSED`).
  - `SalesReturn` (`public.sales_returns`): Header model tracking `returnNumber` (`RET-YYYY-XXXXX`), `salesInvoiceId`, `customerId`, `branchId`, `status`, financial breakdown (`subtotal`, `taxAmount`, `deductionAmount`, `refundAmount`), and lifecycle audit timestamps (`requestedBy`, `approvedBy`, `processedBy`, `cancelledBy`).
  - `SalesReturnItem` (`public.sales_return_items`): Line item record with `salesInvoiceItemId`, `inventoryItemId`, `quantity`, `originalAmount`, `taxAmount`, `deductionAmount`, and `refundAmount`.
  - `SalesRefund` (`public.sales_refunds`): Separate financial refund ledger model tracking `refundNumber` (`REF-YYYY-XXXXX`), `salesReturnId`, `refundMethod` (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`), `amount`, `status`, audit references, and reversal metadata.
- **Business Logic & Workflow Engine**:
  - State machine: `REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PROCESSED` or `REQUESTED/APPROVED` $\rightarrow$ `CANCELLED`.
  - Valuation preservation: Retains original invoice line-item price snapshots without recalculating with current fluctuating metal rates.
  - Concurrency protection: Double-return prevention returning `409 Conflict`.
  - Gold Exchange protection: Invoices with `exchangeCredit > 0` are guarded (`400 Bad Request`).
  - Atomic inventory restoration on `PROCESSED`: Conditional update `SOLD` $\rightarrow$ `AVAILABLE` + `SALE_RETURN` `StockMovement` audit creation.
  - Immutable refund ledger: Historical `SalesPayment` records remain intact, refunds issued via dedicated ledger with over-refund rejection.
  - Refund reversal: Reversal workflow with mandatory reason logging.
- **RBAC Dynamic Permissions (9 permissions)**:
  - `sales_return.create`, `sales_return.read`, `sales_return.update`, `sales_return.approve`, `sales_return.process`, `sales_return.cancel`, `sales_refund.create`, `sales_refund.read`, `sales_refund.reverse`.
- **API Endpoints & Documentation**:
  - `/api/v1/sales/returns` (CRUD, approve, process, cancel, history).
  - `/api/v1/sales/invoices/:id/returns` (returns by invoice).
  - `/api/v1/sales/refunds` (create, list, getById, reverse).
  - `/api/v1/sales/returns/:id/refunds` (refunds by return).
  - Postman Folder 27 (`27. Sales Returns & Refunds (Phase 4)`).
  - OpenAPI 3.0 Swagger specifications.
- **Automated Integration Tests**:
  - `test/sales_return.test.ts` (12 test scenarios passing 100%).
  - `test/sales_refund.test.ts` (7 test scenarios passing 100%).

## [4.6.0] - Phase 4 Sprint 4.6: Gold Exchange / Old Gold Management - 2026-08-14

### Added
- **Gold Exchange Master Data & Data Model**:
  - `CustomerGoldExchange` (`public.customer_gold_exchanges`): Header record linked to `SalesInvoice`, `Customer`, and `Branch`.
  - `CustomerGoldExchangeItem` (`public.customer_gold_exchange_items`): Line item record with `metalType` (`GOLD`, `SILVER`, `PLATINUM`), `purity`, `grossWeight`, `stoneWeight`, `netWeight`, `metalRateId`, `ratePerGram`, `metalValue`, `deductionPercent`, `deductionAmount`, and `exchangeValue`.
  - Extended `SalesInvoice` model with `exchangeCredit` (`Decimal(12, 2)`).
- **State Machine Lifecycle & Workflow**:
  - Status transitions: `REQUESTED` $\rightarrow$ `VALUED` $\rightarrow$ `APPLIED` / `CANCELLED`.
  - `POST /api/v1/sales/invoices/:invoiceId/gold-exchanges`: Creates exchange against `DRAFT` invoice.
  - `POST /api/v1/gold-exchanges/:id/value`: Resolves active metal rate using `metalRateRepository.findCurrentRate` and snapshots rate per gram.
  - `POST /api/v1/gold-exchanges/:id/apply`: Applies exchange credit to `SalesInvoice.exchangeCredit` and recalculates `outstandingAmount`.
  - `POST /api/v1/gold-exchanges/:id/cancel`: Cancels `REQUESTED` or `VALUED` exchange.
- **Sprint 4.5 Payment Settlement Integration**:
  - Integrated exchange credit into `salesPaymentService` settlement logic: $\text{Net Payable} = \text{Grand Total} - \text{Exchange Credit}$.
- **RBAC Permissions**:
  - Added `gold_exchange.create`, `gold_exchange.read`, `gold_exchange.update`, `gold_exchange.value`, `gold_exchange.apply`, `gold_exchange.cancel` to `phase4_permissions.ts` seed.
- **Documentation & QA**:
  - Postman collection folder `26. Gold Exchange / Old Gold (Phase 4)` added to `postman/Jewellery_ERP.postman_collection.json`.
  - OpenAPI Swagger spec merged into `src/docs/swagger.ts`.
  - `docs/GOLD_EXCHANGE_API_HANDOVER.md` and `docs/GOLD_EXCHANGE_DESIGN.md`.
  - Automated integration test suite `test/gold_exchange.test.ts` passing 100% green across 14 test scenarios.

## [4.5.0] - Phase 4 Sprint 4.5: Payment Processing & Sales Settlement - 2026-08-14

### Added
- **Payment Master & Settlement Schema**:
  - `PaymentMethod` enum (`CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`).
  - `PaymentStatus` enum (`PENDING`, `COMPLETED`, `FAILED`, `REVERSED`).
  - `SalesPayment` model (`public.sales_payments`) with `salesInvoiceId`, `paymentNumber` (unique), `paymentMethod`, `amount` (`Decimal(12, 2)`), `status`, `transactionReference`, `paymentDate`, `remarks`, `receivedBy`, `reversedAt`, `reversedBy`, `reversalReason`.
  - Extended `SalesInvoice` model with settlement tracking fields: `totalPaid` (`Decimal(12, 2)`), `outstandingAmount` (`Decimal(12, 2)`), `paymentStatus` (`'UNPAID'`, `'PARTIALLY_PAID'`, `'PAID'`), and `payments` relation.
- **Payment Processing Engine**:
  - `POST /api/v1/sales/payments`: Records payments against `CONFIRMED` invoices.
  - Supports split payments across Cash, Card, UPI, Bank Transfer, and Cheque.
  - Invoice status transition tracking: `UNPAID` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `PAID`.
  - Collision-safe sequential payment number generator (`PAY-YYYY-XXXXX`).
  - Overpayment protection: Validates payment amount against $\text{Outstanding Amount} = \text{Grand Total} - \text{Total Completed Payments}$ and returns `409 Conflict` if exceeded.
  - Concurrency safety: Executes inside `prisma.$transaction()` to prevent concurrent overpayments.
- **Immutable Payment Reversals**:
  - `POST /api/v1/sales/payments/:id/reverse`: Marks payment `status = REVERSED` with mandatory `reversalReason`.
  - Records `reversedAt` and `reversedBy` audit metadata.
  - Recalculates invoice `totalPaid`, `outstandingAmount`, and `paymentStatus` (`PAID` $\rightarrow$ `PARTIALLY_PAID` $\rightarrow$ `UNPAID`).
  - Physical `DELETE` omitted; payment record is preserved for financial audit trail.
- **Payment History & Summary APIs**:
  - `GET /api/v1/sales/payments`: List payments with search, filters (method, status, dates, invoiceId), and pagination.
  - `GET /api/v1/sales/payments/:id`: Fetch single payment details.
  - `GET /api/v1/sales/invoices/:id/payments`: Fetch invoice payment history.
  - `GET /api/v1/sales/invoices/:id/payment-summary`: Fetch financial settlement summary with payment method breakdown.
- **Documentation & QA**:
  - Postman collection folder `25. Sales Payments & Settlement (Phase 4)` added to `postman/Jewellery_ERP.postman_collection.json`.
  - Swagger OpenAPI specification registered in `src/docs/swagger.ts`.
  - `docs/PAYMENT_API_HANDOVER.md` and `docs/PAYMENT_SETTLEMENT_DESIGN.md`.
  - Automated test suite `test/sales_payment.test.ts` passing 100% green.

## [4.4.0] - Phase 4 Sprint 4.4: Making Charges, Wastage & GST/Tax Engine - 2026-08-14

### Added
- **Master Data Models & Repositories**:
  - `MakingCharge` model (`public.making_charges`) supporting `PER_GRAM`, `FIXED`, and `PERCENTAGE` rates.
  - `TaxRate` model (`public.tax_rates`) for company-wide GST management.
  - Overlap protection queries (`findOverlappingRate`) preventing overlapping active periods (409 Conflict).
  - Soft-deactivation endpoints preserving historical audit records.
- **Jewellery Pricing Engine & GST Computation**:
  - Prisma `Decimal` arithmetic enforcing strict 2 and 3 decimal place precision using `ROUND_HALF_UP`.
  - Metal Value calculation: $\text{Net Weight} \times \text{Locked Rate Per Gram}$.
  - Wastage Weight & Value calculation.
  - Making Charges calculation (`PER_GRAM`, `FIXED`, `PERCENTAGE`).
  - Tax calculation supporting `INTRA_STATE` (CGST + SGST split 50/50) and `INTER_STATE` (100% IGST).
  - `POST /api/v1/sales/invoices/:id/calculate-pricing`: Recalculates and persists line breakdown and invoice totals atomically.
  - `GET /api/v1/sales/invoices/:id/pricing`: Retrieves stored immutable pricing snapshot.
- **Confirmation Guard Rules**:
  - Updated `confirmSalesInvoice` to require both `metalRateLocked === true` AND `pricingCalculated === true`.
  - Confirmed invoices retain immutable pricing snapshots and cannot be recalculated.
- **Documentation & QA**:
  - Postman collection folder `24. Making Charges, Wastage & GST (Phase 4)`.
  - Swagger specs merged for making charges, tax rates, and pricing endpoints.
  - `docs/PRICING_API_HANDOVER.md` and `docs/PRICING_ENGINE_DESIGN.md`.
  - Automated integration test suites `test/making_charge.test.ts`, `test/tax_rate.test.ts`, `test/pricing.test.ts` passing 100% green.

## [4.3.0] - Phase 4 Sprint 4.3: POS Billing & Inventory Deduction - 2026-08-14

### Added
- **Atomic POS Invoice Confirmation**:
  - `POST /api/v1/sales/invoices/:id/confirm`: Executes POS confirmation inside atomic `prisma.$transaction()`.
  - Atomically transitions line items `AVAILABLE → SOLD`.
  - Creates immutable `StockMovement` entries (`movementType = 'SALE'`, `referenceType = 'POS_INVOICE'`).
  - Updates `SalesInvoice` status to `CONFIRMED`.
- **Concurrency & Race Condition Protection**:
  - Atomic conditional status update `UPDATE inventory_items SET status = 'SOLD' WHERE id = ? AND status = 'AVAILABLE' AND branch_id = ?`.
  - If updated row count is 0 (due to concurrent sale or item no longer available), rolls back entire transaction and returns `409 Conflict`.
- **POS Scanning Inventory Item Lookup**:
  - `GET /api/v1/sales/pos/inventory/:identifier`: Fast lookup for AVAILABLE inventory items by `itemCode`, `barcode`, `qrCode`, or `id`.
- **Validation & Business Rules**:
  - Prevents confirming empty invoices (`400 Bad Request`).
  - Prevents duplicate inventory items inside invoice line items array (`400 Bad Request`).
  - Prevents cross-branch sales (`400 Bad Request`).
  - Prevents confirming invoices containing non-AVAILABLE items (`400 Bad Request`).
  - Full transaction rollback guarantee if any item fails confirmation.
- **Documentation & QA**:
  - Added Postman folder `23. POS Billing & Inventory Deduction (Phase 4)`.
  - OpenAPI Swagger documentation for POS confirmation and scanning lookup.
  - Frontend handover guide `docs/POS_BILLING_API_HANDOVER.md`.
  - Automated integration test suite `test/sales_pos.test.ts` passing 100% green.

## [4.2.0] - Phase 4 Sprint 4.2: Metal Rate Engine & Rate Locking - 2026-08-14

### Added
- **Metal Rate Models & Schema**:
  - `MetalRate` (`public.metal_rates`) and `SalesInvoiceMetalRate` (`public.sales_invoice_metal_rates`) Prisma models.
  - Extensible `MetalType` enum (`GOLD`, `SILVER`, `PLATINUM`).
  - Extended `SalesInvoice` model with `metalRateLocked`, `metalRateLockedAt`, and relation to `SalesInvoiceMetalRate` snapshot.
- **Rate Integrity & Business Engine**:
  - Positive rate enforcement (`ratePerGram > 0`).
  - Active rate period overlap protection (rejects overlapping periods for same company, metal type, and purity with `409 Conflict`).
  - Current rate resolution engine (`getCurrentRate`).
  - High-precision metal value calculation (`POST /api/v1/metal-rates/calculate`).
  - Soft-deactivation (`isActive = false`) to guarantee permanent historical rate auditability.
- **Invoice Rate Locking Foundation**:
  - `POST /api/v1/sales/invoices/:id/lock-metal-rate`: Locks rate snapshot on `DRAFT` sales invoices inside atomic `prisma.$transaction()`.
  - Idempotency guard: Re-locking returns `409 Conflict` ("Metal rate is already locked for this invoice").
  - Lock rejection on `CONFIRMED` and `CANCELLED` invoices (`400 Bad Request`).
  - Rate snapshot immutability: Master metal rate changes never alter previously locked invoice rate snapshots.
- **Permissions & RBAC**:
  - Seeded sales permission catalog: `metal_rate.create`, `metal_rate.read`, `metal_rate.update`.
  - Assigned permissions to `OWNER`, `ADMIN`, `MANAGER`, `CASHIER`, and `SALES_EXECUTIVE` roles.
- **Documentation & Tests**:
  - OpenAPI 3.0 Swagger specs in `src/modules/metal-rates/metalRate.swagger.ts`.
  - Postman collection updated with `22. Metal Rate Engine (Phase 4)` folder.
  - Handover docs: `docs/METAL_RATE_API_HANDOVER.md` and `docs/METAL_RATE_DATABASE_DESIGN.md`.
  - Automated test suite `test/metal_rate.test.ts` passing 100% green.

## [4.1.0] - Phase 4 Sprint 4.1: Sales Transaction Foundation - 2026-08-14

### Added
- **Sales Invoice Foundation & Models**:
  - `SalesInvoice` (`public.sales_invoices`) and `SalesInvoiceItem` (`public.sales_invoice_items`) Prisma models with `ON DELETE CASCADE` foreign key for items.
  - `SalesInvoiceStatus` enum (`DRAFT`, `CONFIRMED`, `CANCELLED`).
  - Collision-safe sequential invoice number generator (`INV-YYYY-XXXXX` or `INV-<BRANCH>-YYYY-XXXXX`).
- **Controlled Invoice Lifecycle & State Machine**:
  - Strict state machine: `DRAFT -> CONFIRMED`, `DRAFT -> CANCELLED`, `CONFIRMED -> CANCELLED`.
  - Illegal status transitions (`CONFIRMED -> DRAFT`, `CANCELLED -> DRAFT`, `CANCELLED -> CONFIRMED`) blocked with 400 Bad Request.
  - Immutability guards: `CONFIRMED` and `CANCELLED` invoices cannot be edited.
  - Historical preservation: `CANCELLED` invoices remain preserved in database, no hard deletion API.
  - Inventory status safety: Sprint 4.1 does NOT mutate `InventoryItem.status` (remains `AVAILABLE`).
- **Permissions & RBAC**:
  - Seeded sales permission catalog: `sales_invoice.create`, `sales_invoice.read`, `sales_invoice.update`, `sales_invoice.confirm`, `sales_invoice.cancel`.
  - Assigned permissions to `OWNER`, `ADMIN`, `MANAGER`, and `CASHIER` roles.
- **API Endpoints**:
  - `POST /api/v1/sales/invoices`: Create DRAFT invoice.
  - `GET /api/v1/sales/invoices`: List invoices with search, status/branch/customer filter, and pagination.
  - `GET /api/v1/sales/invoices/:id`: Get invoice details.
  - `GET /api/v1/sales/invoices/:id/items`: Get invoice line items.
  - `PUT/PATCH /api/v1/sales/invoices/:id`: Update DRAFT invoice.
  - `POST /api/v1/sales/invoices/:id/confirm`: Confirm DRAFT invoice.
  - `POST /api/v1/sales/invoices/:id/cancel`: Cancel invoice.
- **Documentation & Postman**:
  - OpenAPI 3.0 Swagger specs in `src/modules/sales-invoices/salesInvoice.swagger.ts`.
  - Dedicated "Sales" folder added to `postman/Jewellery_ERP.postman_collection.json`.
  - Automated test suite `test/sales_invoice.test.ts` passing 100% green.

## [3.7.0] - Phase 1 Admin Authority & API Integration Contract - 2026-08-13

### Added
- **Backend ADMIN Authority & Endpoint Aliases**:
  - Dynamic `permissions: string[]` payload included in `AuthUserResponse` for `POST /api/v1/auth/login` and `GET /api/v1/auth/me`.
  - Endpoint route aliases mounted under `/api/v1`, `/api`, and `/`: `/login`, `/me`, `/logout`, `/refresh`.
  - Added unique nonce to refresh token payloads in `src/modules/auth/auth.service.ts` to prevent refresh token database collisions on rapid logins.
  - Automated test suite `test/admin_authority.test.ts` testing ADMIN login, profile loading, dynamic permission array, Phase 1/2/3 access, and dynamic 403 Forbidden enforcement.
  - Postman collection updated with `POST Login (Admin)` request and environment variables `adminEmail` and `adminPassword`.
  - Complete handover documentation created in `docs/ADMIN_FRONTEND_AUTHORITY.md`.

## [3.6.0] - Phase 1 Admin Role & Phase 3 Image Management Completion - 2026-08-13

### Added
- **Phase 1 Admin Role Completion**:
  - Implemented dynamic database RBAC resolution for `ADMIN` role (`ADMIN -> RolePermission -> Permission -> requirePermission()`).
  - Removed `user.role === 'ADMIN'` hardcoded authorization bypass in `src/middleware/authorize.middleware.ts` (only `OWNER` retains super-admin bypass).
  - Seeded missing permission `role.assign_permission` and mapped all Phase 1, Phase 2, and Phase 3 permissions to `ADMIN`.
  - System role protection enforced for `ADMIN` in `src/modules/roles/role.service.ts` (`Cannot Delete ADMIN Role`).
  - Seeded deterministic test accounts (`admin@jewelleryerp.com` and `admin@erp.com`).
- **Phase 3 Product & Inventory Item Image Management Subsystem**:
  - Additive `ProductImage` (`product_images`) and `InventoryItemImage` (`inventory_item_images`) Prisma models.
  - Multi-part image upload handling with `multer` middleware, MIME validation (`JPEG`, `PNG`, `WEBP`), 5MB size limit (`MAX_FILE_SIZE`), and safe UUID filename generation.
  - Express static file serving for local development under `/uploads`.
  - Transactional primary image replacement (`isPrimary = true` automatically unsets former primary image via `prisma.$transaction`).
  - Primary image deletion promotion (deleting primary image automatically promotes next image to primary).
  - Physical file deletion cleanup on record deletion.
  - Inventory Safety Enforced (image operations never touch weights, branch, status, or create stock movements).
  - RBAC permissions: `product_image.create`, `product_image.read`, `product_image.update`, `product_image.delete`, `inventory_item_image.create`, `inventory_item_image.read`, `inventory_item_image.update`, `inventory_item_image.delete`.
  - OpenAPI Swagger documentation (`src/docs/image.swagger.ts`) and Postman Collection folder (`21. Inventory / Product Images`).
  - Automated test suites (`test/product_image.test.ts` and `test/inventory_item_image.test.ts`) passing 100% green.
  - Frontend handover package `docs/INVENTORY_PRODUCT_IMAGE_API_HANDOVER.md`.

## [3.5.0] - Phase 3 Sprint 3.5: Branch Stock Transfer Management - 2026-08-12

### Added
- **Sprint 3.5**: Branch Stock Transfer Management Subsystem:
  - Additive `InventoryTransfer` model (`inventory_transfers` table) and `TransferStatus` enum (`REQUESTED`, `APPROVED`, `REJECTED`, `DISPATCHED`, `RECEIVED`, `CANCELLED`).
  - 7 RESTful endpoints mounted at `/api/v1/inventory-transfers`: `POST /`, `GET /`, `GET /:id`, `POST /:id/approve`, `POST /:id/reject`, `POST /:id/dispatch`, `POST /:id/receive`.
  - Transactional state transitions (`REQUESTED` -> `APPROVED` -> `DISPATCHED` -> `RECEIVED`).
  - Automatic `StockMovement` audit logging on dispatch (`movementType: 'TRANSFER'`, `referenceType: 'INVENTORY_TRANSFER'`).
  - Automatic `InventoryItem.branchId` update and status restoration to `AVAILABLE` on receiving.
  - Active transfer lock preventing duplicate requests on the same item (`409 Conflict`).
  - RBAC permissions: `inventory_transfer.create`, `inventory_transfer.read`, `inventory_transfer.approve`, `inventory_transfer.reject`, `inventory_transfer.dispatch`, `inventory_transfer.receive`.
  - Interactive Swagger OpenAPI specs and Postman Collection folder (`20. Inventory Transfers / Branch Transfer`).
  - Unit test suite `test/inventory_transfer.test.ts` passing 100% green.
  - Frontend handover package `docs/INVENTORY_TRANSFER_API_HANDOVER.md`.

## [3.4.0] - Phase 3 Sprint 3.4: Barcode & QR Code Tag Generation / Management - 2026-08-12

### Added
- **Sprint 3.4**: Production-Ready Barcode & QR Code Tag Management Engine:
  - 8 RESTful endpoints mounted under configured API prefix (`/api/v1/inventory-tags` and `/api/v1/inventory-items/:id/tag`).
  - Collision-safe auto-generation strategy for barcodes (`BC-<itemCode>`) and QR codes (`QR-<itemCode>`).
  - Direct lookup endpoints by barcode (`/api/v1/inventory-tags/barcode/:barcode`) and QR code (`/api/v1/inventory-tags/qr/:qrCode`).
  - Atomic tag regeneration via `prisma.$transaction`.
  - Tag status activation/deactivation (`isActive: boolean`).
  - Stock State & Movement Isolation — Tag operations never modify `InventoryItem.status`, weights, branch, or create `StockMovement` records.
  - Optional RFID EPC field (`rfidEpc: null`) — hardware readers/scanners/printers deferred.
  - RBAC permissions: `inventory_tag.create`, `inventory_tag.read`, `inventory_tag.update`.
  - Swagger OpenAPI specs and Postman Collection folder (`19. Inventory Tags / Barcode & QR`).
  - Unit test suite `test/inventory_tag.test.ts` passing 100% green.
  - Frontend handover package `docs/INVENTORY_TAG_API_HANDOVER.md`.

## [3.3.0] - Phase 3 Sprint 3.3: Stock Movements & Audit History - 2026-08-12

### Added
- **Sprint 3.3**: Core Stock Movement Engine & Immutable Audit Ledger:
  - 3 RESTful endpoints mounted at single API prefix `/api/v1/stock-movements`: `POST /`, `GET /`, `GET /:id`.
  - Immutable audit ledger enforcement — `PUT` and `DELETE` endpoints omitted.
  - Transaction safety — state transitions (`STOCK_IN` -> `AVAILABLE`, `TRANSFER` -> updates `branchId`, `STOCK_OUT` -> `SOLD`) executed atomically with `StockMovement` creation inside `prisma.$transaction`.
  - Movement type foundation support (`STOCK_IN`, `STOCK_OUT`, `TRANSFER`, `ADJUSTMENT`, `SALE`, `SALE_RETURN`, `PURCHASE`, `PURCHASE_RETURN`, `REPAIR_OUT`, `REPAIR_IN`, `APPROVAL_OUT`, `APPROVAL_RETURN`).
  - Search, multi-branch filtering, date-range filtering, pagination, and whitelisted sorting.
  - RBAC permissions: `stock_movement.create`, `stock_movement.read`.
  - Interactive Swagger OpenAPI specs and Postman Collection folder (`18. Stock Movements & Audit`).
  - Unit test suite `test/stock_movement.test.ts` passing 100% green.
  - Frontend handover package `docs/STOCK_MOVEMENT_API_HANDOVER.md`.

## [3.2.0] - Phase 3 Sprint 3.2: Inventory Item Management & Jewellery Attributes - 2026-08-12

### Added
- **Sprint 3.2**: Phase 3 Inventory Item Management RESTful APIs:
  - 6 RESTful endpoints (`/api/v1/inventory-items`): `POST /`, `GET /`, `GET /:id`, `GET /:id/history`, `PUT /:id`, `DELETE /:id`.
  - Service logic validating `Product` and `Branch` existence & active status (`404`), `itemCode`/`barcode`/`qrCode`/`rfidEpc` uniqueness (`409`), and `grossWeight >= netWeight` rule (`400`).
  - Automatic `STOCK_IN` movement record on item creation.
  - Automatic `StockAdjustment` audit record on physical weight re-calibration update.
  - Audit history deletion protection (`409 Conflict` if movements exist).
  - RBAC permissions: `inventory_item.create`, `inventory_item.read`, `inventory_item.update`, `inventory_item.delete`.
  - Interactive Swagger OpenAPI 3.0 specs and Postman Collection folder (`17. Inventory Item Management`).
  - Unit test suite `test/inventory_item.test.ts` passing 100% green.
  - Frontend handover package `docs/INVENTORY_API_HANDOVER_PACKAGE.md`.

## [3.1.0] - Phase 3 Sprint 3.1: Inventory Foundation & Database Schema - 2026-08-12

### Added
- **Sprint 3.1**: Phase 3 Inventory Foundation & Database Schema implementation:
  - 4 Inventory Models added to `prisma/schema.prisma` (`InventoryItem`, `InventoryTag`, `StockMovement`, `StockAdjustment`).
  - Added audit protection (`onDelete: Restrict`) on `StockMovement` and `StockAdjustment` relations to `InventoryItem`.
  - Defined User audit relations (`createdBy`, `updatedBy`, `performedBy`, `adjustedBy`) linking to `iam.users.id`.
  - Built physical item identification layer (`InventoryTag`) supporting unique Barcode, QR Code, and optional `rfidEpc` (`rfid_epc = null` for hardware independence).
  - Additive non-destructive Prisma migration `20260812000000_phase3_sprint3_1_inventory_foundation`.
  - TypeScript seed script `prisma/seed/inventory.ts` populating initial 22K Gold Rings & Necklaces with `rfidEpc = null`, initial `STOCK_IN` movements, and precision weight audit `StockAdjustment` entries.
  - Comprehensive unit test suite `test/inventory_db.test.ts` verifying table relations, audit history protection (`onDelete: Restrict`), unique constraints, null RFID EPC support, and RFID uniqueness when provided.

## [1.0.0] - Phase 1: Identity & Access Management (IAM) - 2026-08-06

### Added
- **Sprint 1.1**: Database schema `iam` created in PostgreSQL 18 with 7 authentication tables (`roles`, `permissions`, `role_permissions`, `users`, `user_sessions`, `login_history`, `password_reset_tokens`), PK UUIDs, foreign keys, indexes, and timestamp triggers.
- **Sprint 1.2**: Idempotent SQL seeds for 8 proposal roles (`OWNER`, `MANAGER`, `CASHIER`, `SALES_EXECUTIVE`, `ACCOUNTANT`, `INVENTORY_MANAGER`, `RECEPTIONIST`, `KARIGAR`) and 3 initial development users (`owner@jewelleryerp.com`, `manager@jewelleryerp.com`, `cashier@jewelleryerp.com`) with bcrypt hashed password `Admin@123`.
- **Sprint 1.3**: 5-layer Authentication subsystem (`POST /login`, `POST /logout`, `POST /refresh`, `GET /me`) integrated with Prisma ORM multi-schema mapping, active session tracking, and audit logging.
- **Sprint 1.4**: Dynamic RBAC authorization middleware (`requirePermission('permission.key')`) evaluating `iam.role_permissions` and `iam.permissions`. Standard 403 Forbidden payload.
- **Sprint 1.5**: 11 User Management APIs (`src/modules/users/`) supporting User CRUD, search, status activate/deactivate, self-delete protection, last owner count protection, and bcrypt password change/reset.
- **Sprint 1.6**: 8 Role Management APIs (`src/modules/roles/`) supporting Role CRUD, system role protection, active user assignment guards, permission matrix assignment, and single permission removal.
- **Sprint 1.7**: 6 Permission Management APIs (`src/modules/permissions/`) supporting Permission CRUD, module-wise permission key listing (`GET /modules/:module`), permission key mutation protection, and assigned permission deletion protection.
- **Sprint 1.8**: Comprehensive 5-level testing suite (`test/*.test.ts`) covering Database, Auth, RBAC, Users, Roles, Permissions, Security, and Health probes with 100% test pass rate.
- **Sprint 1.9**: Production Postman Workspace collection (`postman/IAM.postman_collection.json`) and local environment file (`postman/Local.postman_environment.json`) with auto-token management scripts.
- **Sprint 1.10**: Complete developer and handover documentation suite (`docs/`, `README.md`, `.env.example`, `docs/API_HANDOVER_PACKAGE.md`).

## [2.0.0] - Phase 2 Sprint 2.2: Database Implementation - 2026-08-08

### Added
- **Sprint 2.2**: Phase 2 Master Tables implementation:
  - 10 Master Models added to `prisma/schema.prisma` (`Company`, `Branch`, `Employee`, `Customer`, `CustomerAddress`, `CustomerDocument`, `Vendor`, `ProductCategory`, `ProductSubCategory`, `Product`).
  - Raw SQL migration script `database/migrations/003_create_phase2_master_tables.sql` matching Prisma definitions.
  - Raw SQL seed script `database/seeds/004_seed_phase2_masters.sql` and TypeScript seed module `prisma/seed/phase2.ts` populating Company, Branches, Employees linked to Phase 1 Users, Product Categories, Sub-Categories, Products, Customers, Customer Addresses, Customer Documents, and Vendors.
  - 10 Repository classes created under `src/repositories/` providing foundational database access methods (`CompanyRepository`, `BranchRepository`, `EmployeeRepository`, `CustomerRepository`, `CustomerAddressRepository`, `CustomerDocumentRepository`, `VendorRepository`, `ProductCategoryRepository`, `ProductSubCategoryRepository`, `ProductRepository`).
  - Integration test suite `test/phase2_db.test.ts` verifying Primary Keys, Foreign Keys, Unique constraints (GSTIN, PAN, Codes, SKU, Mobile), Cascade deletions, Restrict rules, and Seed Data integrity with 100% test pass rate.

## [2.3.0] - Phase 2 Sprint 2.5: Master Data API QA, Postman Verification & Frontend Handover - 2026-08-08

### Added
- **Sprint 2.5**: Complete QA stabilization, Postman collection organization, Swagger alignment, security audit, automated regression testing, and frontend handover for Phase 2 Master Data APIs:
  - Audited all 15 Phase 2 API groups (10 CRUD + 5 Common Masters).
  - Created `src/docs/masterData.swagger.ts` and updated `src/docs/swagger.ts` with complete OpenAPI 3.0 specs.
  - Organized `postman/IAM.postman_collection.json` into dedicated Phase 2 folders (`Companies`, `Branches`, `Employees`, `Customers`, `Customer Addresses`, `Customer Documents`, `Vendors`, `Product Categories`, `Product Sub-Categories`, `Products`, `Search & Filters`, `Common Masters`).
  - Verified `Local` and `Railway` Postman environment files (`Local.postman_environment.json`, `Railway.postman_environment.json`).
  - Completed `docs/API_HANDOVER_PACKAGE.md` with complete developer handover documentation.
  - Verified 100% test pass rate across all 25 test suites (`npm run build` & `npm run test:all`).

### Added
- **Master Data Search, Filters & Pagination**:
  - Enhanced search, status filtering, pagination metadata, and whitelisted sorting for all Master Data repositories and services (`Company`, `Branch`, `Employee`, `Customer`, `Vendor`, `ProductCategory`, `ProductSubCategory`, `Product`).
  - Preserved POS quick-search endpoint `GET /api/v1/customers/search?q=...`.
  - Added relational company filter `where.branch = { companyId }` for Employee and Customer list queries.
  - Added category filter `where.subCategory = { categoryId }` for Product list query.
- **Common Master APIs (`/api/v1/masters/*`)**:
  - `GET /api/v1/masters/dropdowns`: Lightweight master data options.
  - `GET /api/v1/masters/statuses`: Active master status definitions & metal types.
  - `GET /api/v1/masters/branches`: Active branch selection options.
  - `GET /api/v1/masters/roles`: IAM role selection options.
  - `GET /api/v1/masters/categories`: Product category selection options.
- **Integration Test Suite**:
  - Created `test/master.test.ts` for Common Master APIs and added `"test:master"` to `package.json` with 100% test pass rate across all 24 project test suites.
- **Postman & Swagger Documentation**:
  - Updated `postman/IAM.postman_collection.json` with `Phase 2 - Master Data Search & Filters` and `Phase 2 - Common Master APIs` folders.
  - OpenAPI Swagger documentation updated for `/api/v1/masters/*`.

## [2.1.0] - Phase 2 Sprint 2.3: Master CRUD APIs (Steps 1 through 10 - ALL COMPLETED 🎉) - 2026-08-08

### Added
- **Sprint 2.3 (Step 1)**: Company CRUD APIs.
- **Sprint 2.3 (Step 2)**: Branch CRUD APIs.
- **Sprint 2.3 (Step 3)**: Employee CRUD APIs.
- **Sprint 2.3 (Step 4)**: Customer CRUD APIs & POS Quick Search.
- **Sprint 2.3 (Step 5)**: Customer Address CRUD APIs.
- **Sprint 2.3 (Step 6)**: Customer Document CRUD APIs.
- **Sprint 2.3 (Step 7)**: Vendor CRUD APIs.
- **Sprint 2.3 (Step 8)**: Product Category CRUD APIs.
- **Sprint 2.3 (Step 9)**: Product Sub-Category CRUD APIs.
- **Sprint 2.3 (Step 10)**: Product CRUD APIs:
  - Implemented 5 REST endpoints: `POST /products`, `GET /products`, `GET /products/:id`, `PUT /products/:id`, `DELETE /products/:id`.
  - Added Product module files in `src/modules/products/`.
  - Implemented integration test suite `test/product.test.ts` (`npm run test:product` with 100% pass rate).
  - Added `Phase 2 - Products` request folder to Postman collection `postman/IAM.postman_collection.json`.










