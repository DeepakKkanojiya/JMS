# 📋 JMS Sales & POS Frontend Handover Guide

This guide provides operational walkthroughs, API integration mapping, and troubleshooting procedures for the complete **Jewellery Management System (JMS) Phase 4 Frontend**.

---

## 🧭 Page & Route Directory

### 1. Point of Sale Terminal (`/sales/pos`)
- **Page Component**: [`src/pages/POSBilling.tsx`](file:///e:/JMS/jms-frontend/src/pages/POSBilling.tsx)
- **Primary Use**: Cashier fast checkout station.
- **Key Features**:
  - Customer selection with quick inline customer registration modal.
  - Branch & Salesperson attribution.
  - Barcode / QR / Item Code lookup with real-time availability check via `GET /api/v1/sales/pos/inventory/:identifier`.
  - Instant duplicate prevention on physical inventory items.
  - Authoritative Pricing Calculation with rate lock trigger.
  - Inline Old Gold trade-in drawer with automated purity valuation.
  - Multi-tender split payment modal (Cash, Card, UPI, Bank Transfer, Cheque).
  - One-click confirmation with atomic inventory deduction (`AVAILABLE` $\rightarrow$ `SOLD`).

### 2. Commercial Sales Invoices (`/sales/invoices`)
- **Page Component**: [`src/pages/SalesInvoices.tsx`](file:///e:/JMS/jms-frontend/src/pages/SalesInvoices.tsx)
- **Primary Use**: Directory of all draft, confirmed, and cancelled invoices.
- **Key Features**:
  - Filter by invoice status (`DRAFT`, `CONFIRMED`, `CANCELLED`), branch, customer, date range.
  - Summary KPI cards (Volume, Collections, Outstanding, Invoice Count).
  - Quick action buttons with confirmation modals for sales confirmation and cancellation.

### 3. Master Sales Record Detail (`/sales/invoices/:id`)
- **Page Component**: [`src/pages/SalesInvoiceDetail.tsx`](file:///e:/JMS/jms-frontend/src/pages/SalesInvoiceDetail.tsx)
- **Primary Use**: Single-source-of-truth master view for an individual sale.
- **Tab Breakdown**:
  - **Overview**: Customer, Branch, Salesperson, Settlement metrics.
  - **Items**: Item code, Product SKU, Purity, Gross/Net Weight, Unit price, Making charges, Taxes, Line totals.
  - **Pricing Breakdown**: Locked metal rate snapshot, metal value, making charges, CGST, SGST, IGST.
  - **Gold Exchange**: Associated old gold valuation credits and status.
  - **Payments**: Multi-tender payments history, record payment modal, reverse payment modal.
  - **Returns**: Linked sales returns, return request shortcut, restocking status.

### 4. Metal Rates Engine (`/masters/metal-rates`)
- **Page Component**: [`src/pages/MetalRates.tsx`](file:///e:/JMS/jms-frontend/src/pages/MetalRates.tsx)
- **Primary Use**: Bullion rate management.
- **Key Features**:
  - Live benchmark cards for 24K Gold, 22K Gold, 18K Gold, 999 Silver, and 950 Platinum.
  - Publish Daily Rate modal (automatically expires previous active rates).
  - Rate History table.
  - Soft deactivation (No hard DELETE button).

### 5. Making Charges Master (`/masters/making-charges`)
- **Page Component**: [`src/pages/MakingCharges.tsx`](file:///e:/JMS/jms-frontend/src/pages/MakingCharges.tsx)
- **Primary Use**: Craftsmanship rules configuration (`PER_GRAM`, `FIXED`, `PERCENTAGE`).

### 6. Tax / GST Master (`/masters/tax-rates`)
- **Page Component**: [`src/pages/TaxRates.tsx`](file:///e:/JMS/jms-frontend/src/pages/TaxRates.tsx)
- **Primary Use**: GST tax bracket management (e.g. `GST_3` = 3.00%).

### 7. Sales Payments Ledger (`/sales/payments`)
- **Page Component**: [`src/pages/SalesPayments.tsx`](file:///e:/JMS/jms-frontend/src/pages/SalesPayments.tsx)
- **Primary Use**: Financial ledger of all collected tenders.
- **Key Features**:
  - Filters by payment tender, status (`COMPLETED`, `REVERSED`), date range.
  - Payment reversal modal requiring mandatory audit reason.

### 8. Customer Gold Exchanges (`/sales/gold-exchanges`)
- **Page Component**: [`src/pages/GoldExchanges.tsx`](file:///e:/JMS/jms-frontend/src/pages/GoldExchanges.tsx)
- **Primary Use**: Old gold trade-in ledger.
- **Workflow Actions**: Valuation trigger, Apply Credit trigger, Cancel trigger.

### 9. Sales Returns & Restocking (`/sales/returns`)
- **Page Component**: [`src/pages/SalesReturns.tsx`](file:///e:/JMS/jms-frontend/src/pages/SalesReturns.tsx)
- **Primary Use**: Return request approvals and physical inventory restoration.
- **Workflow Actions**: Approve, Process & Restock (`SOLD` $\rightarrow$ `AVAILABLE`), Cancel, Shortcut to Issue Refund.

### 10. Sales Refunds Register (`/sales/refunds`)
- **Page Component**: [`src/pages/SalesRefunds.tsx`](file:///e:/JMS/jms-frontend/src/pages/SalesRefunds.tsx)
- **Primary Use**: Statutory refund disbursement and reversal ledger.

---

## 🔧 Error Handling Conventions

All Phase 4 API calls route through [`src/api/client.ts`](file:///e:/JMS/jms-frontend/src/api/client.ts). Form errors and business rule violations are parsed cleanly through `parseValidationErrors(err)`:
- **409 Conflict**: "Item already sold", "Overpayment not permitted", "Duplicate return request"
- **403 Forbidden**: Automatically hides action buttons or displays friendly toast: "Permission denied for this action."
- **400 Bad Request**: Maps specific field validation errors directly under corresponding form inputs.
- **401 Unauthorized**: Automatically executes token rotation via `/auth/refresh` or redirects to `/login`.
