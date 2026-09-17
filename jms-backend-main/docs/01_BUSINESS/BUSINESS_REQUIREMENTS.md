---
title: Business Requirements Overview
type: BUSINESS
status: ACTIVE
authority: AUTHORITATIVE
last_updated: 2026-08-20
owner: JMS Product Management
related:
  - LEGACY_SYSTEM/LEGACY_FEATURES.md
  - ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md
  - ../00_START_HERE/PROJECT_OVERVIEW.md
---

# 🏢 JMS Business Requirements Overview

## 1. Scope & Domain Objectives

The **Jewellery Management System (JMS)** requirements cover the complete lifecycle of jewellery business operations across retail showrooms, wholesale desks, manufacturing workshops (Karigars), and pawn-broking counters.

---

# 2. Key Business Subsystems & Requirements

### 1. Enterprise Master Data
* Multi-company, multi-branch hierarchy with isolated stock and financial ledgers.
* Role-Based Access Control (RBAC) supporting Owner, Manager, Cashier, Salesperson, Accountant, Karigar Manager, and Auditor roles.

### 2. Physical Inventory & Tagged Stock
* Unique RFID / Barcode item tracking for gold, diamond, platinum, and silver items.
* Tracking Gross Weight, Net Weight, Fine Weight, Stone Weight (Carats), Purity (Karat), Wastage, and Making Charges.

### 3. Sales & POS Billing
* Real-time board rate fetching and locking per invoice.
* Dynamic making charge calculation (Per Gram vs Fixed vs Percentage).
* Customer Gold Exchange / Trade-in processing with purity testing deductions.
* Mixed payment settlements (Cash, Card, UPI, Store Credit, Bank Transfer).

### 4. Procurement & Artisan Job Work
* Purchase Orders, Stock Receiving (GRN), and Costing Bills.
* Artisan / Karigar issue of raw gold/silver bars and receipt of finished ornaments with loss percentage reconciliation.

### 5. Girvi / Pawn Management
* Collateralized loans against gold/silver ornaments with customizable interest rates and monthly interest ledger.

---

# 3. Reference vs Target Build Specifications

* For detailed legacy desktop system behavior, refer to [Legacy Features](file:///E:/JMS/jms-backend/docs/01_BUSINESS/LEGACY_SYSTEM/LEGACY_FEATURES.md).
* For complete ERP proposal and target build scope, refer to [Complete Build Scope](file:///E:/JMS/jms-backend/docs/01_BUSINESS/ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md).
