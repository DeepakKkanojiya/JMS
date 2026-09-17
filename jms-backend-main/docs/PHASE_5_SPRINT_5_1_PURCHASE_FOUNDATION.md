# Phase 5 — Sprint 5.1: Purchase Foundation Subsystem Report

## 1. Objective & Scope

Sprint 5.1 establishes the enterprise **Purchase Foundation & Purchase Order (PO)** subsystem for the Jewellery Management System (JMS) backend. 

### Scope Boundaries:
- **Included**: Purchase Order model, Purchase Order Item model, concurrency-safe PO numbering (`PO-YYYYMMDD-XXXX`), DRAFT lifecycle, SUBMITTED & APPROVED status workflows, CANCELLED status workflows with mandatory cancellation reasons, authoritative server-side Decimal price/tax calculations, dynamic database-driven RBAC permissions, Swagger OpenAPI 3.0 docs, Postman collection folder 29, and automated integration test suite.
- **Explicitly Excluded (Later Sprints)**: Stock receiving, physical inventory item creation, stock movements, purchase bills, vendor payables, vendor payments, vendor ledger, procurement reports, and frontend UI.

---

## 2. Database Models & Schema Changes

### Added Enum: `PurchaseOrderStatus` (Public Schema)
```prisma
enum PurchaseOrderStatus {
  DRAFT
  SUBMITTED
  APPROVED
  RECEIVING
  COMPLETED
  CANCELLED

  @@map("purchase_order_status")
  @@schema("public")
}
```

### Added Models: `PurchaseOrder` & `PurchaseOrderItem`
```prisma
model PurchaseOrder {
  id                   String              @id @default(uuid()) @db.Uuid
  purchaseOrderNumber  String              @unique @map("purchase_order_number")
  vendorId             String              @map("vendor_id") @db.Uuid
  vendor               Vendor              @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  branchId             String              @map("branch_id") @db.Uuid
  branch               Branch              @relation(fields: [branchId], references: [id], onDelete: Restrict)
  status               PurchaseOrderStatus @default(DRAFT)
  orderDate            DateTime            @default(now()) @map("order_date") @db.Timestamptz
  expectedDeliveryDate DateTime?           @map("expected_delivery_date") @db.Timestamptz
  subtotal             Decimal             @default(0.00) @map("subtotal") @db.Decimal(12, 2)
  taxAmount            Decimal             @default(0.00) @map("tax_amount") @db.Decimal(12, 2)
  grandTotal           Decimal             @default(0.00) @map("grand_total") @db.Decimal(12, 2)
  notes                String?
  termsConditions      String?             @map("terms_conditions")
  createdBy            String?             @map("created_by") @db.Uuid
  updatedBy            String?             @map("updated_by") @db.Uuid
  submittedBy          String?             @map("submitted_by") @db.Uuid
  submittedAt          DateTime?           @map("submitted_at") @db.Timestamptz
  approvedBy           String?             @map("approved_by") @db.Uuid
  approvedAt           DateTime?           @map("approved_at") @db.Timestamptz
  cancelledBy          String?             @map("cancelled_by") @db.Uuid
  cancelledAt          DateTime?           @map("cancelled_at") @db.Timestamptz
  cancellationReason   String?             @map("cancellation_reason")
  createdAt            DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime            @updatedAt @map("updated_at") @db.Timestamptz

  items                PurchaseOrderItem[]

  @@index([vendorId])
  @@index([branchId])
  @@index([status])
  @@index([orderDate])
  @@index([purchaseOrderNumber])
  @@map("purchase_orders")
  @@schema("public")
}

model PurchaseOrderItem {
  id               String        @id @default(uuid()) @db.Uuid
  purchaseOrderId  String        @map("purchase_order_id") @db.Uuid
  purchaseOrder    PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  productId        String?       @map("product_id") @db.Uuid
  product          Product?      @relation(fields: [productId], references: [id], onDelete: SetNull)
  metalType        MetalType     @map("metal_type")
  purity           String
  itemName         String        @map("item_name")
  description      String?
  orderedQuantity  Int           @default(1) @map("ordered_quantity")
  receivedQuantity Int           @default(0) @map("received_quantity")
  grossWeight      Decimal       @map("gross_weight") @db.Decimal(10, 3)
  netWeight        Decimal       @map("net_weight") @db.Decimal(10, 3)
  stoneWeight      Decimal       @default(0.000) @map("stone_weight") @db.Decimal(10, 3)
  expectedRate     Decimal       @map("expected_rate") @db.Decimal(12, 2)
  makingCharges    Decimal       @default(0.00) @map("making_charges") @db.Decimal(12, 2)
  taxRate          Decimal       @default(0.00) @map("tax_rate") @db.Decimal(5, 2)
  taxAmount        Decimal       @default(0.00) @map("tax_amount") @db.Decimal(12, 2)
  itemTotal        Decimal       @map("item_total") @db.Decimal(12, 2)
  createdAt        DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime      @updatedAt @map("updated_at") @db.Timestamptz

  @@index([purchaseOrderId])
  @@index([productId])
  @@index([metalType, purity])
  @@map("purchase_order_items")
  @@schema("public")
}
```

---

## 3. Purchase Order State Machine

```text
       ┌───────────┐
       │   DRAFT   ├──────────────┐
       └─────┬─────┘              │
             │ (submit)           │
             ▼                    │
       ┌───────────┐              │
       │ SUBMITTED ├────────┐     │ (cancel)
       └─────┬─────┘        │     │
             │ (approve)    │     │
             ▼              │     │
       ┌───────────┐        │     │
       │ APPROVED  ├────────┘     │
       └─────┬─────┘              │
             ▼                    ▼
     [Future Sprints]      ┌─────────────┐
   (Receive/Completed)     │  CANCELLED  │
                           └─────────────┘
```

---

## 4. REST API Endpoints

| Method | Route | Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchases` | `purchase.create` | Create a draft Purchase Order with line items |
| `GET` | `/api/v1/purchases` | `purchase.read` | List paginated POs with search, vendor, branch, status, date filters |
| `GET` | `/api/v1/purchases/:id` | `purchase.read` | Retrieve single PO details by ID with line items |
| `PUT` | `/api/v1/purchases/:id` | `purchase.update` | Update a draft PO and recalculate totals |
| `POST` | `/api/v1/purchases/:id/submit` | `purchase.submit` | Submit draft PO for managerial review (`DRAFT -> SUBMITTED`) |
| `POST` | `/api/v1/purchases/:id/approve` | `purchase.approve` | Approve submitted PO (`SUBMITTED -> APPROVED`) |
| `POST` | `/api/v1/purchases/:id/cancel` | `purchase.cancel` | Cancel PO with cancellation reason (`DRAFT/SUBMITTED/APPROVED -> CANCELLED`) |

---

## 5. Security & RBAC Matrix

| Role | Permissions |
| :--- | :--- |
| `OWNER`, `SUPER_ADMIN`, `ADMIN` | `purchase.create`, `purchase.read`, `purchase.update`, `purchase.submit`, `purchase.approve`, `purchase.cancel` |
| `BRANCH_MANAGER` | `purchase.create`, `purchase.read`, `purchase.update`, `purchase.submit`, `purchase.approve`, `purchase.cancel` |
| `ACCOUNTANT` | `purchase.create`, `purchase.read`, `purchase.update`, `purchase.submit` |
| `STAFF`, `CASHIER`, `SALESPERSON`, `KARIGAR_SUPERVISOR` | `purchase.read` |

---

## 6. Automated Test Results & Verification

- **Sprint 5.1 Test Suite**: `test/purchase_order.test.ts` (22/22 Scenarios Passed - 100%)
- **Complete Test Suite**: `npm run test:all` (28/28 Suites Passed - 100%)
- **Postman Collection Verification**: `npm run test:postman` (Passed - Folder 29 Added)
- **TypeScript Production Build**: `npm run build` (Passed Cleanly)
