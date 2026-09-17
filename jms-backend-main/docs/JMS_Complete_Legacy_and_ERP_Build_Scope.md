# JMS — Jewellery Business Management System
## Complete Existing Legacy System + Proposed ERP Build Scope

> **Purpose:** This document combines the **existing JMS Legacy Jewellery System business reference** with the **Cognieos Jewellery ERP Proposal** into one implementation master document.
>
> The legacy system defines the real-world business processes that JMS must preserve. The proposal defines the broader target ERP scope, modules, integrations, deliverables, and 45-day delivery plan.
>
> **Core principle:** JMS should modernize and normalize the business processes without copying the legacy database or UI screen-by-screen.

---

# 1. Executive Understanding

JMS is intended to become the **new technical system of record** for the jewellery business.

The existing legacy system is the **business reference system**. It contains real-world workflows around customers, products, physical stock, billing, payments, gold exchange, purchasing, repairs, accounting, reports, GST documents, day closing, financial years, and Girvi/pawning.

The Cognieos proposal expands this target into a modern cloud-enabled Jewellery ERP covering:

- Sales & POS Billing
- RFID Inventory Management
- Staff Management
- Customer CRM
- Advanced Girvi Management
- Sell on Approval
- Repair Management
- Accounting
- Analytics Dashboard
- Owner Mobile App
- Multi-branch operations
- RFID hardware integration
- Security and audit controls
- Cloud deployment

The proposed system must therefore be understood as:

```text
Existing Legacy Business Processes
              +
Proposed ERP Functional Scope
              +
JMS Modern Technical Architecture
              ↓
     Complete JMS System of Record
```

---

# 2. Source Documents

## Source A — Existing Legacy JMS Business Reference

The existing/legacy jewellery software is the business reference system for JMS.

Its purpose is to preserve real-world jewellery business processes while improving:

- Database normalization
- Identifiers and keys
- Auditability
- Financial correctness
- Inventory traceability
- Multi-branch support
- Permissions / RBAC
- Historical data preservation
- Reporting capability
- API architecture
- ACID transaction safety

## Source B — Jewellery ERP Proposal

The proposal is for a **Jewellery Business Management System (ERP)** prepared for Mr. TanishK by Cognieos Technology Pvt. Ltd.

Proposal details:

- Proposal version: 2.0
- Proposal date: 11 July 2026
- Validity: 30 days
- Proposed project duration: 45 days

The proposal describes a modern cloud-enabled jewellery ERP intended to address limitations in the existing desktop-based system.

---

# 3. Legacy System — Existing Business Scope

The existing legacy system is a jewellery ERP/POS-style business system covering:

- Customer management
- Vendor management
- Employee/staff management
- Branch/showroom operations
- Jewellery catalogue
- Product/design management
- Physical inventory/stock
- Barcode/tag-based stock
- Sales/POS billing
- Payments
- Old Gold / Gold Exchange
- Purchase Orders
- Stock receiving
- Returns and refunds
- Repair operations
- Karigar/job work
- Advance handling
- Rate booking
- Accounting/ledger-related operations
- Cash Book
- Gold/Silver Books
- Reports
- GST invoices and receipts
- Barcode/QR functionality
- Day closing
- Financial-year behavior
- Girvi / gold pawning

The proposal additionally identifies gaps such as RFID, modern POS, cloud access, mobile monitoring, advanced Girvi, Sell on Approval, analytics, CRM/WhatsApp, and multi-branch capabilities.

---

# 4. Business Modernization Philosophy

The correct JMS transformation is:

```text
Legacy Business Process
        ↓
Understand Business Rule
        ↓
Normalize Domain
        ↓
Design JMS Entity
        ↓
Implement Safely
        ↓
Preserve Historical Truth
        ↓
Expose through APIs
        ↓
Web ERP / Mobile App / Reports
```

Do NOT do:

```text
Legacy Screen
      ↓
Legacy Table
      ↓
Copy Into JMS
```

The legacy system is the **business reference**, not the technical database schema to copy.

---

# 5. Complete Target ERP Scope

The combined target system contains these major domains:

1. Dashboard
2. Master Data / Maintain
3. Feeding / Operational Entry
4. User & Staff Management
5. Customer Management / CRM
6. Product Catalogue
7. Physical Inventory
8. Barcode / QR / RFID
9. Stock Movement & Audit
10. POS / Sales
11. Payments
12. Sales Returns / Refunds
13. Old Gold / Gold Exchange
14. Purchase Orders
15. Purchase Receiving / GRN
16. Vendor Management
17. Cash & Financial Management
18. Accounting / Ledger
19. Metal Accounting
20. Girvi / Pawning
21. Sell on Approval
22. Repair Management
23. Karigar / Job Work
24. Reports
25. CRM / Customer Engagement
26. Owner Mobile App
27. Multi-Branch Management
28. RFID Hardware Integration
29. Security / Audit / RBAC
30. Financial Year & Document Numbering
31. Utilities / Backup / Export
32. Deployment / Migration / Training

---

# 6. Catalogue / Product Hierarchy

The target JMS hierarchy is:

```text
Company
   ↓
ProductCategory
   │
   ├── Gold Jewellery
   ├── Silver Jewellery
   ├── Diamond Jewellery
   ├── Platinum Jewellery
   └── Gemstone Jewellery
   ↓
ProductSubCategory
   │
   ├── Ring
   ├── Chain
   ├── Necklace
   ├── Bracelet
   ├── Earrings
   └── Pendant
   ↓
Product
   │
   └── Example: 22K Gold Classic Ring
   ↓
InventoryItem
   │
   └── Actual physical jewellery piece
       ├── Barcode
       ├── QR
       └── RFID
```

## Important Distinction

### Category

High-level classification.

### Subcategory

Jewellery type.

### Product

Catalogue/design/SKU.

### InventoryItem

Actual physical jewellery piece.

Example:

```text
Category       → Gold Jewellery
SubCategory    → Ring
Product        → 22K Gold Classic Ring
InventoryItem  → ITM-2026-00001
Barcode        → BC001
```

The proposal also requires item groups, item setup, diamond/stone setup, stamps, tagging, and inventory tracking.

---

# 7. Company / Branch Architecture

JMS must support company-level and branch-level business operations.

```text
Company
   |
   ├── Branch
   │     ├── Employees
   │     ├── Inventory
   │     ├── Sales
   │     ├── Purchases
   │     ├── Customers/transactions
   │     ├── Cash
   │     └── Reports
   |
   ├── Customers
   ├── Products
   ├── Financial Years
   └── Document Series
```

The proposal requires:

- Multiple Stores
- Central Inventory
- Branch Transfer
- Branch Reports
- Branch Permissions

The legacy design requires branch history to remain traceable rather than silently changing ownership.

---

# 8. Customer Management

Customers are company-level masters because a customer may visit multiple branches.

```text
Company
   ↓
Customer
   ├── CustomerAddress
   ├── CustomerDocument
   └── Transactions
```

Technical identity and business code remain separate:

```text
id            = UUID
customerCode  = CUST-000001
```

## Required Customer Features

From the combined legacy and proposal scope:

- Customer registration
- KYC
- Aadhaar/PAN
- Customer documents
- Customer addresses
- Purchase history
- Customer ledger
- Loyalty points
- Gold Saving Scheme
- Birthday reminder
- Customer notes
- WhatsApp integration
- SMS/customer campaigns
- Feedback
- Customer statements

---

# 9. Employee / Staff Management

Employee identity, branch assignment, department, designation, and IAM role are separate concepts.

```text
Employee
   ├── employeeCode
   └── EmployeeBranchAssignment
          ├── Branch
          ├── Department
          ├── Designation
          ├── effectiveFrom
          └── effectiveTo
              ↓
             User
              ↓
           IAM Role
```

An employee changing branch or designation must retain the same employee ID.

## Roles in Proposal

- Owner
- Manager
- Sales Executive
- Cashier
- Inventory Manager
- Accountant
- Karigar
- Receptionist

## Additional IAM Roles

- OWNER
- ADMIN
- MANAGER
- CASHIER
- ACCOUNTANT
- SALES_EXECUTIVE
- INVENTORY_MANAGER

## Departments

- SALES
- PURCHASE
- INVENTORY
- ACCOUNTS
- REPAIR
- MANAGEMENT

## Designations

Examples:

- SALES_EXECUTIVE
- CASHIER
- ACCOUNTANT
- STORE_MANAGER
- PURCHASE_MANAGER

Role, department and designation must NOT be merged.

## Staff Features

- Login
- Attendance
- Leave
- Salary
- Commission
- Daily target
- Activity log
- Role permissions
- Monthly target
- Staff list
- Staff category

---

# 10. IAM / Role-Based Access Control

The JMS IAM foundation is:

```text
User
  ↓
Role
  ↓
RolePermission
  ↓
Permission
```

Role controls system permissions.

Department describes organizational placement.

Designation describes the employee's position.

This separation is required for correct authorization and future branch changes.

---

# 11. Physical Inventory

The system must distinguish catalogue products from actual physical stock.

```text
Product
   ↓
InventoryItem
```

## InventoryItem Data

An InventoryItem may contain:

- Item code
- Gross weight
- Stone weight
- Net weight
- Fine weight
- Purity
- Metal type
- Branch
- Status
- Barcode
- QR code
- RFID
- Vendor
- Purchase cost
- Making charges
- Selling price
- Current location
- Counter
- Locker
- Tray
- Images

## Inventory Status

The proposal specifies:

- Available
- Sold
- Reserved
- Repair
- Approval
- Girvi
- Melted

The legacy business also requires stock traceability through movement history.

---

# 12. Inventory Audit / Stock Movement

Stock status changes must not be silent mutations.

```text
InventoryItem
     ↓
Status Change
     +
StockMovement
     ├── movement type
     ├── actor
     ├── timestamp
     ├── reference type
     └── reference ID
```

## Movement Types

Examples:

- SALE
- SALE_RETURN
- TRANSFER_OUT
- TRANSFER_IN
- PURCHASE_RECEIPT
- ADJUSTMENT
- REPAIR_OUT
- REPAIR_IN

The movement history is required for auditability and inventory traceability.

---

# 13. Barcode / QR / RFID

Barcode, QR and RFID identify physical stock. They are NOT database primary keys.

```text
InventoryItem
   ↓
InventoryTag
   ├── barcode
   ├── qrCode
   ├── rfidEpc
   ├── isActive
   ├── assignedAt
   └── deactivatedAt
```

## Rules

- Historical inactive tags may be retained.
- Only one active tag should exist for an item.
- RFID/tag changes must be auditable.
- Physical stock identity remains tied to InventoryItem.

## Proposal Hardware

- RFID Printer
- RFID Reader
- Handheld RFID Scanner
- RFID Gate
- Barcode Scanner

---

# 14. Dashboard

The proposal requires a main dashboard covering:

- Wholesale
- Retail POS
- Cashier / Gold deposit
- Sale on Approval
- Girvi
- Employee Attendance / HRM
- Gold Inventory
- Silver Inventory
- Diamond Inventory
- Business Graphs
- Monthly Sales Trends
- UPI Collections
- Utilities

## Wholesale Dashboard Quick Actions

- Sale Voucher
- Purchase Voucher
- Sale Return
- Purchase Return
- Today's Sale
- Daily Transaction
- Daily Party Balance
- Pending Orders
- Repairs
- Karigars

---

# 15. Master Data / Maintain

Required master functionality:

## Accounts

- Add
- Delete
- Modify
- List
- Party rate list

## Sub Accounts

- Add/manage sub accounts

## Account Groups

- Account groups
- Account merge
- Location

## Items

- Add
- Delete
- Modify
- List

## Item Groups

- Item grouping

## Stamp

- Add
- Delete
- Modify
- List

## Diamond & Stone Setup

- Clarity
- Shape
- Size
- Lab
- Colour

## User / Password / Rights

- Add users
- Delete users
- Modify users
- List users
- Rights setup
- Security path

---

# 16. Feeding / Operational Entry

Required functions:

- Daily Bhav
- Box Tag In
- Box Tag Out
- To Do Task
- Workbook
- Order Register

The legacy system also identifies:

- Advance handling
- Rate booking

These must be preserved as business requirements and analyzed for their exact workflow.

---

# 17. Sales / POS

Confirmed legacy capabilities:

- Item scanning
- Dynamic making charges
- Wastage
- CGST/SGST
- IGST where applicable
- Discounts
- Multiple payment methods
- Gold exchange
- Invoice generation
- Returns/refunds

The proposal expands this to:

- Barcode Billing
- RFID Billing
- Gold Rate Integration
- Making Charges
- Stone Charges
- Exchange
- EMI
- Advance Discount Approval
- Split Payment
- GST
- WhatsApp Invoice
- Email Invoice
- Thermal Printer Support

## Payment Modes

- Cash
- UPI
- POS
- Credit Card
- Debit Card
- Net Banking
- Wallet

---

# 18. POS Target Workflow

```text
Customer
   ↓
Select / Scan Jewellery
   ↓
Barcode / RFID
   ↓
Gold Rate
   ↓
Making Charges
   ↓
Wastage / Stone Charges
   ↓
Exchange / EMI / Discount
   ↓
GST
   ↓
Split / Multiple Payment
   ↓
Invoice
   ├── Thermal Printer
   ├── WhatsApp
   └── Email
   ↓
Stock Updated
```

---

# 19. Historical Invoice Truth

Confirmed invoices must remain historically correct even when master data changes later.

## Header Snapshots

Examples:

- Company name
- Branch name
- Branch address
- Branch GST number
- Customer name
- Customer address
- Customer GST number
- Customer PAN

## Item Snapshots

Examples:

- Product name
- SKU
- Metal type
- Purity
- Gross weight
- Stone weight
- Net weight
- Less weight
- Fine weight
- Rate per gram
- Making charge information
- Tax rate

After confirmation:

```text
CONFIRMED
    ↓
Snapshots become immutable
```

Corrections should use business operations such as:

- CANCEL
- RETURN
- CREDIT NOTE
- REVERSAL

Do not mutate the historical invoice to reflect later master-data changes.

---

# 20. Old Gold / Gold Exchange

The legacy system supports Old Gold / Gold Exchange.

Typical workflow:

```text
Customer Old Gold
       ↓
Weight / Purity Evaluation
       ↓
Deduction Factors
       ↓
Fine Weight / Value
       ↓
Customer Gold Exchange
       ↓
Invoice Credit
```

Money accounting and metal accounting are separate dimensions.

## Important Values

- Gross weight
- Stone weight
- Net weight
- Purity / Tunch
- Fine weight
- Metal rate
- Metal value

Core calculation:

```text
Net Weight = Gross Weight - Stone Weight

Fine Weight =
Net Weight × (Purity / 100)
```

---

# 21. Payments

Payments are transactional records.

```text
SalesInvoice
   ├── Grand Total
   ├── Exchange Credit
   ├── Total Paid
   └── Outstanding
          ↓
     SalesPayment history
```

Payment transactions must be concurrency-safe.

The database transaction boundary must prevent simultaneous payments from corrupting outstanding balances.

---

# 22. Sales Returns / Refunds

Target workflow:

```text
SalesInvoice
     ↓
SalesReturn
     ↓
SalesReturnItem
     ↓
Inventory restoration
     ↓
StockMovement
     ↓
SalesRefund
```

Inventory restoration must create corresponding audit history.

---

# 23. Purchase Management

The combined system must support:

- Vendors
- Purchase Orders
- Purchase Bills
- Vendor Ledger
- Stock Receipt
- Due Payments

## Purchase Order

```text
Vendor
   ↓
PurchaseOrder
   ↓
PurchaseOrderItem
```

## Lifecycle

```text
DRAFT
  ↓
SUBMITTED
  ↓
APPROVED
  ↓
RECEIVING
  ↓
COMPLETED

or

CANCELLED
```

---

# 24. Stock Receiving / GRN

The legacy system supports tag-wise purchase receiving.

Target JMS flow:

```text
PurchaseOrder
     ↓
PurchaseReceipt
     ↓
PurchaseReceiptItem
     ↓
Multiple physical InventoryItems
     ↓
InventoryTags
     ↓
StockMovement
```

One receipt item can create many physical inventory items:

```text
PurchaseReceiptItem
   ├── InventoryItem 1
   ├── InventoryItem 2
   ├── InventoryItem 3
   └── ...
```

This is an important future implementation phase because physical stock must be created and traceable at the InventoryItem level.

---

# 25. Branch-to-Branch Transfer

Stock transfers must preserve the complete workflow:

```text
REQUESTED
   ↓
APPROVED
   ↓
DISPATCHED
   ↓
RECEIVED
```

Record:

- fromBranch
- toBranch
- requestedBy
- approvedBy
- dispatchedBy
- receivedBy
- timestamps
- stock movements

Do NOT simply change:

```text
InventoryItem.branchId
```

without creating movement history.

---

# 26. Cash & Financial Management

The proposal requires daily financial closing.

## Track

- Cash
- UPI
- POS
- Bank expenses
- Opening balance
- Closing balance
- Cashier closing
- Daily cash difference
- Bank deposit
- Expenses

The legacy system also includes:

- Cash Book
- Day Closing
- Financial-year behavior

---

# 27. Accounting / Ledger

The legacy system has accounting-related capabilities not fully represented in the current Phase 1–4 JMS implementation.

Required/future accounting domains:

- Accounting Journals
- Ledger Accounts
- Customer Ledger
- Vendor Ledger
- Cash Book
- Gold Book
- Silver Book
- Day Closing
- Income
- Expense
- Cash Book
- Bank Book
- Journal
- Ledger
- GST
- Trial Balance
- Profit & Loss
- Balance Sheet

These should be implemented as a dedicated accounting phase after detailed business analysis.

---

# 28. Metal Accounting

Metal accounting must be treated separately from money accounting.

Important metal values:

- Gross Weight
- Stone Weight
- Net Weight
- Purity / Tunch
- Fine Weight
- Metal Type
- Metal Rate
- Metal Value

A future Metal Ledger can track:

- Metal debits
- Metal credits
- Fine-weight balances
- Metal-wise balances

Do not create speculative accounting tables until the actual legacy metal workflow is analyzed.

---

# 29. Girvi / Pawning

Girvi is a major legacy domain involving gold pledged against loans.

The proposal requires **Complete Girvi Management**, including both Self Girvi and Third-Party Girvi.

## A. Self Girvi

The jewellery shop finances the customer directly.

Required features:

- Customer KYC
- Jewellery images
- RFID
- Loan amount
- Interest
- Renewal
- Partial payment
- Interest collection
- Loan closure
- Jewellery release
- Due reminder
- Penalty calculation
- Ledger

## Girvi Dashboard

- Active loans
- Interest due
- Released jewellery
- Overdue loans
- Total outstanding

## B. Third-Party Girvi

The shop processes loans through partner finance companies.

Required:

- Partner selection
- Finance company master
- Commission management
- Partner reference number
- Loan status
- Settlement tracking
- Commission report
- Partner ledger
- Jewellery tracking
- Document upload

## Reports

- Partner-wise loans
- Commission earned
- Pending settlement
- Monthly business

## Legacy Future Domain

Potential entities identified in the legacy analysis:

- GirviPledge
- PledgedItem
- Loan
- Interest
- Payment
- Redemption
- Default
- Auction

Do not create speculative Girvi tables beyond confirmed business requirements until the full legacy workflow is analyzed.

---

# 30. Sell on Approval

The proposal requires:

```text
Issue Jewellery
      ↓
Approval Slip
      ↓
Customer Takes Jewellery
      ↓
Return OR Purchase
```

Track:

- Customer
- Jewellery
- RFID
- Deposit
- Issue date
- Due date
- Return status
- Salesperson

Alerts:

- Approval expiry
- Pending return

---

# 31. Repair Management

The legacy system includes repair operations and Karigar/job work.

The proposal requires:

- Repair Entry
- Before Images
- After Images
- RFID
- Repair Charges
- Karigar Assignment
- Delivery Date
- Customer Notification

Potential future domains:

```text
RepairOrder
RepairJob
Karigar
JobWork
RepairCharges
RepairInventoryMovement
```

Repair should remain a separate domain rather than being forced into Sales or Inventory.

The exact final schema must be based on the actual legacy workflow.

---

# 32. Karigar / Job Work

The legacy system explicitly references Karigar/job-work operations.

The system should be capable of tracking:

- Karigar
- Assigned work
- Jewellery/job
- Issue movement
- Receive movement
- Charges
- Delivery
- Status
- History

The proposal also includes Karigar-related reports and dashboard visibility.

---

# 33. CRM / Customer Engagement

The combined target scope includes:

- Customer registration
- KYC
- Purchase history
- Customer ledger
- Loyalty points
- Gold Saving Scheme
- Birthday reminders
- Customer notes
- WhatsApp integration
- WhatsApp marketing
- SMS
- Festival campaigns
- Birthday wishes
- Feedback

Customer engagement must remain connected to the customer master without corrupting transactional history.

---

# 34. Owner Mobile App

The proposal requires an Android/iOS owner application using React Native.

Owner monitoring:

- Sales
- Stock
- Girvi
- Staff
- Reports
- Approval
- Repairs
- Notifications

The mobile application should consume the same REST APIs as the web system rather than creating a separate business/data layer.

---

# 35. Multi-Branch Management

Required:

- Multiple stores
- Central inventory
- Branch transfers
- Branch reports
- Branch permissions

The architecture must preserve:

- Branch ownership
- Transfer history
- Actor history
- Transaction branch
- Financial reporting by branch
- User access by branch

---

# 36. RFID Hardware Integration

Supported hardware listed in the proposal:

- RFID Printer
- RFID Reader
- Handheld RFID Scanner
- RFID Gate
- Barcode Scanner

The final implementation requires exact hardware models/vendors and communication protocols before integration work begins.

---

# 37. Reports

Legacy reports are business requirements.

For every report, capture:

- Report name
- Filters
- Columns
- Grouping
- Totals
- Calculations
- Source data
- Required API
- Required frontend screen

## Proposal Report Categories

- Sales
- Purchase
- Inventory
- Girvi
- Approval
- Repair
- Customer
- Staff
- Commission
- Cash Flow
- Profit
- GST
- Daily Closing
- Monthly Closing
- Yearly Reports

## Legacy Report Domains

Also preserve requirements around:

- Ledger
- Outstanding
- Karigar
- Daily Books
- Cash Book
- Gold Book
- Silver Book
- Sale Register
- Purchase Register
- Customer statements
- Stock reports

Reports may expose hidden business rules and therefore should be analyzed before implementation.

---

# 38. Legacy Print Documents

Important documents include:

- GST invoices
- Receipts
- Payment vouchers
- Purchase documents
- Stock reports
- Barcode labels
- Return documents
- Exchange documents
- Customer statements

Historical printed information must remain reproducible where required.

This means invoice/document snapshots and document configuration must be designed as part of the transactional architecture.

---

# 39. Voucher Management

Required voucher types:

- Receipt
- Payment
- Sale
- Purchase
- Sale Return
- Purchase Return
- Repairing — Issue/Receive
- Advance
- Tag Generation
- Credit Note — Issue/Receive

---

# 40. Tagging

Required:

- Item-wise stock
- Tag printing
- Tag modification
- Search tagged stock
- Tag history

Tag identity must remain separate from the database primary key.

---

# 41. Utilities

The proposal requires:

- Backup / Restore
- Close Year / Refresh
- Freeze Rate
- Day Close
- Hisab Final
- Change Year
- MCX Rates — Day-wise
- Voucher Setup
- Interest Calculator
- Report Save
- Report Verify
- Tally Export
- Web Export
- Login List / User Login History
- Mobile Transfer
- Staff List
- Staff Category
- Monthly Target

---

# 42. Financial Year & Document Numbering

JMS models:

```text
Company
   ↓
FinancialYear
   ↓
DocumentSeries
```

Technical IDs remain UUIDs.

Business document numbers remain human-readable.

Example:

```text
SalesInvoice.id
= UUID

SalesInvoice.invoiceNumber
= INV-2026-000001
```

Document numbering must be:

- Atomic
- Concurrency-safe
- Financial-year aware
- Branch/company aware where required

---

# 43. Database Design Principles

The JMS database should provide:

- Stable UUID technical IDs
- Separate business codes
- Correct company scoping
- Correct branch scoping
- Normalized catalogue hierarchy
- Physical inventory traceability
- Immutable financial history
- Historical snapshots
- Explicit audit actors
- RBAC
- Referential integrity
- Database constraints
- ACID transaction boundaries
- Concurrency protection
- Financial-year support
- Atomic document numbering

The architecture should remain extensible without creating speculative future-domain tables.

---

# 44. Core Entity Relationship Concept

The combined domain can be understood approximately as:

```text
COMPANY
  |
  ├── BRANCH
  |     |
  |     ├── EMPLOYEE
  |     ├── INVENTORY
  |     ├── SALES
  |     ├── PURCHASES
  |     └── CASH / REPORTS
  |
  ├── CUSTOMER
  |     ├── ADDRESS
  |     ├── DOCUMENT
  |     ├── SALES
  |     ├── PAYMENTS
  |     ├── GOLD EXCHANGE
  |     ├── GIRVI
  |     └── CRM
  |
  ├── VENDOR
  |     └── PURCHASES
  |
  ├── PRODUCT CATEGORY
  |     └── PRODUCT SUBCATEGORY
  |           └── PRODUCT
  |                 └── INVENTORY ITEM
  |                       ├── TAG
  |                       ├── STOCK MOVEMENT
  |                       ├── SALE
  |                       ├── REPAIR
  |                       ├── APPROVAL
  |                       └── GIRVI
  |
  ├── FINANCIAL YEAR
  |     └── DOCUMENT SERIES
  |
  └── USERS
        └── ROLES
              └── PERMISSIONS
```

---

# 45. Suggested End-to-End Business Flow

## Purchase → Stock

```text
Vendor
  ↓
Purchase Order
  ↓
Approval
  ↓
Purchase Receipt / GRN
  ↓
Physical InventoryItem Creation
  ↓
Barcode / QR / RFID Assignment
  ↓
Stock Movement
  ↓
Available Inventory
```

## Stock → Sale

```text
InventoryItem
  ↓
Barcode / RFID Scan
  ↓
POS
  ↓
Pricing / Gold Rate / Making / Stone / Wastage
  ↓
Exchange / Discount
  ↓
GST
  ↓
Payment
  ↓
Confirmed Invoice
  ↓
Historical Snapshot
  ↓
Inventory SOLD
  ↓
Stock Movement
```

## Sale Return

```text
Confirmed Invoice
  ↓
Sales Return
  ↓
Return Item
  ↓
Inventory Restoration
  ↓
Stock Movement
  ↓
Refund / Credit
```

## Branch Transfer

```text
Transfer Request
  ↓
Approval
  ↓
Dispatch
  ↓
TRANSFER_OUT
  ↓
Receive
  ↓
TRANSFER_IN
  ↓
New Branch Availability
```

## Repair

```text
Customer
  ↓
Repair Entry
  ↓
Inventory / RFID
  ↓
Karigar Assignment
  ↓
Repair Work
  ↓
Repair Charges
  ↓
Receive
  ↓
Customer Notification
  ↓
Delivery
```

## Girvi

```text
Customer
  ↓
KYC
  ↓
Pledge Jewellery
  ↓
RFID / Inventory Tracking
  ↓
Loan
  ↓
Interest / Payment / Renewal
  ↓
Closure
  ↓
Jewellery Release
```

---

# 46. Current JMS Foundation vs Complete Target Scope

## Current JMS Foundation / Implemented Areas

The current JMS foundation identified in the legacy analysis includes:

- Company
- Branch
- Employee
- IAM / RBAC
- Customer
- Vendor
- ProductCategory
- ProductSubCategory
- Product
- Inventory
- Inventory Tags
- Stock Movement
- Sales / POS
- Sales Payments
- Gold Exchange
- Sales Returns
- Refunds
- Purchase Orders
- Financial Year
- Document Series

## Identified Gaps / Future Phases

### Phase 5

- Stock Receiving / GRN
- Physical stock creation

### Phase 6

- Vendor Settlement

### Phase 7

- Repair Management

### Phase 8

- Financial Accounting

### Future

- Metal Ledger
- Girvi / Pawning
- Advanced Job Work
- Other confirmed legacy requirements

## Proposal Scope That Must Also Be Accounted For

The broader proposal additionally requires:

- Advanced Dashboard
- Staff/HRM
- RFID hardware
- Modern POS enhancements
- Sell on Approval
- Advanced Self & Third-Party Girvi
- CRM/WhatsApp/SMS
- Owner Mobile App
- Multi-branch management
- Accounting reports
- Analytics
- Security
- Cloud deployment
- User training
- Documentation
- One-year post-go-live support

---

# 47. Technology Stack

The proposal specifies:

## Frontend

- React.js
- Tailwind CSS
- Material UI

## Backend

- Node.js
- Express.js

## Database

The proposal states:

- PostgreSQL — recommended for transactional ERP systems
- OR MongoDB — depending on finalized requirements

The database choice is therefore not finalized by the proposal itself.

For JMS, the architectural requirements strongly emphasize transactional correctness, normalization, referential integrity and ACID safety; the final database decision should be made during architecture review.

## Mobile

- React Native

## Cloud

- AWS
- DigitalOcean

---

# 48. API Architecture

The target architecture should expose REST APIs for:

- Authentication
- Users
- Roles
- Permissions
- Employees
- Branches
- Customers
- Vendors
- Categories
- Subcategories
- Products
- Inventory Items
- Tags
- Stock Movements
- Purchases
- Purchase Receipts
- Sales
- Sales Payments
- Returns
- Refunds
- Gold Exchange
- Repairs
- Karigars
- Girvi
- Approval
- Accounting
- Reports
- CRM
- Notifications
- Financial Years
- Document Series
- Audit Logs

The owner mobile app should consume these APIs.

---

# 49. Transaction Safety Requirements

JMS handles financial and physical inventory transactions, so important operations must be transactional.

Examples:

## Sale

```text
BEGIN TRANSACTION

Validate Inventory
Validate Pricing
Create Invoice
Create Invoice Items
Create Payment Records
Update Inventory
Create Stock Movement
Create Accounting Entries where applicable
Generate Document Number

COMMIT
```

## Purchase Receiving

```text
BEGIN TRANSACTION

Validate Purchase Order
Create Purchase Receipt
Create Physical InventoryItems
Assign Tags
Create Stock Movements
Update Purchase State

COMMIT
```

## Transfer

```text
BEGIN TRANSACTION

Validate Available Stock
Approve/Dispatch
Create TRANSFER_OUT
Create TRANSFER_IN on receipt
Update branch/location

COMMIT
```

Exact accounting transaction boundaries must be finalized during detailed architecture and business-rule analysis.

---

# 50. Concurrency-Sensitive Areas

The system must protect against concurrent operations involving:

- Invoice numbering
- Document numbering
- Inventory sale
- Inventory transfer
- Payment recording
- Outstanding balances
- Purchase receiving
- RFID/tag assignment
- Stock adjustments
- Branch transfers
- Day closing
- Financial-year closing

These operations require database-level transaction safety and appropriate constraints/locking strategies.

---

# 51. Security Requirements

Required:

- Role-Based Access Control
- Audit Logs
- Activity Tracking
- Daily Backup
- User login history
- Permission management
- Optional Two-Factor Authentication

The system must record the actor behind important business operations.

For example:

```text
StockMovement
  ├── actor
  ├── timestamp
  ├── movementType
  └── reference
```

---

# 52. Data Migration

The proposal includes deployment and data migration within the final delivery stage.

The migration strategy should NOT be a direct table-to-table copy.

Correct migration approach:

```text
Legacy Data
    ↓
Data Profiling
    ↓
Business Mapping
    ↓
Normalize
    ↓
Validate
    ↓
Transform IDs / Codes
    ↓
Import Master Data
    ↓
Import Historical Transactions
    ↓
Reconcile
    ↓
UAT
    ↓
Go Live
```

Important migration concerns:

- Customer identity mapping
- Product mapping
- Category/subcategory mapping
- Inventory item mapping
- Barcode/tag mapping
- Branch mapping
- Employee mapping
- Vendor mapping
- Financial-year mapping
- Invoice history
- Payment history
- Stock balances
- Historical documents
- Accounting history
- Gold/silver balances

The exact migration scope must be confirmed with the client.

---

# 53. Requirements That Must Be Clarified Before Development

The sources define a large functional scope, but some implementation/business rules remain unspecified.

## Business Rules

Clarify:

- Jewellery pricing formulas
- Gold-rate calculation
- Making-charge calculation
- Wastage calculation
- Stone-charge calculation
- Exchange valuation
- Discount approval rules
- EMI rules
- GST rules
- Girvi interest rules
- Girvi penalty rules
- Renewal rules
- Partial payment rules
- Loan closure rules
- Sell-on-approval rules
- Commission calculations
- Loyalty point calculations
- Gold Saving Scheme rules
- Advance rules
- Rate booking rules

## Hardware

Need exact:

- RFID vendor
- RFID printer model
- RFID reader model
- RFID gate model
- Handheld scanner model
- Barcode scanner
- Thermal printer

## Third-Party APIs

Need exact provider/API requirements for:

- WhatsApp
- SMS
- Email
- Payment/POS
- Gold/MCX rates
- Tally
- Finance-company integrations

## Accounting

Clarify:

- Chart of accounts
- GST configuration
- Tax rules
- Journal posting rules
- P&L rules
- Balance sheet rules
- Trial balance
- Tally export format
- Gold/Silver accounting rules

## Multi-Branch

Clarify:

- Branch data isolation
- Central inventory ownership
- Inter-branch transfer rules
- Branch permissions
- Cross-branch customer access
- Central reporting

## Security

Clarify:

- Password policy
- Session management
- 2FA
- Backup frequency
- Retention policy
- Audit-log retention
- Recovery procedure

---

# 54. Recommended Development Order

The combined requirements should be implemented in a controlled dependency order:

```text
1. Requirement Gathering
        ↓
2. Legacy Workflow Analysis
        ↓
3. UI/UX
        ↓
4. Database + Architecture
        ↓
5. Authentication + RBAC
        ↓
6. Company + Branch + Financial Year
        ↓
7. Master Data
        ↓
8. Customer + Vendor
        ↓
9. Product Catalogue
        ↓
10. InventoryItem + Tagging
        ↓
11. Stock Movement
        ↓
12. Purchase Order
        ↓
13. Stock Receiving / GRN
        ↓
14. POS / Sales
        ↓
15. Payments + Cash Closing
        ↓
16. Sales Returns / Refunds
        ↓
17. Gold Exchange
        ↓
18. Staff / HRM
        ↓
19. Repair / Karigar
        ↓
20. Sell on Approval
        ↓
21. Girvi
        ↓
22. Accounting
        ↓
23. Metal Ledger
        ↓
24. CRM / WhatsApp / SMS
        ↓
25. Reports / Analytics
        ↓
26. Multi-Branch
        ↓
27. RFID / Hardware
        ↓
28. Owner Mobile App
        ↓
29. Migration
        ↓
30. Testing / UAT
        ↓
31. Deployment
        ↓
32. Training
        ↓
33. Go Live
```

---

# 55. Proposal Timeline

The Cognieos proposal specifies a total project duration of **45 days**.

| Phase | Duration | Timeline |
|---|---:|---|
| Requirement Gathering & System Analysis | 3 days | Day 1–3 |
| UI/UX Design & Approval | 5 days | Day 2–6 |
| Database Design & System Architecture | 2 days | Day 4–5 |
| Backend API Development | 15 days | Day 6–20 |
| Frontend Web Development | 18 days | Day 10–27 |
| RFID, POS & Third-Party Integrations | 7 days | Day 21–27 |
| Mobile App — Owner Dashboard | 10 days | Day 25–34 |
| Testing, Bug Fixing & UAT | 7 days | Day 35–41 |
| Deployment, Data Migration & User Training | 4 days | Day 42–45 |

**Total Project Duration: 45 Days**

---

# 56. Proposal Milestones

## Milestone 1 — Day 1–10

- Requirement Analysis
- UI/UX Design
- Database Design
- Project Setup

## Milestone 2 — Day 11–25

- Inventory Management
- Customer Management
- Staff Management
- POS Billing
- Cash & Online Payment Management

## Milestone 3 — Day 26–35

- Girvi Management — Self & Third-Party
- RFID Integration
- Sell on Approval
- Repair Management
- Mobile App

## Milestone 4 — Day 36–45

- Reports & Dashboard
- User Acceptance Testing
- Bug Fixes
- Deployment
- User Training
- Go Live

---

# 57. Final Deliverables from Proposal

The proposal specifies:

- Web ERP
- Owner Mobile App
- REST APIs
- RFID Integration
- Database Setup
- Cloud Deployment
- User Training
- Documentation
- 1 Year Post-Go-Live Support

---

# 58. Final Target System

The complete JMS target should be understood as:

```text
                           JMS ERP
                             |
        ┌────────────────────┼────────────────────┐
        │                    │                    │
     WEB ERP            OWNER MOBILE          REST API
 React + UI             React Native        Node + Express
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                       Database Layer
                             │
       ┌─────────────┬───────┼────────┬─────────────┐
       │             │       │        │             │
   Catalogue      Inventory  POS    Accounting      IAM
       │             │       │        │             │
       │            RFID     │      Metal           │
       │             │       │      Ledger          │
       │             │       │        │             │
       └─────────────┴───────┴────────┴─────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
           Girvi          Repair         CRM
              │              │              │
              └──────────────┼──────────────┘
                             │
                     Multi-Branch
                             │
                  Hardware / Integrations
```

---

# 59. What JMS Must Preserve

The modernization must preserve the business truth of:

- Customer identity
- Customer transaction history
- Product/catalogue hierarchy
- Physical jewellery identity
- Barcode/QR/RFID history
- Stock movement history
- Sales history
- Payment history
- Gold exchange history
- Purchase history
- Returns/refunds
- Repair history
- Karigar/job-work history
- Girvi history
- Branch history
- Employee history
- Financial-year behavior
- Document numbering
- Accounting/ledger history
- GST documents
- Reports
- Day closing
- Historical invoice truth

---

# 60. What JMS Must Improve

Compared with the legacy technical approach, JMS should improve:

### Database

- Normalized schema
- Stable UUID primary keys
- Separate business codes
- Foreign-key integrity
- Proper constraints

### Transactions

- ACID transactions
- Concurrency safety
- Atomic document numbering
- Safe payment recording
- Safe stock operations

### Inventory

- Item-level traceability
- Explicit StockMovement
- RFID lifecycle
- Branch movement history
- Repair/Girvi/Approval status tracking

### Financial Data

- Immutable confirmed invoices
- Historical snapshots
- Explicit reversals/returns/credit notes
- Correct payment history
- Financial-year support

### Security

- RBAC
- Permissions
- Audit logs
- Activity tracking
- User history
- Optional 2FA

### Architecture

- REST APIs
- Web ERP
- Mobile API consumption
- Cloud deployment
- Integration-ready design

---

# 61. Important Boundary: Do Not Overbuild Speculatively

The combined scope is large, but JMS should not create database tables merely because a future feature is mentioned.

Correct approach:

```text
Legacy Requirement Identified
          ↓
Business Workflow Understood
          ↓
Data + Rules Confirmed
          ↓
Domain Designed
          ↓
API Designed
          ↓
UI Designed
          ↓
Implementation
          ↓
Tests + UAT
```

For domains such as:

- Girvi
- Metal Ledger
- Advanced Job Work
- Accounting
- Finance-company settlement

the exact workflow should be confirmed before final schema implementation.

---

# 62. Master Implementation Checklist

## Foundation

- [ ] Company
- [ ] Branch
- [ ] Financial Year
- [ ] Document Series
- [ ] User
- [ ] Role
- [ ] Permission
- [ ] Employee
- [ ] Department
- [ ] Designation

## Catalogue

- [ ] Product Category
- [ ] Product Subcategory
- [ ] Product
- [ ] Item Group
- [ ] Diamond/Stone Setup
- [ ] Stamp

## Customer/Vendor

- [ ] Customer
- [ ] Customer Address
- [ ] Customer Documents
- [ ] Vendor
- [ ] Customer Ledger
- [ ] Vendor Ledger

## Inventory

- [ ] Inventory Item
- [ ] Inventory Tag
- [ ] Barcode
- [ ] QR
- [ ] RFID
- [ ] Stock Movement
- [ ] Location
- [ ] Branch Stock
- [ ] Stock Audit

## Purchase

- [ ] Purchase Order
- [ ] Purchase Order Items
- [ ] Purchase Receipt / GRN
- [ ] Physical Stock Creation
- [ ] Purchase Bill
- [ ] Vendor Settlement
- [ ] Due Payments

## Sales / POS

- [ ] Sales Invoice
- [ ] Sales Invoice Items
- [ ] Pricing
- [ ] Gold Rate
- [ ] Making Charges
- [ ] Wastage
- [ ] Stone Charges
- [ ] GST
- [ ] Discounts
- [ ] Exchange
- [ ] EMI
- [ ] Split Payment
- [ ] Payment History
- [ ] Invoice Snapshots
- [ ] Thermal Printing
- [ ] WhatsApp Invoice
- [ ] Email Invoice

## Returns

- [ ] Sales Return
- [ ] Return Items
- [ ] Inventory Restoration
- [ ] Refund
- [ ] Credit Note
- [ ] Audit Movement

## Gold Exchange

- [ ] Old Gold Evaluation
- [ ] Weight
- [ ] Purity
- [ ] Deductions
- [ ] Fine Weight
- [ ] Value
- [ ] Invoice Credit
- [ ] Metal Accounting

## Staff

- [ ] Attendance
- [ ] Leave
- [ ] Salary
- [ ] Commission
- [ ] Target
- [ ] Activity Log

## Repair

- [ ] Repair Order
- [ ] Repair Entry
- [ ] Before Image
- [ ] After Image
- [ ] RFID
- [ ] Karigar
- [ ] Repair Charges
- [ ] Delivery
- [ ] Customer Notification

## Sell on Approval

- [ ] Approval Issue
- [ ] Approval Slip
- [ ] Deposit
- [ ] Due Date
- [ ] Return
- [ ] Purchase Conversion
- [ ] Expiry Alerts

## Girvi

- [ ] Self Girvi
- [ ] Third-Party Girvi
- [ ] Pledge
- [ ] Loan
- [ ] Interest
- [ ] Renewal
- [ ] Partial Payment
- [ ] Closure
- [ ] Jewellery Release
- [ ] Partner
- [ ] Commission
- [ ] Settlement
- [ ] Documents

## Accounting

- [ ] Journal
- [ ] Ledger
- [ ] Cash Book
- [ ] Bank Book
- [ ] Customer Ledger
- [ ] Vendor Ledger
- [ ] Gold Book
- [ ] Silver Book
- [ ] GST
- [ ] Trial Balance
- [ ] Profit & Loss
- [ ] Balance Sheet
- [ ] Day Closing

## CRM

- [ ] Customer Notes
- [ ] Loyalty
- [ ] Gold Saving Scheme
- [ ] Birthday Reminder
- [ ] WhatsApp
- [ ] SMS
- [ ] Festival Campaign
- [ ] Feedback

## Reports

- [ ] Sales
- [ ] Purchase
- [ ] Inventory
- [ ] Girvi
- [ ] Approval
- [ ] Repair
- [ ] Customer
- [ ] Staff
- [ ] Commission
- [ ] Cash Flow
- [ ] Profit
- [ ] GST
- [ ] Daily Closing
- [ ] Monthly Closing
- [ ] Yearly Reports
- [ ] Ledger
- [ ] Outstanding
- [ ] Karigar
- [ ] Gold/Silver Books

## Multi-Branch

- [ ] Multiple Stores
- [ ] Central Inventory
- [ ] Transfer Request
- [ ] Approval
- [ ] Dispatch
- [ ] Receive
- [ ] Branch Reports
- [ ] Branch Permissions

## Hardware

- [ ] RFID Printer
- [ ] RFID Reader
- [ ] Handheld RFID Scanner
- [ ] RFID Gate
- [ ] Barcode Scanner
- [ ] Thermal Printer

## Security

- [ ] RBAC
- [ ] Audit Logs
- [ ] Activity Tracking
- [ ] Login History
- [ ] Daily Backup
- [ ] Optional 2FA

## Mobile

- [ ] Owner Sales Dashboard
- [ ] Stock
- [ ] Girvi
- [ ] Staff
- [ ] Reports
- [ ] Approval
- [ ] Repairs
- [ ] Notifications

## Deployment

- [ ] Cloud Infrastructure
- [ ] Database Setup
- [ ] REST APIs
- [ ] Web ERP
- [ ] Mobile App
- [ ] Data Migration
- [ ] UAT
- [ ] Deployment
- [ ] Documentation
- [ ] Training
- [ ] Go Live
- [ ] Post-Go-Live Support

---

# 63. Final Conclusion

JMS should NOT be treated as a simple rewrite of the legacy jewellery software.

It is a modernization project where:

```text
LEGACY SYSTEM
= Business Reference

JMS
= New Technical System of Record

PROPOSAL
= Target ERP Scope + Delivery Commitment
```

The implementation objective is:

```text
Preserve Real Jewellery Business Processes
                +
Normalize and Strengthen the Data Model
                +
Make Financial Transactions Safe
                +
Make Physical Inventory Traceable
                +
Preserve Historical Truth
                +
Add RBAC / Auditability
                +
Support Multi-Branch Operations
                +
Expose REST APIs
                +
Provide Web ERP
                +
Provide Owner Mobile App
                +
Integrate RFID / Barcode / External Services
                ↓
       COMPLETE JMS ERP
```

The legacy system should guide **what the business does**.

The JMS architecture should determine **how that business is represented safely and maintainably**.

The proposal should guide **the target functional scope, integrations, delivery milestones, and deliverables**.

No legacy technical limitation should be copied merely for compatibility unless the business requirement explicitly requires it.
