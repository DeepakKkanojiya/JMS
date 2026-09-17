# 📜 JMS Jewellery ERP — Complete Project Phases, Sprints & Module Master Documentation

This document provides a comprehensive, phase-by-phase and sprint-by-sprint technical breakdown of the **JMS Jewellery ERP Enterprise System**. It serves as an architectural blueprint to help developers, store owners, and stakeholders understand what was implemented, how modules interconnect, and how to scale the platform in the future.

---

## 🏛️ Executive Project Vision & Core Architecture

**JMS Jewellery ERP** is an enterprise management platform engineered specifically for luxury jewellery showrooms, bullion traders, and retail chains.

- **Primary Goal**: Replace generic SaaS ERPs with a tailored, high-trust system featuring precious metal inventory management (Gold 22K/24K, Platinum 950, Silver 925, Diamonds), multi-branch staff IAM governance, fast POS counter billing lookup, and bullion vendor procurement.
- **Frontend Stack**: React 18, Vite, TypeScript, Recharts, Lucide Icons, Custom Luxury CSS Design System.
- **Backend Stack**: Node.js, Express, Prisma ORM, PostgreSQL (Schema `iam`), JWT Authentication with Refresh Token rotation.
- **Dual-Environment Architecture**: Seamless 0ms dynamic switching between **Localhost Dev** (`http://localhost:5000/api/v1`) and **Railway Cloud** (`https://jms-backend.up.railway.app/api/v1`).

---

## 🚀 Phase 1: Foundation, Security & IAM Infrastructure

### 📍 Sprint 1: Database Schema & Authentication Core
- **Objective**: Establish multi-tenant database models and secure authentication.
- **Deliverables**:
  - Prisma Schema setup with PostgreSQL backend (`postgresql://.../jms?schema=iam`).
  - Auth Service: `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`.
  - JWT Token Generation (Access Token 15m, Refresh Token 7d) stored securely in `localStorage`.
  - Official Handover Seed Credentials (`owner@jewelleryerp.com`, `manager@jewelleryerp.com`, `cashier@jewelleryerp.com` with `Admin@123`).

### 📍 Sprint 2: Express Security Layer & Dynamic Base URL Switcher
- **Objective**: Prevent rate-limit lockouts during development and enable dynamic environment switching.
- **Deliverables**:
  - Express Rate Limiter in `security.ts` updated to 1,000 requests / 15 min for dev environment.
  - Frontend Axios Interceptor (`src/api/client.ts`):
    ```typescript
    apiClient.interceptors.request.use((config) => {
      config.baseURL = getActiveBaseUrl(); // Dynamically reads 'api_environment' from localStorage
      return config;
    });
    ```
  - **Result**: Zero cross-talk between Local PostgreSQL and Railway Cloud PostgreSQL.

### 📍 Sprint 3: Role-Based Access Control (RBAC) Engine
- **Objective**: Restrict system navigation and API endpoints according to user permissions.
- **Deliverables**:
  - Developed `getRoleCode(user)` parser supporting both string roles (`user.role = "OWNER"`) and object roles (`user.role = { code: "OWNER" }`).
  - Role Hierarchy:
    - 👑 **OWNER**: Full access to all 8 modules + IAM User creation & deletion.
    - 💼 **MANAGER**: Access to 7 operational modules (Catalog, Customers, Vendors, Branches, Employees).
    - 🧾 **CASHIER**: POS Counter Billing & Quick Customer Lookup (3 modules).

---

## 📦 Phase 2: Master Modules & Auto-Increment Data Engine

### 📍 Sprint 4: Enterprise Companies & Showroom Branches Master
- **Objective**: Manage legal entities and physical store locations.
- **Deliverables**:
  - `Companies.tsx`: Display `companyCode` (e.g. `COMP-0001`), legal GSTIN, PAN, and full Create/Edit/Delete modals.
  - `Branches.tsx`: Showroom branches master (`BR-DEL-01`, `BR-GGN-02`) with branch IDs and locations.
  - Auto-Increment Pre-fill: Pre-fills candidate code `COMP-0003` (based on company count + 1).

### 📍 Sprint 5: Product Inventory Catalog & Precious Metal Management
- **Objective**: Manage gold, silver, platinum, and diamond stock.
- **Deliverables**:
  - `Products.tsx`: SKU inventory catalog supporting metal types (`GOLD`, `SILVER`, `PLATINUM`, `DIAMOND`) and purity (`22K`, `24K`, `925`).
  - Gross Weight (g) and Net Weight (g) calculation fields.
  - Metal Type Filter & SKU Search.
  - Auto-Increment Pre-fill: Pre-fills candidate SKU `SKU-0003` (based on stock count + 1).

### 📍 Sprint 6: Customer CRM Master & Fast POS Billing Search
- **Objective**: Store customer profiles and allow instant counter billing lookup.
- **Deliverables**:
  - `Customers.tsx`: CRM profile management (`RETAIL`, `WHOLESALE`, `VIP` categories).
  - Fast POS Search Widget in `Dashboard.tsx`: Instant search by Customer Code, Mobile number, or Name for cashiers.
  - Auto-Increment Pre-fill: Pre-fills candidate code `CUST-0002` (based on customer count + 1).

### 📍 Sprint 7: Bullion & Gem Suppliers Vendor Master
- **Objective**: Manage bullion vendors, raw gold suppliers, and gemstone traders.
- **Deliverables**:
  - `Vendors.tsx`: Vendor code (`VEND-0001`), GSTIN, PAN, and supplier contact details.
  - Full CRUD Modals (Add Vendor, Edit Vendor, Delete Vendor).
  - Auto-Increment Pre-fill: Pre-fills candidate code `VEND-0002` (based on vendor count + 1).

---

## 🎨 Phase 3: Executive Dashboards, Analytics & Luxury UX

### 📍 Sprint 8: Luxury Obsidian + Gold + Platinum Design System
- **Objective**: Transform standard SaaS UI into a high-trust, premium jewellery enterprise platform.
- **Deliverables**:
  - CSS Design Tokens in `index.css`:
    - **Obsidian Black (`#0B0B0D`)**: Sidebar & Login background.
    - **Champagne Gold (`#C6A15B`)**: Active indicators, revenue badges, key KPI metrics.
    - **Platinum (`#D7D9DC`)**: Subtitles, secondary text, subtle dividers.
    - **Warm Ivory (`#F7F5F0`)**: Tanishq-inspired workspace backdrop.
    - **Crisp White (`#FFFFFF`)**: Glassy cards, panels, and data tables.
  - Non-scrollable fixed height sidebar (`100vh`) with a 32px centered un-clipped floating toggle button (`>` / `<`) and hover tooltips.

### 📍 Sprint 9: Executive Dashboard & POS Counter Widget
- **Objective**: Provide store owners with real-time operational overview upon login.
- **Deliverables**:
  - Personalized Greeting: *"Good Morning, Store Owner"* with role badge.
  - 5 Precious Metal KPI Cards (Gold, Platinum, Emerald, Silver, Ruby).
  - Integrated Fast POS Quick Customer Lookup widget for cashiers.

### 📍 Sprint 10: Recharts Inventory Analytics & Verification
- **Objective**: Visualize metal distribution and top categories.
- **Deliverables**:
  - Recharts Donut Pie Chart: Metal distribution (Gold 22K/24K, Platinum 950, Silver 925, Solitaire Diamonds).
  - Recharts Bar Chart: Top product categories (Rings, Necklaces, Bangles, Earrings, Coins).
  - Production Build Verification: `npm run build` passing clean with **0 errors**.

---

## 🔮 Phase 4 – 6: Future Roadmap & Expansion Modules

When scaling the JMS Jewellery ERP in future development cycles, follow these planned phase blueprints:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          JMS ERP FUTURE ROADMAP                         │
├─────────────────────────────────────────────────────────────────────────┤
│  PHASE 4: POS Billing & Thermal Printing                               │
│  - Counter Billing Checkout & Tax Invoice PDF Generation                 │
│  - Zebra/TSC Thermal Barcode Tag Printing for Jewellery Items           │
│  - Multi-Payment Modes (Cash, Credit Card, UPI, Gold Exchange)          │
├─────────────────────────────────────────────────────────────────────────┤
│  PHASE 5: Bullion Gold Rate Ticker & Wastage Engine                     │
│  - Live MCX / Spot Gold Rate API Ticker (22K / 24K Per Gram)            │
│  - Dynamic Making Charges & Wastage % (Karatage) Calculation Engine     │
├─────────────────────────────────────────────────────────────────────────┤
│  PHASE 6: Multi-Branch Stock Transfer & Audit Logs                      │
│  - Inter-Branch Vault Transfer Approvals (Head Office <-> Branch)       │
│  - Immutable Security Audit Log Vault for High-Value Edits & Deletions  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary Matrix: Completed vs Future Phases

| Phase | Module / Feature Scope | Status | Notes |
| --- | --- | --- | --- |
| **Phase 1** | Auth, JWT Rotation, Security Rate Limits, RBAC Engine | **100% Completed** | Verified (`200 OK`) |
| **Phase 2** | Companies, Branches, Products, Customers, Vendors, IAM Users | **100% Completed** | Full Role CRUD & Auto-Increment |
| **Phase 3** | Luxury Obsidian Design System, Dashboard, POS Search, Recharts | **100% Completed** | Pass Build (0 errors) |
| **Phase 4** | POS Cash Drawer Checkout, Thermal Barcode Tag Printing | *Future Sprint* | Planned Expansion |
| **Phase 5** | Live MCX Gold Rate Ticker, Making Charges & Wastage % | *Future Sprint* | Planned Expansion |
| **Phase 6** | Inter-Branch Vault Transfer, Immutable Audit Logs | *Future Sprint* | Planned Expansion |

---
*Documentation generated & verified for JMS Jewellery ERP Platform.*
