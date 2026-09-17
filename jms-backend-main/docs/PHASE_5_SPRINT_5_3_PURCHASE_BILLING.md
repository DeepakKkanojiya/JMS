# Phase 5 — Sprint 5.3: Purchase Billing, Costing & Vendor Payable Foundation Subsystem Report

## 1. Objective & Scope

Sprint 5.3 establishes the enterprise **Purchase Billing, Costing & Vendor Payable Foundation** for the Jewellery Management System (JMS) backend.

### Scope Boundaries:
- **Included**: Purchase Bill model (`PurchaseBill`), Purchase Bill Item model (`PurchaseBillItem`), sequential bill numbering (`PB-YYYYMMDD-XXXX`), DRAFT lifecycle, SUBMITTED & APPROVED status workflows, CANCELLED status workflows with mandatory cancellation reasons, authoritative server-side Decimal price/tax calculations for jewellery costing, billable quantity engine preventing over-billing against physical receipts, dynamic database-driven RBAC permissions (`purchase_bill.*`), Swagger OpenAPI 3.0 docs, Postman collection folder 31, and automated integration test suite.
- **Explicitly Excluded**: Frontend UI (to be implemented after all Phase 5 backend sprints are complete), payment processing/gateways, bank transfers, cheque processing, vendor payment reversals, vendor payment reconciliation (reserved for Sprint 5.4+).

---

## 2. Procurement & Billing Flow Architecture

```
PURCHASE ORDER (PO-YYYYMMDD-XXXX)
      ↓
PHYSICAL RECEIVING (PR-YYYYMMDD-XXXX)
      ↓
PURCHASE COSTING (Metal Value + Making Charges - Discount + GST Tax)
      ↓
VENDOR BILL / PURCHASE INVOICE (PB-YYYYMMDD-XXXX)
      ↓
AMOUNT PAYABLE (Grand Total = Subtotal + Tax - Discount)
      ↓
VENDOR OUTSTANDING (Outstanding Amount = Grand Total - Total Paid)
```

---

## 3. Database Schema Design

### Added Enum: `PurchaseBillStatus` (Public Schema)
```prisma
enum PurchaseBillStatus {
  DRAFT
  SUBMITTED
  APPROVED
  PARTIALLY_PAID
  PAID
  CANCELLED

  @@map("purchase_bill_status")
  @@schema("public")
}
```

### Added Models: `PurchaseBill` & `PurchaseBillItem`
```prisma
model PurchaseBill {
  id                 String             @id @default(uuid()) @db.Uuid
  billNumber         String             @unique @map("bill_number")
  purchaseOrderId    String             @map("purchase_order_id") @db.Uuid
  purchaseOrder      PurchaseOrder      @relation(fields: [purchaseOrderId], references: [id], onDelete: Restrict)
  vendorId           String             @map("vendor_id") @db.Uuid
  vendor             Vendor             @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  branchId           String             @map("branch_id") @db.Uuid
  branch             Branch             @relation(fields: [branchId], references: [id], onDelete: Restrict)
  status             PurchaseBillStatus @default(DRAFT)
  billDate           DateTime           @default(now()) @map("bill_date") @db.Timestamptz
  dueDate            DateTime?          @map("due_date") @db.Timestamptz
  subtotal           Decimal            @default(0.00) @map("subtotal") @db.Decimal(12, 2)
  discountAmount     Decimal            @default(0.00) @map("discount_amount") @db.Decimal(12, 2)
  taxAmount          Decimal            @default(0.00) @map("tax_amount") @db.Decimal(12, 2)
  grandTotal         Decimal            @default(0.00) @map("grand_total") @db.Decimal(12, 2)
  totalPaid          Decimal            @default(0.00) @map("total_paid") @db.Decimal(12, 2)
  outstandingAmount  Decimal            @default(0.00) @map("outstanding_amount") @db.Decimal(12, 2)
  notes              String?
  createdBy          String?            @map("created_by") @db.Uuid
  updatedBy          String?            @map("updated_by") @db.Uuid
  submittedBy        String?            @map("submitted_by") @db.Uuid
  submittedAt        DateTime?          @map("submitted_at") @db.Timestamptz
  approvedBy         String?            @map("approved_by") @db.Uuid
  approvedAt         DateTime?          @map("approved_at") @db.Timestamptz
  cancelledBy        String?            @map("cancelled_by") @db.Uuid
  cancelledAt        DateTime?          @map("cancelled_at") @db.Timestamptz
  cancellationReason String?            @map("cancellation_reason")
  createdAt          DateTime           @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime           @updatedAt @map("updated_at") @db.Timestamptz

  items PurchaseBillItem[]

  @@index([purchaseOrderId])
  @@index([vendorId])
  @@index([branchId])
  @@index([status])
  @@index([billDate])
  @@index([billNumber])
  @@map("purchase_bills")
  @@schema("public")
}

model PurchaseBillItem {
  id                    String               @id @default(uuid()) @db.Uuid
  purchaseBillId        String               @map("purchase_bill_id") @db.Uuid
  purchaseBill          PurchaseBill         @relation(fields: [purchaseBillId], references: [id], onDelete: Cascade)
  purchaseOrderItemId   String?              @map("purchase_order_item_id") @db.Uuid
  purchaseOrderItem     PurchaseOrderItem?   @relation(fields: [purchaseOrderItemId], references: [id], onDelete: SetNull)
  purchaseReceiptItemId String?              @map("purchase_receipt_item_id") @db.Uuid
  purchaseReceiptItem   PurchaseReceiptItem? @relation(fields: [purchaseReceiptItemId], references: [id], onDelete: SetNull)
  inventoryItemId       String?              @map("inventory_item_id") @db.Uuid
  inventoryItem         InventoryItem?       @relation(fields: [inventoryItemId], references: [id], onDelete: SetNull)
  itemName              String               @map("item_name")
  description           String?
  quantity              Int                  @default(1)
  grossWeight           Decimal              @default(0.000) @map("gross_weight") @db.Decimal(12, 3)
  stoneWeight           Decimal              @default(0.000) @map("stone_weight") @db.Decimal(12, 3)
  netWeight             Decimal              @default(0.000) @map("net_weight") @db.Decimal(12, 3)
  purchaseRate          Decimal              @default(0.00) @map("purchase_rate") @db.Decimal(12, 2)
  metalValue            Decimal              @default(0.00) @map("metal_value") @db.Decimal(12, 2)
  makingCharges         Decimal              @default(0.00) @map("making_charges") @db.Decimal(12, 2)
  discountAmount        Decimal              @default(0.00) @map("discount_amount") @db.Decimal(12, 2)
  taxableAmount         Decimal              @default(0.00) @map("taxable_amount") @db.Decimal(12, 2)
  taxRate               Decimal              @default(0.00) @map("tax_rate") @db.Decimal(5, 2)
  taxAmount             Decimal              @default(0.00) @map("tax_amount") @db.Decimal(12, 2)
  lineTotal             Decimal              @default(0.00) @map("line_total") @db.Decimal(12, 2)
  createdAt             DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime             @updatedAt @map("updated_at") @db.Timestamptz

  @@index([purchaseBillId])
  @@index([purchaseOrderItemId])
  @@index([purchaseReceiptItemId])
  @@index([inventoryItemId])
  @@map("purchase_bill_items")
  @@schema("public")
}
```

---

## 4. Business Rules & Financial Calculation Engine

### Jewellery Costing Formulas:
1. `Metal Value = Net Weight × Purchase Rate`
2. `Taxable Amount = Metal Value + Making Charges - Line Discount`
3. `Tax Amount = Taxable Amount × (Tax Rate / 100)`
4. `Line Total = Taxable Amount + Tax Amount`
5. `Subtotal = SUM(Taxable Amount)`
6. `Header Tax Amount = SUM(Line Tax Amount)`
7. `Grand Total = Subtotal + Header Tax Amount - Header Discount`
8. `Outstanding Amount = Grand Total - Total Paid`

### Over-Billing Protection & Billable Quantity Engine:
```
remainingBillableQuantity = receivedQuantity - previouslyBilledQuantity
```
- A Purchase Bill can only bill physical quantities that have been received.
- If requested billing `quantity > remainingBillableQuantity`, the service throws `409 Conflict`.
- Uniqueness protection ensures the same physical `inventoryItemId` cannot be included in multiple non-cancelled purchase bills simultaneously.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description | Access Permission |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/purchase-bills` | Create a new DRAFT Purchase Bill | `purchase_bill.create` |
| `GET` | `/api/v1/purchase-bills` | List paginated purchase bills with search & filters | `purchase_bill.read` |
| `GET` | `/api/v1/purchase-bills/:id` | Get complete purchase bill details | `purchase_bill.read` |
| `PUT` | `/api/v1/purchase-bills/:id` | Update DRAFT purchase bill | `purchase_bill.update` |
| `POST` | `/api/v1/purchase-bills/:id/submit` | Transition bill DRAFT → SUBMITTED | `purchase_bill.submit` |
| `POST` | `/api/v1/purchase-bills/:id/approve` | Transition bill SUBMITTED → APPROVED | `purchase_bill.approve` |
| `POST` | `/api/v1/purchase-bills/:id/cancel` | Cancel DRAFT or SUBMITTED bill with reason | `purchase_bill.cancel` |
| `GET` | `/api/v1/purchases/:id/bills` | Get purchase bills for a Purchase Order | `purchase_bill.read` |
| `GET` | `/api/v1/vendors/:id/purchase-bills` | Get purchase bills for a Vendor | `purchase_bill.read` |
| `GET` | `/api/v1/purchase-bills/:id/summary` | Get financial summary of purchase bill | `purchase_bill.read` |

---

## 6. RBAC Matrix

| Role | Permissions Assigned |
| :--- | :--- |
| `OWNER`, `SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `ACCOUNTANT` | `purchase_bill.create`, `purchase_bill.read`, `purchase_bill.update`, `purchase_bill.submit`, `purchase_bill.approve`, `purchase_bill.cancel` |
| `STAFF`, `SALESPERSON`, `CASHIER`, `KARIGAR_SUPERVISOR` | `purchase_bill.read` |

---

## 7. Status Statement

**Phase 5 Sprint 5.3 Backend is COMPLETE. Frontend has NOT been implemented.**
