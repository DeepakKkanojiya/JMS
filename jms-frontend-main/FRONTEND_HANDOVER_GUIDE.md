# 💎 JMS Jewellery ERP — Frontend Architecture & Handover Documentation

Welcome to the comprehensive technical documentation for the **JMS Jewellery ERP Frontend Application**. This document explains the system architecture, directory structure, luxury design system, dynamic dual-environment target switcher, data flow, auto-increment code generation logic, and full Role-Based Access Control (RBAC).

---

## 📌 Executive Summary

- **Framework**: React 18 + Vite + TypeScript
- **Styling Paradigm**: Obsidian Black + Champagne Gold + Platinum Luxury Enterprise Design System (Custom CSS Design Tokens in `index.css`)
- **State Management**: React Context (`AuthContext`) + Local Component State
- **HTTP Client**: Axios with Dynamic Request Interceptors & 401 Silent Token Rotation (`client.ts`)
- **Routing**: React Router DOM v6 (`AppLayout`, `ProtectedRoute`)
- **Data Visualization**: Recharts (Precious Metals & Category Inventory Analytics)

---

## 🎨 1. Luxury Design System Tokens

The application follows an enterprise luxury palette tailored specifically for high-end jewellery showroom operations:

| Design Token | Color Name | Hex Code | Visual Application |
| --- | --- | --- | --- |
| `--bg-sidebar` | **Obsidian Black** | `#0B0B0D` | Fixed dark sidebar background, header avatar badge |
| `--gold-primary` | **Champagne Gold** | `#C6A15B` | Active navigation indicator, revenue highlights, key KPI values |
| `--platinum-primary`| **Platinum** | `#D7D9DC` | Logo subtitle, secondary metrics, subtle dividers |
| `--bg-primary` | **Warm Ivory** | `#F7F5F0` | Tanishq-inspired workspace backdrop |
| `--bg-surface` | **Crisp White** | `#FFFFFF` | Panels, data cards, search inputs, modal dialogs |
| `--text-primary` | **Deep Charcoal** | `#18181B` | Ultra-legible primary body typography |

### 💎 Precious Metal Visual Language:
- 🟡 **Gold (`#C6A15B`)**: Product Inventory & Revenue SKUs
- ⚪ **Platinum (`#D7D9DC`)**: CRM Customers & High-Value Catalog
- 🔘 **Silver (`#94A3B8`)**: Showroom Branches & Stock Locations
- 🟢 **Emerald (`#059669`)**: Active Staff Employees & POS Billing Checkout
- 🔴 **Ruby (`#DC2626`)**: Bullion Vendors & Inventory Alerts

---

## 📁 2. File & Directory Structure

```
jms-frontend/
├── public/                     # Static public assets & icons
├── src/
│   ├── api/
│   │   └── client.ts           # Axios instance, dynamic base URL interceptor, token rotation
│   ├── components/
│   │   └── layout/
│   │       └── AppLayout.tsx   # Sidebar, centered floating toggle (> / <), top header, nav items
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state, login/logout, RBAC permissions, environment switcher
│   ├── pages/
│   │   ├── Login.tsx           # Compact non-scrollable login, presets, real-time URL display
│   │   ├── Dashboard.tsx       # Greetings, metal KPI cards, POS search widget, Recharts
│   │   ├── Customers.tsx       # CRM master, customerCode badges, sequential code pre-fill, CRUD modals
│   │   ├── Products.tsx        # SKU catalog, metal/purity filter, sequential SKU pre-fill, CRUD modals
│   │   ├── Companies.tsx       # Enterprise profiles, companyCode badges, sequential code pre-fill, CRUD modals
│   │   ├── Branches.tsx        # Showroom branch master, branchCode badges & IDs
│   │   ├── Employees.tsx       # Staff master, employeeCode badges & branch assignments
│   │   ├── Vendors.tsx         # Bullion/gem suppliers, vendorCode badges, sequential code pre-fill, CRUD modals
│   │   └── Users.tsx           # IAM governance, role assignment, status toggles, CRUD modals
│   ├── App.tsx                 # Application routes & ProtectedRoute wrappers
│   ├── main.tsx                # Entry point
│   └── index.css               # Design tokens, glassy cards, custom scrollbars, tooltips
├── .env                        # Explicit environment URL configurations
└── package.json                # Project dependencies
```

---

## 🌐 3. Dynamic Dual-Environment Target Switcher

The frontend is capable of switching target backend API environments dynamically in **0ms** without code modification or server restarts.

### Environment Endpoints (`client.ts`):
- 🟢 **Localhost Dev Mode**: `http://localhost:5000/api/v1` (Targeting Local PostgreSQL DB `localhost:5432`)
- 🌐 **Railway Cloud Mode**: `https://jms-backend.up.railway.app/api/v1` (Targeting Railway Cloud Managed PostgreSQL DB)

### How It Works Under the Hood:
1. When a user clicks **Local** or **Live Railway** (on `Login.tsx` or `AppLayout.tsx`), `toggleEnvironment(env)` updates `localStorage.setItem('api_environment', env)`.
2. The Axios Request Interceptor (`src/api/client.ts`) attaches `config.baseURL = getActiveBaseUrl()` dynamically to **every single HTTP request** (`GET`, `POST`, `PUT`, `DELETE`).
3. **Zero Cross-Talk Guarantee**: When Local is active, all CRUD operations modify the local PostgreSQL DB. When Live Railway is active, all CRUD operations modify the Railway Cloud DB.

---

## 🔢 4. Sequential Auto-Increment Code Generation Strategy

To ensure seamless showroom data entry, master modules feature **Sequential Auto-Increment Pre-filling with Owner Override**:

| Entity | Code Key | Auto-Increment Format Example | Owner Custom Override Capability |
| --- | --- | --- | --- |
| **Customers** | `customerCode` | `CUST-0001`, `CUST-0002`... | Yes (e.g. `CUST-VIP-RAJESH`) |
| **Products** | `sku` | `SKU-0001`, `SKU-0002`... | Yes (e.g. `SKU-GOLD-RING-01`) |
| **Companies** | `companyCode` | `COMP-0001`, `COMP-0002`... | Yes (e.g. `COMP-TANI-01`) |
| **Vendors** | `vendorCode` | `VEND-0001`, `VEND-0002`... | Yes (e.g. `VEND-BULLION-DELHI`) |

---

## 🛡️ 5. Role-Based Access Control (RBAC) Matrix

The application handles both string role payloads (`user.role = "OWNER"`) and object role payloads (`user.role = { code: "OWNER" }`) using the `getRoleCode(user)` helper.

| Sidebar Module | OWNER / ADMIN | MANAGER | CASHIER / STAFF |
| --- | --- | --- | --- |
| **Dashboard** | ✅ Full Access | ✅ Showroom View | ✅ POS Billing & Quick Lookup |
| **Users & Access** | ✅ Full IAM & CRUD | ❌ Hidden | ❌ Hidden |
| **Customers** | ✅ Full CRUD | ✅ Create & Edit | ✅ Create & POS Billing |
| **Products** | ✅ Full CRUD | ✅ Create & Edit | 👁️ Read-Only View |
| **Companies** | ✅ Full CRUD | ✅ Create & Edit | ❌ Hidden |
| **Branches** | ✅ Full CRUD | 👁️ View | ❌ Hidden |
| **Employees** | ✅ Full CRUD | ✅ View & Edit | ❌ Hidden |
| **Vendors** | ✅ Full CRUD | ✅ Create & Edit | ❌ Hidden |

---

## 🔐 6. Official Handover Credentials

| Role | Email | Password | Scope & Privileges |
| --- | --- | --- | --- |
| 👑 **Owner** | `owner@jewelleryerp.com` | `Admin@123` | Full Governance, IAM User Creation, Company Setup |
| 💼 **Manager** | `manager@jewelleryerp.com` | `Admin@123` | Product Inventory, Stock Updates, Vendor Management |
| 🧾 **Cashier** | `cashier@jewelleryerp.com` | `Admin@123` | Fast POS Customer Quick Search & Counter Billing |

---

## 🛠️ 7. Verification & Build Commands

- **Start Frontend Development Server**:
  ```bash
  cd e:\JMS\jms-frontend
  npm run dev
  ```
- **Execute Production Build Verification**:
  ```bash
  cmd /c npm run build
  ```
