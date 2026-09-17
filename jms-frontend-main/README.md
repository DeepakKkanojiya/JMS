# Jewellery Management System (JMS) — Frontend

Enterprise Web Application for Jewellery ERP, supporting Phase 1 IAM & Admin Authority, Phase 2 Master Data, and Phase 3 Physical Inventory Management.

## Repository
`git@github.com:babloo-Chauhan/jms-frontend.git`

## Key Capabilities
- **Phase 1 ADMIN Authority**: Admin login portal (`admin@erp.com` / `Admin@123`), dynamic RBAC permission helpers (`hasPermission`), and permission-gated navigation/actions.
- **Phase 2 Master Data**: Companies, Showroom Branches, Employees, Customer CRM (with address & document modals), Vendors, Products, and Product Design Master Catalog Images (`ProductImageGallery`).
- **Phase 3 Inventory Frontend**:
  - Physical Inventory Items intake & detailed specification pages. Deferred RFID badge (`"RFID — Not Assigned"`).
  - Physical Jewellery Photographs (`InventoryItemImageGallery`).
  - Barcode & QR Code Tag Management + smartphone camera QR scanning modal (`QRScannerModal`) + visual QR renderer (`QRCodeViewer`).
  - Immutable Stock Movement Ledger.
  - Branch Stock Transfers complete lifecycle (`REQUESTED` → `APPROVED` → `DISPATCHED` → `RECEIVED` / `REJECTED`).

## Quick Start

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run unit tests
npx tsx src/test/verifyPermissions.ts

# Production build
npm run build
```

## Documentation
- [`docs/FRONTEND_IMPLEMENTATION.md`](file:///e:/JMS/jms-frontend/docs/FRONTEND_IMPLEMENTATION.md)
- [`docs/FRONTEND_API_INTEGRATION.md`](file:///e:/JMS/jms-frontend/docs/FRONTEND_API_INTEGRATION.md)
- [`docs/FRONTEND_AUTHORITY.md`](file:///e:/JMS/jms-frontend/docs/FRONTEND_AUTHORITY.md)
