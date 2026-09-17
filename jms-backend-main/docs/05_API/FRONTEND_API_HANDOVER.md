# Frontend Developer Master API Handover Package

Welcome Frontend Developer! This document is your **complete, all-in-one API Handover Package** for connecting the frontend web/mobile client to the **Jewellery Management System (JMS) Backend REST API**.

It contains every single endpoint available across all modules, authentication mechanisms, dynamic permission rendering rules, request/response JSON schemas, header conventions, error handling, and Postman/Swagger reference tools.

---

## 📌 1. Client Environment & Request Headers

### Base URL
- **Local Development**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/docs`

### Global Request Headers
For all protected endpoints (every endpoint except `/auth/login` and `/health`), pass the Bearer JWT token in the `Authorization` header:

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

### Response Conventions

#### Standard Success Response (200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Standard Error Response (400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "error": {
    "message": "Error description here",
    "statusCode": 400,
    "details": [ ... ]
  }
}
```

---

## 🔐 2. Dynamic RBAC & UI Button Permission Rendering

When a user logs in via `POST /api/v1/auth/login` or calls `GET /api/v1/auth/me`, the response includes a list of active `permissions`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "14a7008e-fd21-460c-8c95-f9c8fa5e02fe",
      "email": "owner@jewelleryerp.com",
      "firstName": "Store",
      "lastName": "Owner",
      "role": { "name": "OWNER" }
    },
    "permissions": [
      "user.create", "user.read", "user.update",
      "sales_invoice.create", "sales_invoice.confirm",
      "sales_payment.create", "gold_exchange.apply"
    ]
  }
}
```

### Frontend UI Guard Rule:
Store the `permissions` string array in your state management store (Redux/Pinia/Context). Use a helper function `hasPermission(key)` to conditionally render nav links and action buttons:

```typescript
function hasPermission(permissionKey: string): boolean {
  return currentUserPermissions.includes(permissionKey);
}

// Example usage in UI:
// {hasPermission('gold_exchange.apply') && <button onClick={applyExchange}>Apply Credit</button>}
```

---

## 📋 3. Complete Master API Endpoints Directory

### 🔑 3.1 Authentication Subsystem (`/auth`)

| Method | Endpoint | Description | Request Body | Required Permission |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & get JWT tokens | `{ email, password }` | Public |
| `POST` | `/api/v1/auth/logout` | End session & revoke refresh token | `{ refreshToken }` | Public / Auth |
| `POST` | `/api/v1/auth/refresh` | Obtain new access token | `{ refreshToken }` | Public |
| `GET` | `/api/v1/auth/me` | Fetch active user profile & permissions | None | Authenticated |

---

### 👤 3.2 User & Role Management Subsystem (`/users`, `/roles`, `/permissions`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | List users with search, status filters & pagination | `user.read` |
| `POST` | `/api/v1/users` | Create user account | `user.create` |
| `GET` | `/api/v1/users/:id` | Fetch single user details | `user.read` |
| `PUT` | `/api/v1/users/:id` | Update user details & status | `user.update` |
| `DELETE` | `/api/v1/users/:id` | Soft delete user account | `user.delete` |
| `POST` | `/api/v1/users/:id/change-password` | Change user password | `user.update` |
| `GET` | `/api/v1/roles` | List all security roles | `role.read` |
| `POST` | `/api/v1/roles` | Create security role | `role.create` |
| `POST` | `/api/v1/roles/:id/permissions` | Assign permissions array to role | `role.assign_permission` |
| `GET` | `/api/v1/permissions` | Get catalog of all backend permissions | `permission.read` |

---

### 🏢 3.3 Master Data Subsystem (`/companies`, `/branches`, `/employees`, `/customers`, `/vendors`, `/products`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `GET`, `POST`, `PUT` | `/api/v1/companies` | Company Organization Profile | `company.read` / `company.update` |
| `GET`, `POST`, `PUT` | `/api/v1/branches` | Multi-branch Showrooms | `branch.read` / `branch.create` |
| `GET`, `POST`, `PUT` | `/api/v1/employees` | Staff Employee Profiles | `employee.read` / `employee.create` |
| `GET`, `POST`, `PUT` | `/api/v1/customers` | Customer Directory & Quick Search | `customer.read` / `customer.create` |
| `GET`, `POST`, `DELETE` | `/api/v1/customers/:id/addresses` | Customer Multi-Addresses | `customer.update` |
| `GET`, `POST`, `DELETE` | `/api/v1/customers/:id/documents` | Customer KYC Documents (Aadhar/PAN) | `customer.update` |
| `GET`, `POST`, `PUT` | `/api/v1/vendors` | Supplier Vendors | `vendor.read` / `vendor.create` |
| `GET`, `POST`, `PUT` | `/api/v1/product-categories` | Product Categories (Gold, Silver, Diamond) | `product_category.read` |
| `GET`, `POST`, `PUT` | `/api/v1/product-sub-categories` | Product Sub-Categories (Ring, Chain, Necklace) | `product_sub_category.read` |
| `GET`, `POST`, `PUT` | `/api/v1/products` | Jewellery Product Templates | `product.read` / `product.create` |

---

### 💎 3.4 Physical Inventory, Tags & Transfers (`/inventory-items`, `/inventory-tags`, `/inventory-transfers`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventory-items` | List inventory items (filter by branch, status, purity) | `inventory_item.read` |
| `POST` | `/api/v1/inventory-items` | Create physical item + auto-generate Barcode/QR tag | `inventory_item.create` |
| `GET` | `/api/v1/inventory-items/:id` | Get item details with images and movement history | `inventory_item.read` |
| `GET` | `/api/v1/stock-movements` | Stock Movement Audit Ledger | `stock_movement.read` |
| `GET` | `/api/v1/inventory-tags/lookup/:tag` | Quick Barcode (`BC-...`) or QR (`QR-...`) scan lookup | `inventory_tag.read` |
| `POST` | `/api/v1/inventory-transfers` | Request inter-branch stock transfer | `inventory_transfer.create` |
| `POST` | `/api/v1/inventory-transfers/:id/approve` | Approve stock transfer request | `inventory_transfer.approve` |
| `POST` | `/api/v1/inventory-transfers/:id/dispatch` | Dispatch transfer stock | `inventory_transfer.dispatch` |
| `POST` | `/api/v1/inventory-transfers/:id/receive` | Receive stock at target branch & update branchId | `inventory_transfer.receive` |
| `POST` | `/api/v1/inventory-item-images/:itemId` | Upload physical item photo (Multipart form) | `inventory_item_image.create` |

---

### 🧾 3.5 Sales Invoices & POS Billing (`/sales/invoices`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sales/invoices` | Create DRAFT sales invoice | `sales_invoice.create` |
| `GET` | `/api/v1/sales/invoices` | List invoices (filter status: DRAFT/CONFIRMED/CANCELLED) | `sales_invoice.read` |
| `GET` | `/api/v1/sales/invoices/:id` | Get full invoice breakdown & settlement | `sales_invoice.read` |
| `POST` | `/api/v1/sales/invoices/:id/lock-metal-rate` | Lock active metal rate onto DRAFT invoice | `metal_rate.create` |
| `POST` | `/api/v1/sales/invoices/:id/recalculate-pricing` | Calculate line item pricing breakdown & GST | `sales_invoice.update` |
| `POST` | `/api/v1/sales/invoices/:id/confirm` | **POS Confirmation**: Atomically sell items & create movement | `sales_invoice.confirm` |

---

### 📈 3.6 Metal Rates, Live Benchmark Ticker & GST Engine (`/metal-rates`, `/making-charges`, `/tax-rates`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/metal-rates/live` | Real-time bullion benchmark prices (Gold 24K/22K/18K/14K, Silver 999/925, Platinum 950) | Public / Auth |
| `POST` | `/api/v1/metal-rates/sync-live` | **Owner 1-Click Sync**: Synchronize live market rates into company active store rates with optional markup | `metal_rate.create` |
| `POST` | `/api/v1/metal-rates/bulk-update` | Bulk update multiple company metal rates in single transaction | `metal_rate.create` |
| `GET` | `/api/v1/metal-rates/current` | Resolve current active rates for company | `metal_rate.read` |
| `GET` | `/api/v1/metal-rates` | List metal rates history with filters & pagination | `metal_rate.read` |
| `POST` | `/api/v1/metal-rates` | Create new daily rate (auto-expires old active rate) | `metal_rate.create` |
| `GET` | `/api/v1/making-charges` | List making charge configurations (PER_GRAM / FIXED / PERCENTAGE) | `making_charge.read` |
| `GET` | `/api/v1/tax-rates` | List GST tax rates (e.g. GST_3 = 3%) | `tax_rate.read` |

---

### 💳 3.7 Sales Payment & Settlement (`/sales/payments`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sales/payments` | Record payment against CONFIRMED invoice (Cash/Card/UPI/Bank/Cheque) | `sales_payment.create` |
| `GET` | `/api/v1/sales/payments` | List sales payments with filters & pagination | `sales_payment.read` |
| `GET` | `/api/v1/sales/invoices/:id/payments` | Fetch payment history for invoice | `sales_payment.read` |
| `GET` | `/api/v1/sales/invoices/:id/payment-summary` | Fetch settlement breakdown (`totalPaid`, `outstandingAmount`, `paymentStatus`) | `sales_payment.read` |
| `POST` | `/api/v1/sales/payments/:id/reverse` | Reverse completed payment with mandatory audit reason | `sales_payment.reverse` |

---

### 🪙 3.8 Customer Gold Exchange / Old Gold Management (`/gold-exchanges`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sales/invoices/:invoiceId/gold-exchanges` | Create old gold exchange item against DRAFT invoice | `gold_exchange.create` |
| `GET` | `/api/v1/sales/invoices/:invoiceId/gold-exchanges` | Get exchange records for invoice | `gold_exchange.read` |
| `GET` | `/api/v1/gold-exchanges` | Search, filter & paginate all customer gold exchanges | `gold_exchange.read` |
| `GET` | `/api/v1/gold-exchanges/:id` | Get exchange details and items | `gold_exchange.read` |
| `POST` | `/api/v1/gold-exchanges/:id/value` | Value exchange using active rate & snapshot ratePerGram | `gold_exchange.value` |
| `POST` | `/api/v1/gold-exchanges/:id/apply` | Apply valuation credit to `SalesInvoice.exchangeCredit` | `gold_exchange.apply` |
| `POST` | `/api/v1/gold-exchanges/:id/cancel` | Cancel REQUESTED or VALUED exchange | `gold_exchange.cancel` |
| `GET` | `/api/v1/gold-exchanges/:id/history` | Get audit history of exchange | `gold_exchange.read` |

---

### 🔄 3.9 Sales Returns & Refunds (`/sales/returns`, `/sales/refunds`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sales/returns` | Create a sales return request for confirmed invoice items | `sales_return.create` |
| `GET` | `/api/v1/sales/returns` | Search, filter & paginate all sales returns | `sales_return.read` |
| `GET` | `/api/v1/sales/returns/:id` | Get sales return details, line items & refund summary | `sales_return.read` |
| `GET` | `/api/v1/sales/invoices/:id/returns` | Get all returns associated with a specific invoice | `sales_return.read` |
| `POST` | `/api/v1/sales/returns/:id/approve` | Approve return request (REQUESTED $\rightarrow$ APPROVED) | `sales_return.approve` |
| `POST` | `/api/v1/sales/returns/:id/process` | Process return, restore inventory (`SOLD` $\rightarrow$ `AVAILABLE`), and log `StockMovement` | `sales_return.process` |
| `POST` | `/api/v1/sales/returns/:id/cancel` | Cancel return with mandatory cancellation reason | `sales_return.cancel` |
| `GET` | `/api/v1/sales/returns/:id/history` | Get full stage-by-stage lifecycle audit log | `sales_return.read` |
| `POST` | `/api/v1/sales/refunds` | Issue refund (Cash/Card/UPI/Bank/Cheque) for a PROCESSED return | `sales_refund.create` |
| `GET` | `/api/v1/sales/refunds` | List all sales refunds with status & method filters | `sales_refund.read` |
| `GET` | `/api/v1/sales/refunds/:id` | Get sales refund details | `sales_refund.read` |
| `POST` | `/api/v1/sales/refunds/:id/reverse` | Reverse a completed refund with mandatory audit reason | `sales_refund.reverse` |
| `GET` | `/api/v1/sales/returns/:id/refunds` | Fetch refund history for a specific sales return | `sales_refund.read` |

---

### 📦 3.10 Purchase Orders & Procurement (`/purchases`)

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchases` | Create a draft purchase order with jewellery line items | `purchase.create` |
| `GET` | `/api/v1/purchases` | List paginated purchase orders with search, vendor, branch, status & date filters | `purchase.read` |
| `GET` | `/api/v1/purchases/:id` | Get purchase order details with line items and vendor information | `purchase.read` |
| `PUT` | `/api/v1/purchases/:id` | Update draft purchase order and recalculate line items and totals | `purchase.update` |
| `POST` | `/api/v1/purchases/:id/submit` | Submit draft purchase order for managerial approval (`DRAFT -> SUBMITTED`) | `purchase.submit` |
| `POST` | `/api/v1/purchases/:id/approve` | Approve submitted purchase order (`SUBMITTED -> APPROVED`) | `purchase.approve` |
| `POST` | `/api/v1/purchases/:id/cancel` | Cancel purchase order with mandatory cancellation reason | `purchase.cancel` |

---

### 🧾 3.11 Purchase Bills & Costing (`/purchase-bills`)

> **Note**: Frontend UI for Phase 5 has NOT been implemented. Full backend APIs are ready below.

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchase-bills` | Create a draft purchase bill against received PO stock | `purchase_bill.create` |
| `GET` | `/api/v1/purchase-bills` | List paginated purchase bills with search, vendor, branch, PO, status & date filters | `purchase_bill.read` |
| `GET` | `/api/v1/purchase-bills/:id` | Get purchase bill details with line items and financial breakdown | `purchase_bill.read` |
| `PUT` | `/api/v1/purchase-bills/:id` | Update draft purchase bill | `purchase_bill.update` |
| `POST` | `/api/v1/purchase-bills/:id/submit` | Submit draft purchase bill (`DRAFT -> SUBMITTED`) | `purchase_bill.submit` |
| `POST` | `/api/v1/purchase-bills/:id/approve` | Approve submitted purchase bill (`SUBMITTED -> APPROVED`) | `purchase_bill.approve` |
| `POST` | `/api/v1/purchase-bills/:id/cancel` | Cancel DRAFT or SUBMITTED purchase bill with reason | `purchase_bill.cancel` |
| `GET` | `/api/v1/purchases/:id/bills` | Get purchase bills created against a Purchase Order | `purchase_bill.read` |
| `GET` | `/api/v1/vendors/:id/purchase-bills` | Get purchase bills for a Vendor | `purchase_bill.read` |
| `GET` | `/api/v1/purchase-bills/:id/summary` | Get financial summary of a purchase bill | `purchase_bill.read` |

---

### 💳 3.12 Vendor Payments & Payable Settlement (`/vendor-payments`)

> **Note**: Frontend UI for Phase 5 has NOT been implemented. Full backend APIs are ready below.

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchase-bills/:id/payments` | Record vendor payment against an approved purchase bill | `vendor_payment.create` |
| `GET` | `/api/v1/purchase-bills/:id/payments` | Get payment history for a purchase bill | `vendor_payment.read` |
| `GET` | `/api/v1/purchase-bills/:id/payment-summary` | Get payment method breakdown and total paid/outstanding summary | `vendor_payment.read` |
| `GET` | `/api/v1/vendor-payments` | List paginated vendor payments with filters | `vendor_payment.read` |
| `GET` | `/api/v1/vendor-payments/:id` | Get single vendor payment details by ID | `vendor_payment.read` |
| `POST` | `/api/v1/vendor-payments/:id/reverse` | Reverse a completed vendor payment with mandatory reason | `vendor_payment.reverse` |
| `GET` | `/api/v1/vendors/:id/payments` | Get all payment records for a vendor | `vendor_payment.read` |
| `GET` | `/api/v1/vendors/:id/payable-summary` | Get vendor payable summary (approved count, billed, paid, outstanding, overdue) | `vendor_payment.read` |

---

### 🔄 3.13 Purchase Returns & Vendor Debit Notes (`/purchase-returns`, `/vendor-debit-notes`)

> **Note**: Frontend UI for Phase 5 has NOT been implemented. Full backend APIs are ready below.

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchase-returns` | Create draft purchase return | `purchase_return.create` |
| `GET` | `/api/v1/purchase-returns` | List paginated purchase returns | `purchase_return.read` |
| `GET` | `/api/v1/purchase-returns/:id` | Get purchase return details by ID | `purchase_return.read` |
| `PUT` | `/api/v1/purchase-returns/:id` | Update draft purchase return | `purchase_return.update` |
| `POST` | `/api/v1/purchase-returns/:id/submit` | Submit draft purchase return (`DRAFT -> SUBMITTED`) | `purchase_return.submit` |
| `POST` | `/api/v1/purchase-returns/:id/approve` | Approve submitted purchase return (`SUBMITTED -> APPROVED`) | `purchase_return.approve` |
| `POST` | `/api/v1/purchase-returns/:id/process` | Process approved return, update stock & issue Debit Note | `purchase_return.process` |
| `POST` | `/api/v1/purchase-returns/:id/cancel` | Cancel purchase return with mandatory reason | `purchase_return.cancel` |
| `GET` | `/api/v1/vendor-debit-notes` | List vendor debit notes | `debit_note.read` |
| `GET` | `/api/v1/vendor-debit-notes/:id` | Get vendor debit note details | `debit_note.read` |
| `GET` | `/api/v1/vendors/:id/debit-notes` | Get debit notes for a vendor | `debit_note.read` |

---

### 🔨 3.14 Karigar Job Work & Material Issue (`/job-work/orders`, `/karigars/:id/job-work-summary`)

> **Note**: Frontend UI for Phase 5 has NOT been implemented. Full backend APIs are ready below.

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/job-work/orders` | Create draft job work order | `job_work.create` |
| `GET` | `/api/v1/job-work/orders` | List paginated job work orders | `job_work.read` |
| `GET` | `/api/v1/job-work/orders/:id` | Get job work order details by ID | `job_work.read` |
| `PUT` | `/api/v1/job-work/orders/:id` | Update draft job work order | `job_work.update` |
| `POST` | `/api/v1/job-work/orders/:id/submit` | Submit draft job work order (`DRAFT -> SUBMITTED`) | `job_work.submit` |
| `POST` | `/api/v1/job-work/orders/:id/assign` | Assign submitted order to Karigar (`SUBMITTED -> ASSIGNED`) | `job_work.assign` |
| `POST` | `/api/v1/job-work/orders/:id/issue-material` | Issue raw metal, loose stones, or stock to Karigar | `job_work.issue` |
| `POST` | `/api/v1/job-work/orders/:id/receive` | Receive finished goods / material from Karigar | `job_work.receive` |
| `POST` | `/api/v1/job-work/orders/:id/cancel` | Cancel order prior to material issue | `job_work.cancel` |
| `GET` | `/api/v1/karigars/:id/job-work-summary` | Get Karigar job work ledger summary | `job_work.read` |

---

### 📋 3.15 Stock Audit, Stocktake & Inventory Reconciliation (`/stock-audits`)

> **Note**: Frontend UI for Phase 5 has NOT been implemented. Full backend APIs are ready below.

| Method | Endpoint | Description | Permission Key |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/stock-audits` | Create IN_PROGRESS Stock Audit session | `stock_audit.create` |
| `GET` | `/api/v1/stock-audits` | List paginated Stock Audit sessions | `stock_audit.read` |
| `GET` | `/api/v1/stock-audits/:id` | Get Stock Audit session details | `stock_audit.read` |
| `POST` | `/api/v1/stock-audits/:id/scan` | Scan physical item into audit session | `stock_audit.scan` |
| `POST` | `/api/v1/stock-audits/:id/submit` | Submit audit session (identifies missing items) | `stock_audit.submit` |
| `POST` | `/api/v1/stock-audits/:id/reconcile` | Reconcile audit session & adjust stock | `stock_audit.reconcile` |
| `POST` | `/api/v1/stock-audits/:id/cancel` | Cancel audit session with mandatory reason | `stock_audit.cancel` |
| `GET` | `/api/v1/stock-audits/:id/discrepancies` | Get audit discrepancy report | `stock_audit.read` |

---

## 🛠 4. Testing & Postman Developer Resources

- **Postman Collection File**: [`postman/Jewellery_ERP.postman_collection.json`](file:///e:/JMS/jms-backend/postman/Jewellery_ERP.postman_collection.json)
- **Postman Environment File**: [`postman/Development.postman_environment.json`](file:///e:/JMS/jms-backend/postman/Development.postman_environment.json)
- **Swagger Interactive UI**: Available at `http://localhost:5000/docs` when dev server is running (`npm run dev`).
