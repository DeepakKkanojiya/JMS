# JMS Frontend — API Integration Reference & Handover

## Overview

Centralized API client (`src/api/client.ts`) configured with dynamic environment switching between **Localhost Dev** (`http://localhost:5000/api/v1`) and **Railway Cloud** (`https://jms-backend.up.railway.app/api/v1`).

---

## Endpoint Mapping Summary

| Module | Method | Endpoint | Permission Key |
|---|---|---|---|
| Auth | POST | `/auth/login` | Unprotected |
| Auth | GET | `/auth/me` | Authenticated |
| Auth | POST | `/auth/refresh` | Authenticated |
| Auth | POST | `/auth/logout` | Authenticated |
| Companies | GET, POST, PUT, DELETE | `/companies` | `company.read`, `create`, `update`, `delete` |
| Branches | GET, POST, PUT, DELETE | `/branches` | `branch.read`, `create`, `update`, `delete` |
| Employees | GET, POST, PUT, DELETE | `/employees` | `employee.read`, `create`, `update`, `delete` |
| Customers | GET, POST, PUT, DELETE | `/customers` | `customer.read`, `create`, `update`, `delete` |
| Vendors | GET, POST, PUT, DELETE | `/vendors` | `vendor.read`, `create`, `update`, `delete` |
| Products | GET, POST, PUT, DELETE | `/products` | `product.read`, `create`, `update`, `delete` |
| Product Images | GET, POST, PUT, DELETE | `/products/:productId/images` | `product_image.read`, `create`, `update`, `delete` |
| Inventory Items | GET, POST, PUT, DELETE | `/inventory-items` | `inventory_item.read`, `create`, `update`, `delete` |
| Inventory History | GET | `/inventory-items/:id/history` | `inventory_item.read` |
| Inventory Item Images | GET, POST, PUT, DELETE | `/inventory-items/:inventoryItemId/images` | `inventory_item_image.read`, `create`, `update`, `delete` |
| Stock Movements | GET, POST | `/stock-movements` | `stock_movement.read`, `create` |
| Inventory Tags | GET | `/inventory-tags` | `inventory_tag.read` |
| Barcode Lookup | GET | `/inventory-tags/barcode/:barcode` | `inventory_tag.read` |
| QR Lookup | GET | `/inventory-tags/qr/:qrCode` | `inventory_tag.read` |
| Tag Assign / Update | POST, PUT | `/inventory-items/:id/tag` | `inventory_tag.create`, `update` |
| Tag Regenerate | POST | `/inventory-items/:id/tag/regenerate` | `inventory_tag.update` |
| Tag Status | PATCH | `/inventory-items/:id/tag/status` | `inventory_tag.update` |
| Stock Transfers | GET, POST | `/inventory-transfers` | `inventory_transfer.read`, `create` |
| Transfer Approve | POST | `/inventory-transfers/:id/approve` | `inventory_transfer.approve` |
| Transfer Reject | POST | `/inventory-transfers/:id/reject` | `inventory_transfer.reject` |
| Transfer Dispatch | POST | `/inventory-transfers/:id/dispatch` | `inventory_transfer.dispatch` |
| Transfer Receive | POST | `/inventory-transfers/:id/receive` | `inventory_transfer.receive` |
| Users | GET, POST, PUT, DELETE | `/users` | `user.read`, `create`, `update`, `delete` |
| Roles | GET | `/roles` | `role.read` |
| Permissions | GET | `/permissions` | `permission.read` |
