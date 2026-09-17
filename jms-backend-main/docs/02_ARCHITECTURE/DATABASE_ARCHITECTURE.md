---
title: Database Architecture Specification
type: ARCHITECTURE
status: ACTIVE
authority: AUTHORITATIVE
last_updated: 2026-08-20
owner: JMS Architecture Team
related:
  - SYSTEM_ARCHITECTURE.md
  - MASTER_SYSTEM_AND_CODE_FLOW.md
  - ../06_DATABASE/DATABASE_OVERVIEW.md
---

# 🗄️ JMS Database Architecture Specification

## 1. Relational Engine & Technology Stack

* **Database Engine**: PostgreSQL 18
* **ORM & Query Builder**: Prisma ORM 7.9.1
* **Primary Key Strategy**: UUID v4 (`gen_random_uuid()`) for security, distributed node safety, and non-enumerable API endpoints.
* **Audit Columns**: All tables include standard temporal tracking fields:
  * `createdAt` (Timestamp with timezone, default `now()`)
  * `updatedAt` (Timestamp with timezone, auto-updated)
  * `deletedAt` (Nullable timestamp for soft-deletion)

---

# 2. Domain Schema Modules

The database schema (`prisma/schema.prisma`) is organized into clean domain model clusters:

1. **Core Platform & IAM**: `Company`, `Branch`, `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `RefreshToken`.
2. **Master Entities**: `Customer`, `Vendor`, `Employee`, `ProductCategory`, `ProductSubCategory`, `Product`, `MetalRate`.
3. **Inventory & Tagged Stock**: `InventoryItem`, `InventoryTag`, `StockMovement`, `InventoryTransfer`, `InventoryTransferItem`.
4. **Sales & POS Subsystem**: `SalesInvoice`, `SalesItem`, `SalesPayment`, `GoldExchangeItem`, `SalesReturn`, `SalesReturnItem`, `SalesRefund`.
5. **Procurement Subsystem**: `PurchaseOrder`, `PurchaseOrderItem`, `PurchaseReceipt`, `PurchaseReceiptItem`, `PurchaseBill`, `PurchaseBillItem`, `VendorPayment`.
6. **Manufacturing & Stock Audit**: `JobWorkOrder`, `JobWorkIssue`, `JobWorkReturn`, `StockAudit`, `StockAuditItem`.

---

# 3. Transaction Safety & Constraints

* **Foreign Keys**: Cascading rules (`RESTRICT` or `CASCADE`) prevent orphaned records.
* **Unique Constraints**: Business keys like `Company.code`, `Branch.code`, `InventoryItem.sku`, `InventoryTag.tagNumber`, `SalesInvoice.invoiceNumber`, and `MetalRate.(branchId, metalType, purity, effectiveAt)` are enforced via database unique indexes.
