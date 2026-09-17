# Jewellery ERP Backend — Postman Workspace & Integration Guide

Welcome to the **Jewellery ERP Backend API** Postman Workspace. This directory contains the complete Postman collection, environment configurations, automated test scripts, and developer onboarding instructions for **Phase 1 (IAM)** and **Phase 2 (Master Data Infrastructure)**.

---

## 📦 1. Postman Workspace Files

- 📄 **Collection**: [`postman/IAM.postman_collection.json`](file:///r:/Cognieos/jms-backend/postman/IAM.postman_collection.json)
- ⚙️ **Railway Production Environment**: [`postman/Railway.postman_environment.json`](file:///r:/Cognieos/jms-backend/postman/Railway.postman_environment.json)
- ⚙️ **Local Development Environment**: [`postman/Local.postman_environment.json`](file:///r:/Cognieos/jms-backend/postman/Local.postman_environment.json)
- 🌐 **Interactive Swagger UI**: [`https://jms-backend.up.railway.app/docs`](https://jms-backend.up.railway.app/docs) (or `http://localhost:5000/docs`)
- 📍 **Base URLs**:
  - Railway: `https://jms-backend.up.railway.app/api/v1`
  - Localhost: `http://localhost:5000/api/v1`

---

## 🚀 2. Quick Start Guide for Postman

### Import Collection & Environment into Postman
1. Open **Postman Desktop** or **Postman Web**.
2. Click **Import** (top left).
3. Drag & drop or select:
   - `postman/IAM.postman_collection.json`
   - `postman/Railway.postman_environment.json` (or `Local.postman_environment.json`)
4. In the top-right corner environment dropdown, select **`Railway Production`** (or `Local Development`).

---

## 🗝️ 3. Development Test Credentials

Seed credentials are pre-populated into the Postman environment. All accounts use default password **`Admin@123`**:

| Role | Email | Password | Allowed Access |
| --- | --- | --- | --- |
| **Owner** | `owner@jewelleryerp.com` | `Admin@123` | Full System Access (IAM, Master Data, Inventory, Settings) |
| **Manager** | `manager@jewelleryerp.com` | `Admin@123` | Operations Access (User CRUD, Customers, Inventory, Vendors) |
| **Cashier** | `cashier@jewelleryerp.com` | `Admin@123` | Customer CRM & Fast POS Billing Search Access |

---

## 🏗️ 4. Collection Lifecycle & Teardown Architecture

The collection is structured into **15 sequential folders**:

- **Folders 1 to 4**: Auth, Roles, Users, Permissions Catalog
- **Folders 5 to 14**: Company, Branch, Employee, Customer, Customer Address, Customer Document, Vendor, Category, SubCategory, and Product CRUD APIs
- **Folder 15 (`15. Teardown & Cleanup`)**: Deletes test entities sequentially at the end of the run in **reverse hierarchical dependency order** (`Product` $\rightarrow$ `SubCategory` $\rightarrow$ `Category` $\rightarrow$ `Vendor` $\rightarrow$ `Customer Document` $\rightarrow$ `Customer Address` $\rightarrow$ `Customer` $\rightarrow$ `Employee` $\rightarrow$ `Branch` $\rightarrow$ `Company`).

### Automated Collection Runner (100% Green Pass):
1. Select **`Jewellery ERP - IAM Collection`** in Postman.
2. Click **Run Collection**.
3. Select **`Railway Production`** (or `Local Development`).
4. Click **Run Jewellery ERP - IAM Collection**.
5. All **55 / 55 requests** will pass automatically with 0 failures!

---

## ⚡ 5. Rate Limiting Note for Developers

- **Unauthenticated Requests**: Capped at **1000 requests per 15 minutes** per IP.
- **Authenticated Requests**: Requests containing a valid `Authorization: Bearer <accessToken>` header **automatically bypass IP rate limits** to support rapid front-end development and Postman Collection Runner execution.
