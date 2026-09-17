# Enterprise Master Data Subsystem Specification

## Overview

This document provides complete technical, architectural, database, and API specifications for **Enterprise Master Data Infrastructure** of the Jewellery Management System (JMS).

It covers the core master tables: Companies, Branches, Employees, Customers, Customer Addresses, Customer Documents, Vendors, Product Categories, Product Sub-Categories, Products, and Product Images.

---

## 👥 Customer Classifications (CRM Master)

| Customer Type | Description | Special Benefits & Pricing |
| :--- | :--- | :--- |
| **`RETAIL`** | **Walk-in Retail Buyer** | Standard retail metal rates + standard making charges. Standard invoicing. |
| **`WHOLESALE`** | **B2B Bulk Dealer / Trader** | Discounted making charges, bulk trade rates, GST B2B invoicing with GSTIN. |
| **`VIP`** | **High-Value / Regular Client** | Priority rate locking, custom wedding jewellery discounts, personalized ledger terms. |
| **`CORPORATE`** | **Corporate / Institutional** | Bulk coin/bar gifting, formal PO invoicing, cheque/bank settlement terms. |

---

## Core Master Tables (`public` schema)

1. `public.companies`: Enterprise company records (`name *`, `legalName`, `gstNumber *`, `panNumber`, `email`, `phone`, `website`, `logoUrl`).
2. `public.branches`: Multi-showroom network (`companyId *`, `branchCode *`, `name *`, `addressLine1 *`, `city *`, `state *`, `pincode *`, `isMainBranch`).
3. `public.employees`: Staff records linked to IAM Users (`branchId *`, `employeeCode *`, `firstName *`, `lastName *`, `mobile *`, `email`, `designation`, `userId`).
4. `public.customers`: Client CRM records (`branchId *`, `customerCode *`, `firstName *`, `lastName`, `mobile *`, `email`, `customerType * [RETAIL, WHOLESALE, VIP, CORPORATE]`, `panNumber`, `aadharNumber`, `gstNumber`).
5. `public.customer_addresses`: Multi-address support (`customerId *`, `addressType *`, `addressLine1 *`, `city *`, `state *`, `pincode *`, `isDefault`).
6. `public.customer_documents`: KYC compliance files (`customerId *`, `documentType *`, `documentNumber *`, `fileUrl`).
7. `public.vendors`: Jewellery suppliers (`branchId *`, `vendorCode *`, `companyName *`, `contactPerson`, `mobile *`, `email`, `gstNumber`, `vendorType * [BULLION, JEWELLERY, GEMSTONE]`).
8. `public.product_categories`: High-level categories (`code *`, `name *`, `description`).
9. `public.product_sub_categories`: Sub-categories (`categoryId *`, `code *`, `name *`, `description`).
10. `public.products`: Jewellery product master templates (`subCategoryId *`, `sku *`, `name *`, `metalType *`, `purity *`, `grossWeight *`, `netWeight *`, `description`).
11. `public.product_images`: HD product gallery images (`productId *`, `imageUrl *`, `thumbnailUrl`, `isPrimary`, `sortOrder`).

---

## API Endpoints & Workflows

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Company** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/companies` | Company CRUD & Multi-Enterprise Settings |
| **Branch** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/branches` | Showroom Branch CRUD |
| **Employee** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/employees` | Staff Employee Directory CRUD |
| **Customer** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/customers` | Customer CRM Master CRUD |
| **Customer Address** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/customers/:id/addresses` | Customer Delivery & Billing Addresses |
| **Customer Document** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/customers/:id/documents` | Customer KYC Compliance Files |
| **Vendor** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/vendors` | Bullion & Artisan Supplier CRUD |
| **Product Category** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/product-categories` | Product Category Master |
| **Sub-Category** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/product-sub-categories` | Sub-Category Hierarchy |
| **Product Master** | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/products` | Jewellery Product Catalog & Images |
