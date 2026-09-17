# JMS Frontend — Dynamic Authority & Security Rules

## Single Source of Truth

The backend RBAC middleware (`requirePermission(...)`) is the authoritative security boundary.

Frontend authority checks (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`) exist exclusively for rendering UX controls (hiding/disabling action buttons and sidebar navigation items).

## Permission Mapping Table

| Section | Required Read Permission | Action Permissions |
|---|---|---|
| Companies | `company.read` | `company.create`, `company.update`, `company.delete` |
| Branches | `branch.read` | `branch.create`, `branch.update`, `branch.delete` |
| Employees | `employee.read` | `employee.create`, `employee.update`, `employee.delete` |
| Customers | `customer.read` | `customer.create`, `customer.update`, `customer.delete` |
| Vendors | `vendor.read` | `vendor.create`, `vendor.update`, `vendor.delete` |
| Products | `product.read` | `product.create`, `product.update`, `product.delete` |
| Product Images | `product_image.read` | `product_image.create`, `product_image.update`, `product_image.delete` |
| Inventory Items | `inventory_item.read` | `inventory_item.create`, `inventory_item.update`, `inventory_item.delete` |
| Inventory Item Images | `inventory_item_image.read` | `inventory_item_image.create`, `inventory_item_image.update`, `inventory_item_image.delete` |
| Stock Movements | `stock_movement.read` | `stock_movement.create` (Immutable log) |
| Inventory Tags | `inventory_tag.read` | `inventory_tag.create`, `inventory_tag.update` |
| Stock Transfers | `inventory_transfer.read` | `inventory_transfer.create`, `approve`, `reject`, `dispatch`, `receive` |
| Users & Access | `user.read` | `user.create`, `user.update`, `user.delete` |
| Roles | `role.read` | `role.create`, `role.update` |
| Permissions | `permission.read` | `permission.read` |
