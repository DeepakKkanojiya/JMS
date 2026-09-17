# Sales, POS Billing, Pricing & Settlement Subsystem Specification

## Overview

This document provides complete technical, architectural, database, financial math, and API specifications for **Phase 4: Sales, Metal Rates, POS Billing, Pricing Engine, Payment Processing, Customer Gold Exchange, and Sales Returns & Refunds** of the Jewellery Management System (JMS) backend.

---

## Sprint Modules Breakdown

### 1. Sales Invoices (Sprint 4.1)
- `SalesInvoice`: Master invoice header with `invoiceNumber` (`INV-BR-DEL-01-2026-00001`), `customerId`, `branchId`, `subtotal`, `discountAmount`, `taxAmount`, `exchangeCredit`, `grandTotal`, `totalPaid`, `outstandingAmount`, `paymentStatus` (`UNPAID`, `PARTIALLY_PAID`, `PAID`), and status (`DRAFT`, `CONFIRMED`, `CANCELLED`).
- `SalesInvoiceItem`: Line items linked to `InventoryItem` with `unitPrice`, `discountAmount`, `taxAmount`, and `lineTotal`.

### 2. Metal Rate Engine & Rate Locking (Sprint 4.2)
- `MetalRate` (`public.metal_rates`): Company daily metal market rates (`GOLD`, `SILVER`, `PLATINUM`) per purity (`22K`, `24K`, `18K`, `999`). Overlap prevention logic enforced.
- Current rate resolution: Resolves active rate where `effectiveFrom <= timestamp` and (`effectiveTo >= timestamp` or `null`).
- `SalesInvoiceMetalRate`: Immutable rate snapshot created when locking rate on a DRAFT invoice.

### 3. POS Billing & Inventory Deduction (Sprint 4.3)
- Atomic POS confirmation (`POST /api/v1/sales/invoices/:id/confirm`):
  - Validates all line items are `AVAILABLE`.
  - Transactionally updates item status `AVAILABLE` $\rightarrow$ `SOLD`.
  - Concurrency protection using conditional update (`where: { id, status: 'AVAILABLE' }`).
  - Automatically creates `SALE` `StockMovement` audit record.

### 4. Making Charges, Wastage & GST Pricing Engine (Sprint 4.4)
- `MakingCharge`: Master rates by `PER_GRAM`, `FIXED`, or `PERCENTAGE`.
- Line-item breakdown math:
  $$\text{Metal Value} = \text{Net Weight} \times \text{Locked Rate Per Gram}$$
  $$\text{Wastage Weight} = \text{Net Weight} \times \frac{\text{Wastage Percent}}{100}$$
  $$\text{Wastage Value} = \text{Wastage Weight} \times \text{Locked Rate Per Gram}$$
  $$\text{Making Charges} = \text{Rate} \times \text{Gross Weight} \quad (\text{if PER\_GRAM})$$
  $$\text{Taxable Amount} = \text{Metal Value} + \text{Wastage Value} + \text{Making Charges} - \text{Discount}$$
  $$\text{Tax Amount} = \text{Taxable Amount} \times \frac{\text{GST Rate}}{100}$$
  $$\text{Line Total} = \text{Taxable Amount} + \text{Tax Amount}$$

- Tax breakdown:
  - `INTRA_STATE` (Same State): CGST ($\text{Tax} / 2$) + SGST ($\text{Tax} / 2$).
  - `INTER_STATE` (Different State): IGST ($\text{Tax}$).

### 5. Payment Processing & Sales Settlement (Sprint 4.5)
- `SalesPayment`: Payment records against `CONFIRMED` invoices.
- Payment Methods: `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, `CHEQUE`.
- Settlement Formulas:
  $$\text{Net Payable} = \text{Grand Total} - \text{Exchange Credit}$$
  $$\text{Outstanding Amount} = \text{Net Payable} - \text{Total Completed Payments}$$
- Overpayment protection (HTTP 409 Conflict).
- Immutable payment reversal with mandatory audit reason (`POST /api/v1/sales/payments/:id/reverse`).

### 6. Customer Gold Exchange / Old Gold Management (Sprint 4.6)
- `CustomerGoldExchange` & `CustomerGoldExchangeItem`: Records old customer gold against a `DRAFT` invoice.
- Status State Machine: `REQUESTED` $\rightarrow$ `VALUED` $\rightarrow$ `APPLIED` / `CANCELLED`.
- Valuation & Snapshot: Resolves active rate and snapshots `ratePerGram`.
- Formulas:
  $$\text{Net Weight} = \text{Gross Weight} - \text{Stone Weight}$$
  $$\text{Metal Value} = \text{Net Weight} \times \text{Snapshot Rate Per Gram}$$
  $$\text{Deduction Amount} = \text{Metal Value} \times \frac{\text{Deduction Percent}}{100}$$
  $$\text{Exchange Value} = \text{Metal Value} - \text{Deduction Amount}$$
- Applies `Exchange Value` to `SalesInvoice.exchangeCredit`, reducing net payable amount.

### 7. Sales Return & Refund Management (Sprint 4.7)
- `SalesReturn` & `SalesReturnItem`: Records return requests for items on `CONFIRMED` invoices.
- State Machine: `REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PROCESSED` (or `REQUESTED/APPROVED` $\rightarrow$ `CANCELLED`).
- Valuation & Financial Math:
  - Uses original invoice line item snapshot (`taxableAmount`, `taxAmount`, minus optional `deductionAmount`).
  - Never recalculates with today's fluctuating metal market rate.
  $$\text{Item Refund Amount} = \text{Original Line Total} - \text{Deduction Amount}$$
  $$\text{Total Return Refund} = \sum(\text{Item Refund Amounts})$$
- Inventory Restoration on `PROCESSED`:
  - Conditional atomic update: `UPDATE inventory_items WHERE id=? AND status='SOLD'` $\rightarrow$ `status='AVAILABLE'`.
  - Automatically records `StockMovement` with `movementType = 'SALE_RETURN'`, `referenceType = 'POS_SALES_RETURN'`.
- Double-Return Protection:
  - Rejects second return request for an item with an active non-cancelled return (`409 Conflict`).
- Gold Exchange Protection:
  - Invoices with applied gold exchange credit (`exchangeCredit > 0`) are protected (`400 Bad Request`).
- `SalesRefund` Ledger:
  - Separate immutable refund ledger (`REF-YYYY-XXXXX`) without deleting or altering historical `SalesPayment` records.
  - Supports partial or full refunds up to the return's eligible refund balance.
  - Reversal support with mandatory audit reason (`POST /api/v1/sales/refunds/:id/reverse`).

---

## API Endpoints Summary

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Invoice Foundation** | `POST`, `GET`, `PUT` | `/api/v1/sales/invoices` | Create, list, update draft invoice |
| **Rate Locking** | `POST` | `/api/v1/sales/invoices/:id/lock-metal-rate` | Snapshot metal rate on invoice |
| **POS Confirmation** | `POST` | `/api/v1/sales/invoices/:id/confirm` | Atomic POS billing & stock deduction |
| **Pricing Engine** | `POST` | `/api/v1/sales/invoices/:id/recalculate-pricing` | Calculate line item breakdown & GST |
| **Payment Settlement**| `POST`, `GET` | `/api/v1/sales/payments` | Record payment & fetch history |
| **Payment Reversal** | `POST` | `/api/v1/sales/payments/:id/reverse` | Reverse payment with audit reason |
| **Gold Exchange** | `POST`, `GET` | `/api/v1/sales/invoices/:id/gold-exchanges` | Create gold exchange for draft invoice |
| **Exchange Valuation**| `POST` | `/api/v1/gold-exchanges/:id/value` | Value exchange & snapshot metal rate |
| **Exchange Application**| `POST` | `/api/v1/gold-exchanges/:id/apply` | Apply credit to invoice |
| **Sales Return Request**| `POST` | `/api/v1/sales/returns` | Initiate return request for confirmed invoice items |
| **List Sales Returns** | `GET` | `/api/v1/sales/returns` | List returns with filters and pagination |
| **Get Return Details** | `GET` | `/api/v1/sales/returns/:id` | Get return details and line items |
| **Approve Return** | `POST` | `/api/v1/sales/returns/:id/approve` | Approve return (REQUESTED $\rightarrow$ APPROVED) |
| **Process Return** | `POST` | `/api/v1/sales/returns/:id/process` | Process return & restore inventory (SOLD $\rightarrow$ AVAILABLE) |
| **Cancel Return** | `POST` | `/api/v1/sales/returns/:id/cancel` | Cancel return with mandatory reason |
| **Return History** | `GET` | `/api/v1/sales/returns/:id/history` | Get full stage-by-stage lifecycle audit log |
| **Invoice Returns** | `GET` | `/api/v1/sales/invoices/:id/returns` | Get returns associated with specific invoice |
| **Issue Refund** | `POST` | `/api/v1/sales/refunds` | Issue refund for processed sales return |
| **List Refunds** | `GET` | `/api/v1/sales/refunds` | List refunds with filters and pagination |
| **Get Refund Details** | `GET` | `/api/v1/sales/refunds/:id` | Get refund details |
| **Reverse Refund** | `POST` | `/api/v1/sales/refunds/:id/reverse` | Reverse refund with mandatory reason |
| **Return Refunds** | `GET` | `/api/v1/sales/returns/:id/refunds` | Get refund history for specific return |
