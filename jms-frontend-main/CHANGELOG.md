# Changelog

All notable changes to the Jewellery Management System (JMS) Frontend application.

## [1.1.0] - 2026-08-13

### Added
- **Phase 1 ADMIN Authority**:
  - ADMIN login portal supporting `admin@erp.com` / `Admin@123` with presets for Admin, Owner, Manager, and Cashier.
  - Dynamic RBAC permission helpers (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`).
  - PermissionGuard component and ProtectedRoute permission parameters.
  - Permission-aware sidebar navigation sections (Organization, Master Data, Inventory, Administration).

- **Phase 2 Master Data**:
  - Product Design Master Catalog Image Gallery (`ProductImageGallery`) with JPEG, PNG, WEBP validation (≤ 5MB), primary image toggle, alt text, and delete.
  - Full CRUD integration for Companies, Branches, Employees, Customers (with address & document modals), Vendors, and Products.

- **Phase 3 Physical Inventory**:
  - Inventory Items intake form modal & detailed specification pages (`/inventory-items` & `/inventory-items/:id`).
  - Physical Jewellery Photographs gallery (`InventoryItemImageGallery`).
  - Barcode & QR Code Tag Management (`/inventory-tags`) with direct barcode lookup, QR lookup, tag regeneration, and active/inactive status toggle.
  - Smartphone camera QR scanner modal using `html5-qrcode` (`QRScannerModal`).
  - Visual QR Code Renderer (`QRCodeViewer`) with copy and download options.
  - Immutable Stock Movement Ledger (`/stock-movements`) with filters and detail view modal.
  - Branch Stock Transfers (`/inventory-transfers`) with complete status lifecycle (`REQUESTED` → `APPROVED` → `DISPATCHED` → `RECEIVED` / `REJECTED`) and permission-gated action buttons.
  - Deferred RFID status display (`"RFID — Not Assigned"`).
  - Administration pages for Users, Roles, and Permissions.

### Security & Build
- 0 TypeScript compilation errors.
- Verified build using `npm run build`.
- Unit test suite for permission helpers (`src/test/verifyPermissions.ts`).
