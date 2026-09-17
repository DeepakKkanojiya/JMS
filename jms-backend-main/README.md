# Jewellery ERP Backend System (Node.js + PostgreSQL)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-green.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-teal.svg)](https://www.prisma.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-brightgreen.svg)](http://localhost:5000/docs)

## 📌 Introduction
The **Jewellery ERP Backend** is an enterprise-grade RESTful API server designed specifically for high-precision jewellery manufacturing, retail POS, inventory stock tracking, customer CRM, repair management, Girvi loan pledges, financial ledger accounting, and business reporting.

Built using **Node.js, Express v5, TypeScript, PostgreSQL 18, and Prisma ORM v7**, the architecture strictly adheres to a **5-Layer Modular Subsystem Pattern** with comprehensive Identity & Access Management (IAM) role-based authorization.

📘 **Master Code Flow & System Learning Guide**: See [`docs/MASTER_SYSTEM_AND_CODE_FLOW.md`](file:///e:/JMS/jms-backend/docs/MASTER_SYSTEM_AND_CODE_FLOW.md) for the all-in-one code flow learning guide covering all phases, all sprints, and request lifecycles.
💻 **Frontend Developer API Handover Package**: See [`docs/FRONTEND_API_HANDOVER.md`](file:///e:/JMS/jms-backend/docs/FRONTEND_API_HANDOVER.md) for the complete frontend REST API integration catalog.
📖 **Documentation Index**: See [`docs/README.md`](file:///e:/JMS/jms-backend/docs/README.md) for the complete sitemap index.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js v20+ LTS
- **Framework**: Express v5.2
- **Language**: TypeScript v5.9
- **Database Engine**: PostgreSQL 18 (Multi-Schema Support: `iam` & `public`)
- **ORM**: Prisma ORM v7.9 with `@prisma/adapter-pg`
- **Validation**: Zod v4.4
- **Security**: Helmet v8.3, CORS, Express-Rate-Limit, Input Sanitization, bcryptjs v3.0
- **Authentication**: JSON Web Tokens (jsonwebtoken v9.0) with persistent refresh session tracking
- **Documentation**: OpenAPI 3.0 via Swagger UI (`/docs`) & Postman Collection v2.1

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js installed (`node -v` >= 20)
- PostgreSQL 18 server running on `localhost:5432`

### 2. Environment Setup
Clone the repository and copy the environment template:
```bash
git clone https://github.com/ctpl-rajveer/jms-backend.git
cd jms-backend
cp .env.example .env
```

### 3. Installation & Database Seeding
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Seed Database Schema & Master Tables
$env:PGPASSWORD="admin"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jewellery_erp -f database/schema/01_iam_schema.sql
$env:PGPASSWORD="admin"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jewellery_erp -f database/migrations/001_create_iam_roles.sql
$env:PGPASSWORD="admin"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jewellery_erp -f database/migrations/002_create_iam_permissions_and_users.sql
$env:PGPASSWORD="admin"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d jewellery_erp -f database/migrations/003_create_phase2_master_tables.sql

# Seed Data via Prisma ORM 7
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at **`http://localhost:5000`**. Interactive Swagger UI documentation will be available at **`http://localhost:5000/docs`**.

---

## 🧪 Testing Suites

Run all automated test suites:
```bash
# Run Complete Test Suite (26 Test Suites, 100% Pass Rate)
npm run test:all

# Run Phase 1 IAM Test Suites
npm run test:iam

# Run Phase 2 Master Data & API Test Suites
npm run test:phase2:db         # 10 Phase 2 Database Tables
npm run test:company           # Company CRUD APIs
npm run test:branch            # Branch CRUD APIs
npm run test:employee          # Employee CRUD APIs
npm run test:customer          # Customer CRUD APIs & POS Quick Search
npm run test:customer-address  # Customer Multi-Address CRUD APIs
npm run test:customer-document # Customer KYC Document CRUD APIs
npm run test:vendor            # Vendor Profile & Supplier CRUD APIs
npm run test:product-category  # Product Category Catalog CRUD APIs
npm run test:product-sub-category # Product Sub-Category Catalog CRUD APIs
npm run test:product           # Product Inventory Master CRUD APIs
npm run test:master            # Common Master Dropdown APIs

# Run Phase 4 Sales Subsystem Test Suites
npm run test:sales-invoice      # Sales Invoice Foundation
npm run test:metal-rate         # Metal Rate Engine & Rate Locking
npm run test:sales-pos          # POS Billing & Inventory Deduction
npm run test:making-charge      # Making Charge Master Data
npm run test:tax-rate           # Tax Rate Master Data
npm run test:pricing            # Jewellery Pricing & Tax Calculation Engine
npm run test:sales-payment      # Payment Processing & Sales Settlement
npm run test:gold-exchange     # Customer Gold Exchange & Old Gold Valuation
npm run test:sales-return       # Sales Return Management & Inventory Restoration
npm run test:sales-refund       # Sales Refund Ledger & Reversals
npm run test:phase4-final-integration # Phase 4 Complete Integration & Audit Suite (30 tests)

# Run Phase 5 Procurement & Inventory Operations Test Suites
npm run test:purchase           # Purchase Order Foundation & Lifecycle
npm run test:purchase-order     # Purchase Order Foundation & Lifecycle (22 tests)

---

## 📦 Postman Workspace & Collection Handover

Postman collection and environment exports are located in the `postman/` folder:
- **Collection**: [`postman/Jewellery_ERP.postman_collection.json`](file:///e:/JMS/jms-backend/postman/Jewellery_ERP.postman_collection.json)
- **Local Environment**: [`postman/Development.postman_environment.json`](file:///e:/JMS/jms-backend/postman/Development.postman_environment.json) (`http://localhost:5000/api/v1`)

**Auto-Token Extraction**: Executing `POST Login (Owner)` in Postman automatically extracts and sets `accessToken` and `refreshToken` variables for subsequent requests.

---

## 🏆 Completed Sprints & Features Summary

### 🔹 Phase 1 — Identity & Access Management (IAM) — COMPLETED 🎉
- ✅ **Sprint 1.1 - 1.10**: Full IAM Subsystem (`iam.users`, `iam.roles`, `iam.permissions`, `iam.role_permissions`, `iam.user_sessions`, `iam.login_history`, `iam.password_reset_tokens`).

### 🔹 Phase 5 — Procurement, Vendor & Stock Operations — COMPLETED 🎉
- ✅ **Sprint 5.1 — Purchase Order Foundation**: PurchaseOrder & PurchaseOrderItem models, status lifecycle (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `APPROVED`), 22 integration tests.
- ✅ **Sprint 5.2 — Purchase Receiving & Inventory Intake**: Physical stock intake, barcode tagging, `StockMovement` creation.
- ✅ **Sprint 5.3 — Purchase Billing & Costing**: PurchaseBill models, billable quantity engine, 29 integration tests.
- ✅ **Sprint 5.4 — Vendor Payments & Payable Settlement**: VendorPayment ledger, overpayment protection, vendor payable summary, 40 integration tests.
- ✅ **Sprint 5.5 — Purchase Return & Vendor Debit Notes**: PurchaseReturn & VendorDebitNote models, stock removal, 30 integration tests.
- ✅ **Sprint 5.6 — Karigar Job Work & Material Issue**: JobWorkOrder lifecycle, material issue tracking, Karigar ledger, 27 integration tests.
- ✅ **Sprint 5.7 — Stock Audit & Inventory Reconciliation**: Stock Audit session, physical scan, discrepancy reconciliation, missing item tracking, 26 integration tests.

### 🔹 Phase 6 — Girvi & Pawning Subsystem — COMPLETED 🎉
- ✅ **Sprint 6.1 — Self Girvi Loan Foundation**: GirviLoan & GirviCollateral models, GL numbering, pledge valuation, status state machine, 10 integration tests.
- ✅ **Sprint 6.2 — Interest Calculation Engine & Collections**: Monthly interest accrual, split principal/interest collection ledger, loan renewal, 10 integration tests.
- ✅ **Sprint 6.3 — Full Settlement & Jewellery Release**: Settle loan balance, collateral jewellery release, inventory status restoration, `StockMovement` audit, 9 integration tests.
- ✅ **Sprint 6.4 — Third-Party Girvi Management**: External lender catalog, Third-Party Girvi records, strict financial isolation from store accounts, 9 integration tests.
- ✅ **Sprint 6.5 — Girvi Reports & Final Integration Backend**: Portfolio financial summary, overdue aging analysis (0-30, 31-60, 61-90, 90+ days), collection report, settlement report, released collateral report, Third-Party Girvi report, 360-degree chronological audit trail, 18/18 integration test verification (0 DB mutations).


