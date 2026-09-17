# Identity, Authentication & Dynamic RBAC Subsystem Specification

## Overview

This document provides complete technical, architectural, database, and API specifications for **Identity & Access Management (IAM)** of the Jewellery Management System (JMS).

It covers JWT authentication, password hashing, user session management, dynamic database Role-Based Access Control (RBAC), user management, role management, and permission management.

---

## 🏪 Standard Jewellery Store Staff Roles

| Role Code | Role Name | Ideal For | Access & Dashboard View |
| :--- | :--- | :--- | :--- |
| **`OWNER`** | **Store Owner / Director** | Proprietor / MD / Partner | Full unrestricted access to all branches, profit reports, audit logs, and settings. Dashboard: **Store Management (360° Overview)** |
| **`SUPER_ADMIN`** | **Super Administrator** | Technical / Administrative Director | Full administrative access to system configurations, security, audit logs, and all branches. Dashboard: **Store Management (360° Overview)** |
| **`ADMIN`** | **System Administrator** | IT / Systems Administrator | IT & system administrator managing users, branches, permissions, and technical configurations. Dashboard: **Store Management (360° Overview)** |
| **`BRANCH_MANAGER`** | **Showroom Store Manager** | Showroom floor manager | Manages branch sales, inventory stock, staff attendance, approves returns & discounts. Dashboard: **Showroom Management** |
| **`CASHIER`** | **Billing Cashier** | Counter billing staff | Creates customer bills, scans barcodes/QR tags, locks gold rates, takes payments (Cash/UPI/Card). Dashboard: **Billing Counter & POS** |
| **`STAFF`** | **Billing Cashier / Staff** | Counter sales & assistance staff | Operational billing counter and counter sales assistance. Dashboard: **Billing Counter & POS** |
| **`SALESPERSON`** | **Sales Executive** | Floor counter staff | Searches jewellery items, assists customers, quotes estimated totals, tags sales commissions. Dashboard: **Sales & Catalog View** |
| **`INVENTORY_MANAGER`** | **Vault & Stock Keeper** | Stock vault in-charge | Manages physical stock, receives vendor bullion, prints/regenerates barcode tags, branch transfers. Dashboard: **Stock & Vault Control** |
| **`ACCOUNTANT`** | **Accounts & Tax Officer** | Store accountant / CA | Monitors cash/bank collections, customer credit balances, refunds, and GST (3%) tax ledgers. Dashboard: **Finance & Accounts** |
| **`KARIGAR_SUPERVISOR`** | **Goldsmith / Workshop Head** | Workshop supervisor | Manages old gold melting, custom jewellery orders, repairs, and craftsmanship tracking. Dashboard: **Workshop & Repairs** |

---

## Data Models (`iam` schema)

### 1. `iam.roles`
- `id`: UUID (Primary Key)
- `name`: String (Unique, e.g. `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `CASHIER`, `STAFF`, `SALESPERSON`, `INVENTORY_MANAGER`, `ACCOUNTANT`, `KARIGAR_SUPERVISOR`)
- `displayName`: String?
- `description`: String?
- `isActive`: Boolean @default(true)
- `createdAt`, `updatedAt`: Timestamptz

### 2. `iam.permissions`
- `id`: UUID (Primary Key)
- `module`: String (e.g. `user`, `role`, `company`, `branch`, `employee`, `customer`, `vendor`, `product`, `inventory_item`, `sales_invoice`, `sales_payment`, `metal_rate`, `making_charge`, `tax_rate`)
- `action`: String (e.g. `create`, `read`, `update`, `delete`, `confirm`, `cancel`, `reverse`, `value`, `apply`)
- `permissionKey`: String (Unique, e.g. `user.create`, `sales_invoice.confirm`)
- `description`: String?
- `createdAt`, `updatedAt`: Timestamptz

### 3. `iam.role_permissions`
- `id`: UUID (Primary Key)
- `roleId`: UUID (FK to `Role`)
- `permissionId`: UUID (FK to `Permission`)
- Unique constraint: `(roleId, permissionId)`

### 4. `iam.users`
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `passwordHash`: String (Bcrypt hashed)
- `firstName`, `lastName`: String
- `employeeCode`: String?
- `roleId`: UUID (FK to `Role`)
- `status`: Enum (`ACTIVE`, `INACTIVE`, `SUSPENDED`)
- `createdAt`, `updatedAt`: Timestamptz

---

## Authentication Flow & Tokens

1. **User Login (`POST /api/v1/auth/login`)**:
   - Accepts `email` and `password`.
   - Compares bcrypt hash.
   - Resolves user role and queries `iam.role_permissions` to compile active `permissions: string[]`.
   - Returns Access Token (JWT 15m), Refresh Token (JWT 7d), User profile, and permission array.

2. **Authorization Middleware (`requirePermission`)**:
   - Extract JWT from `Authorization: Bearer <token>` header.
   - Verify payload signature and expiry.
   - Check if `req.user.permissions` includes the required `permissionKey`.
   - Returns `403 Forbidden` if permission missing.

---

## API Endpoints Summary

### Authentication APIs
- `POST /api/v1/auth/login`: Authenticate user & issue tokens.
- `POST /api/v1/auth/logout`: Revoke active refresh session.
- `POST /api/v1/auth/refresh`: Issue new access token.
- `GET /api/v1/auth/me`: Get current user profile & permissions.

### User Management APIs
- `GET /api/v1/users`: List users with search, status filters, and pagination.
- `POST /api/v1/users`: Create user account.
- `GET /api/v1/users/:id`: Get user profile.
- `PUT /api/v1/users/:id`: Update user details.
- `DELETE /api/v1/users/:id`: Delete user account.

### Role & Permission Management APIs
- `GET /api/v1/roles`: List security roles.
- `POST /api/v1/roles`: Create security role.
- `PUT /api/v1/roles/:id`: Update role.
- `DELETE /api/v1/roles/:id`: Delete role (system roles protected).
- `POST /api/v1/roles/:id/permissions`: Assign permissions to role.
- `GET /api/v1/permissions`: List permission catalog.
