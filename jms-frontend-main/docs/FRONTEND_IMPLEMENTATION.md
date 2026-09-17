# JMS Frontend — Phase 1 & Phase 3 Architecture & Implementation Guide

## Overview

This document describes the complete frontend application architecture for the Jewellery Management System (JMS), implementing Phase 1 ADMIN Authority, Phase 2 Master Data, and Phase 3 Inventory Management.

---

## 1. Application Architecture & Tech Stack

- **Framework**: React 18 + TypeScript + Vite.
- **Routing**: React Router v6 (`BrowserRouter`, nested routes, `ProtectedRoute`, `PermissionGuard`).
- **Styling System**: Obsidion Black (`#0B0B0D`) & Champagne Gold (`#C6A15B`) design system tokens using Vanilla CSS.
- **Icons**: Lucide React.
- **Charts**: Recharts.
- **QR Code Engine**: `html5-qrcode` (camera-based scanning) & QRServer API / Canvas visual renderer (`QRCodeViewer`).

---

## 2. Dynamic RBAC Authority & Permission Guards

The backend is the sole security boundary. Frontend authority is permission-driven using `user.permissions: string[]` returned by `/auth/me`.

### Permission Helpers (`src/utils/permissions.ts`):
- `hasPermission(userPermissions, requiredPermission)`
- `hasAnyPermission(userPermissions, requiredPermissions)`
- `hasAllPermissions(userPermissions, requiredPermissions)`

### Components:
- `<PermissionGuard permission="inventory_transfer.approve">`: Dynamically hides/disables UI action buttons.
- `<ProtectedRoute permission="product.read">`: Prevents unauthorized route navigation.

---

## 3. Implemented Modules & Features

### Phase 1 — Admin Authentication
- Login page (`/login`) supporting local development ADMIN credentials (`admin@erp.com` / `Admin@123`).
- Presets for ADMIN, OWNER, MANAGER, and CASHIER accounts.
- JWT Access Token & Refresh Token storage with automatic 401 token rotation.

### Phase 2 — Master Data Management
- **Companies** (`/companies`): Enterprise company entities.
- **Branches** (`/branches`): Showroom retail branch locations.
- **Employees** (`/employees`): Showroom workforce management.
- **Customers** (`/customers`): Customer CRM + address & document modals.
- **Vendors** (`/vendors`): Bullion & gem supplier CRUD.
- **Products & Master Design Images** (`/products`): SKU catalog + Product Categories & Sub-Categories + Product Master Design Image Gallery (`ProductImageGallery`).

### Phase 3 — Inventory Management
- **Inventory Items** (`/inventory-items` & `/inventory-items/:id`): Intake form for physical tagged jewellery pieces. Detail view featuring Product specs, Physical item weights, Tag info, Audit log, and Physical Jewellery Photographs (`InventoryItemImageGallery`). Displays `"RFID — Not Assigned"` for unassigned RFID EPC.
- **Stock Movements** (`/stock-movements`): Immutable stock ledger table with type/branch/date filters and "View Details" modal (no edit/delete).
- **Inventory Tags** (`/inventory-tags`): Barcode & QR lookup, smartphone camera QR scanning modal (`QRScannerModal`), tag regeneration, and active/inactive toggle.
- **Branch Stock Transfers** (`/inventory-transfers`): Complete transfer lifecycle state machine (`REQUESTED` → `APPROVED` → `DISPATCHED` → `RECEIVED` / `REJECTED`). Action buttons guarded by specific permissions (`inventory_transfer.approve`, `dispatch`, `receive`, `reject`).

---

## 4. Deferred Status Notice

- **RFID Hardware Integration**: Intentionally deferred because physical hardware is not available. System operates seamlessly with `rfidEpc = null`, displaying `"RFID — Not Assigned"` badge.
