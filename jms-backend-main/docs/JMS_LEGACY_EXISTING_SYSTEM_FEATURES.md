# JMS --- Existing Legacy Jewellery Software Feature Reference

## Purpose

This document records the business capabilities visible in the
approximately 20 screenshots of the client's existing legacy jewellery
ERP/software.

The screenshots are the **business reference** for understanding how the
client's current system works.

> **Important:** This document describes what the existing software
> appears to support. It is not a technical specification of the legacy
> database or APIs.

------------------------------------------------------------------------

# 1. Existing Software --- General Structure

The existing system is a jewellery ERP / retail accounting application.

It combines:

-   Jewellery Sales
-   Jewellery Purchase
-   Sales Return
-   Purchase Return
-   Customer Accounts
-   Supplier / Party Accounts
-   Cash
-   Payments
-   Receipts
-   Gold / Silver transactions
-   Gold / Silver balances
-   Metal rates
-   Rate booking
-   Inventory
-   Tag numbers
-   Daily transactions
-   Ledger
-   Accounting adjustments
-   Repairs
-   Transfers
-   Reports
-   Girvi / Pawn operations
-   Tax information

The legacy system is primarily **transaction / voucher driven**.

A transaction normally contains:

-   Account / party
-   Voucher / series
-   Date
-   Bill / voucher number
-   Narration
-   Jewellery items
-   Tag number
-   Quantity
-   Gross weight
-   Less weight
-   Net weight
-   Tunch / purity
-   Wastage
-   Rate
-   Labour / making charge
-   Diamond / stone values
-   Fine
-   Discount
-   Other charges
-   Tax
-   Total
-   Payment / receipt
-   Adjustments

------------------------------------------------------------------------

# 2. Sales Voucher

The existing software has a **Sales** screen.

## Header

The sales screen contains:

-   New A/c
-   Account
-   Search
-   Cash A/c
-   Narration
-   Series
-   Date
-   Bill No.
-   Final Voucher
-   Goods Delivery

## Customer / Account

The user can select:

-   Existing customer / account
-   Cash customer
-   New account / customer

## Item Grid

Sale items contain fields such as:

-   Type
-   Tag No.
-   Item Name
-   Remarks
-   Unit
-   Pieces
-   Gross Weight
-   Less Weight
-   Net Weight
-   Tunch
-   Wastage
-   Rate
-   Labour
-   Other
-   Fine
-   Discount
-   Total

## Additional Jewellery Attributes

The software also supports:

-   Diamond Value
-   Stone Value
-   Labour
-   Total Gross Weight
-   Total Metal Weight
-   Design
-   Clarity
-   Colour
-   Diamond Weight
-   Stone Weight

This indicates that jewellery items contain both:

### Metal information

-   Metal
-   Purity / Tunch
-   Gross weight
-   Less weight
-   Net weight
-   Fine
-   Wastage
-   Rate

### Stone / Diamond information

-   Diamond value
-   Stone value
-   Diamond weight
-   Stone weight
-   Design
-   Clarity
-   Colour

## Sale Calculation

The system calculates or records:

-   Metal value
-   Labour / making
-   Wastage
-   Diamond / stone value
-   Discount
-   Other charges
-   Tax
-   Round off
-   Final amount

The sales screen also contains:

-   Add
-   Less
-   Rate Difference
-   Round Off
-   Adjustments
-   Net Balance

The final sale can be settled through payment / receipt.

------------------------------------------------------------------------

# 3. Sale Estimate

The legacy system uses an **Estimate** series.

An estimate looks similar to the sale voucher.

It supports:

-   Customer / account
-   Date
-   Bill number
-   Items
-   Tag numbers
-   Weight
-   Rate
-   Labour
-   Wastage
-   Discount
-   Other charges
-   Fine
-   Total
-   Goods Delivery
-   Final Voucher

## Important Business Distinction

The legacy software distinguishes between:

-   Estimate
-   Final Sales Voucher

JMS should not automatically assume that an estimate and a final sale
are the same business state.

------------------------------------------------------------------------

# 4. Sale Payment

The Sales screen has a **Payment** function.

Payment information includes:

-   Payment method
-   Account
-   Amount
-   Narration
-   Rate
-   Tunch
-   Fine
-   Gold / Silver selection
-   Batch
-   Expiry Date
-   Approval Code
-   Type

Visible payment methods include:

-   Cash
-   Card
-   Cheque
-   Other
-   UPI
-   OG
-   Online

Therefore the legacy system supports multiple payment methods and can
handle more than simple cash settlement.

------------------------------------------------------------------------

# 5. Sale Receipt

The legacy system also contains a **Receipt** function.

Receipt methods include:

-   Cash
-   Card
-   Cheque
-   Other
-   UPI
-   OG
-   Online

Receipt information includes:

-   Amount
-   Narration
-   Rate
-   Tunch
-   Fine
-   Gold / Silver selection
-   Batch
-   Expiry Date
-   Approval Code

------------------------------------------------------------------------

# 6. Gold and Silver Settlement

The legacy software shows dedicated concepts for:

-   Gold
-   Silver
-   Fine
-   Old Gold / Old Jewellery
-   Gold Balance
-   Gold Fine
-   Gold Old Jewellery
-   Silver Balance
-   Silver Fine

This means the business model treats precious-metal quantities / fine
balances as transaction and settlement concepts.

The system is therefore not limited to INR/currency-only transactions.

------------------------------------------------------------------------

# 7. Gold Bhav

The system contains a **Gold Bhav** transaction.

It supports:

-   Sale / Purchase selection
-   Weight
-   Tunch
-   Rate
-   Value
-   Narration

The user can select:

1.  Sale
2.  Purchase

Gold Bhav represents a **business transaction**.

It should not automatically be considered the same thing as a daily
Metal Rate Master.

------------------------------------------------------------------------

# 8. Silver Bhav

The system contains a **Silver Bhav** transaction.

It has similar fields:

-   Sale / Purchase
-   Weight
-   Tunch
-   Rate
-   Value
-   Narration

It is the silver equivalent of Gold Bhav.

------------------------------------------------------------------------

# 9. Rate Booking

The Sales screen contains **Rate Booking**.

The Rate Booking popup contains:

-   Stamp
-   Weight
-   Rate
-   Amount
-   Delete Date
-   Type
-   Narration

Rate Booking represents a customer / business rate reservation
mechanism.

It is different from simply maintaining today's metal rate.

A booked rate may later be used against a transaction.

------------------------------------------------------------------------

# 10. Transfer

The Sales screen has a **Transfer** function.

The transfer popup contains:

-   Debit / Credit
-   Account / Party
-   Gold
-   Silver
-   Amount
-   Narration

The legacy system therefore supports transfer transactions involving:

-   Currency
-   Gold
-   Silver

These should be considered separate business concepts:

-   Inventory Transfer
-   Financial Account Transfer
-   Metal Transfer

They should not automatically be treated as one operation.

------------------------------------------------------------------------

# 11. Sales Return

The existing software has a **Sale Ret.** screen.

Sales Return supports:

-   Account / customer
-   Series
-   Date
-   Bill number
-   Tag number
-   Item name
-   Remarks
-   Unit
-   Pieces
-   Gross weight
-   Less weight
-   Net weight
-   Tunch
-   Wastage
-   Rate
-   Labour
-   Other
-   Discount
-   Fine
-   Total

Additional values include:

-   Diamond value
-   Stone value
-   Metal
-   Labour
-   Total gross weight
-   Total stone weight
-   Total metal weight
-   Design
-   Clarity
-   Colour

## Adjustment Entries

The return screen also contains adjustment entries with:

-   Date
-   Particulars
-   Select
-   Reference number
-   Amount

The return can affect account balances and financial settlement.

------------------------------------------------------------------------

# 12. Purchase

The legacy system has a **Purchase Voucher**.

## Header

-   New Account
-   Account
-   Search
-   Cash A/c
-   Narration
-   Series
-   Date
-   Bill No.
-   Final Voucher

## Items

-   Type
-   Tag No.
-   Item Name
-   Remarks
-   Pieces
-   Gross Weight
-   Less Weight
-   Net Weight
-   Unit
-   Tunch
-   Wastage
-   Rate
-   Diamond Weight
-   Stone Weight
-   Labour
-   Other
-   Fine
-   Total

## Additional Purchase Information

-   Fine
-   Diamond Value
-   Labour
-   Total Gross Weight
-   Total Labour
-   Total Metal Value
-   Design
-   Clarity
-   Colour
-   Rows

The system therefore supports jewellery purchase transactions at item /
tag level.

------------------------------------------------------------------------

# 13. Tag-Wise Purchase

The existing software specifically has a **Purchase Tagwise** workflow.

This indicates that individual jewellery tags are important during
purchasing.

Fields include:

-   Item Name
-   Stamp
-   Remarks
-   Tag No.
-   Unit
-   Pieces
-   Gross Weight
-   Less
-   Net Weight
-   Tunch
-   Rate
-   Diamond Weight
-   Stone Weight
-   Labour
-   Fine
-   Total

## Business Importance

Tag-level traceability is an important legacy requirement.

------------------------------------------------------------------------

# 14. Gold Old Jewellery

The legacy software explicitly supports **Gold Old Jewellery** and
related gold balance / fine concepts.

Old jewellery can be involved in:

-   Sale
-   Receipt
-   Payment
-   Exchange
-   Metal settlement

This concept is related to the Gold Exchange capability in JMS, while
broader metal-ledger behavior may require a separate future module.

------------------------------------------------------------------------

# 15. Adjustments

The Sales system contains an adjustment area.

Visible adjustment types include:

-   Add
-   Less
-   Rate Difference
-   Round Off
-   Discount
-   Commission
-   Other Account
-   Change to Account

Adjustment entries also contain:

-   Date
-   Particulars
-   Reference number
-   Amount

These are business-level financial adjustments.

A future JMS accounting implementation should use a formal adjustment
mechanism rather than duplicating adjustment logic across individual
screens.

------------------------------------------------------------------------

# 16. Account Master

The legacy system has an **Accounts Info** screen.

## Basic Account Information

-   Account Name
-   Group
-   A/c No.

The account contains multiple sections / tabs.

## A/C Detail

-   Address
-   Location
-   City
-   State
-   PIN
-   Country
-   Phone
-   Mobile
-   Reference / Remark
-   Email
-   Website
-   DOB
-   Anniversary
-   Occupation

## Personal Details

The system stores personal / customer information.

## Bank Details

The system supports banking information.

## Tax Details

The system supports:

-   GSTIN
-   PAN
-   HSN
-   TAN
-   CST
-   TDS
-   MSME
-   Other tax-related fields

## Opening Balance

An account can have:

-   Gold Fine
-   Silver Fine
-   Amount

Each balance can have:

-   Debit
-   Credit

Therefore an account can have both financial and precious-metal opening
balances.

------------------------------------------------------------------------

# 17. Daily Transaction

The existing system has a **Daily Transaction** screen.

Visible transaction types include:

-   Receipt
-   Payment
-   Sale
-   Purchase
-   Sale Return
-   Purchase Return
-   Journal
-   Contra
-   Issue
-   Receive
-   Repair
-   Order

The screen also shows:

-   Opening Cash
-   Closing Cash

This functions as a daily operational / financial summary.

------------------------------------------------------------------------

# 18. Cash Book

The system contains a **Cash Book**.

Cash movement can originate from:

-   Receipts
-   Payments
-   Sales
-   Purchases
-   Returns
-   Other transactions

The Cash Book is therefore broader than an individual sales-payment
screen.

------------------------------------------------------------------------

# 19. Gold Book

The system contains a **Gold Book** concept.

Gold-related transactions and balances are tracked separately.

The business concept includes:

-   Gold received
-   Gold issued
-   Gold purchases
-   Gold sales
-   Gold exchange
-   Gold transfers
-   Gold balances
-   Fine balances

Gold is treated as a business asset / settlement medium and not merely
as a product attribute.

------------------------------------------------------------------------

# 20. Silver Book

The system contains a **Silver Book** concept.

Expected business areas include:

-   Silver received
-   Silver issued
-   Silver purchase
-   Silver sale
-   Silver transfer
-   Silver balance
-   Silver fine

------------------------------------------------------------------------

# 21. Ledger

The legacy system contains:

-   Ledger Short
-   Ledger Detail
-   A/c Summary
-   Daily Balance
-   Daily Transaction

The system therefore maintains historical financial information at the
account / party level.

A customer or party can have a transaction history.

The Ledger is not merely a sales report; it represents the financial
relationship with the party.

------------------------------------------------------------------------

# 22. Daily Balance

The system contains **Daily Balance**.

It summarizes daily financial activity.

Visible concepts include:

-   Opening Cash
-   Sales
-   Purchases
-   Receipts
-   Payments
-   Returns
-   Journal
-   Contra
-   Issue
-   Receive
-   Closing Cash

------------------------------------------------------------------------

# 23. Account Summary

The system contains **A/C Summary**.

This represents a summarized view of an account's financial position.

The business concept connects to:

-   Opening balance
-   Sales
-   Purchases
-   Receipts
-   Payments
-   Returns
-   Adjustments
-   Closing balance
-   Gold balance
-   Silver balance

------------------------------------------------------------------------

# 24. Tag Generation

The Daily Transaction area contains **Tag Generation**.

This indicates that jewellery tags are generated as part of inventory
operations.

A jewellery item can have:

-   Tag number
-   Item / product
-   Metal
-   Purity
-   Weight
-   Stone information
-   Design
-   Pricing information

Tags are important for tracking individual physical jewellery pieces.

------------------------------------------------------------------------

# 25. Quotation

The system contains **Quotation**.

Quotation represents a pre-sale commercial document.

It is related to, but distinct from:

-   Estimate
-   Sales Invoice
-   Final Voucher

JMS should eventually model these as controlled document states /
workflows where required.

------------------------------------------------------------------------

# 26. Credit Note

The system contains **Credit Note**.

A Credit Note is an accounting / financial document.

It should not automatically be equated with a Sales Return.

A Credit Note and Sales Return may be related but can represent
different business concepts.

------------------------------------------------------------------------

# 27. Journal

The system contains **Journal**.

Journal represents accounting adjustments / entries.

It is separate from:

-   Sales
-   Purchase
-   Payment
-   Receipt

A future JMS accounting module should support journal entries.

------------------------------------------------------------------------

# 28. Contra

The system contains **Contra**.

Contra represents transfers between internal financial accounts such as:

-   Cash
-   Bank
-   Other internal accounts

It belongs to the accounting / cash-bank subsystem.

------------------------------------------------------------------------

# 29. Expense

The system contains **Expense**.

This represents business expenses.

The visible business capability suggests support for:

-   Expense category
-   Account
-   Amount
-   Payment method
-   Date
-   Branch
-   Employee / user
-   Narration
-   Accounting entry

Exact accounting behavior requires business validation.

------------------------------------------------------------------------

# 30. Repair

The Daily Transaction menu contains **Repair**.

This indicates that the legacy software supports jewellery repair
operations.

A possible business workflow is:

``` text
Customer
   ↓
Item Received
   ↓
Repair Details
   ↓
Repair Work
   ↓
Charges
   ↓
Payment
   ↓
Delivery
```

The exact workflow should not be assumed until confirmed by the client
or additional system evidence.

------------------------------------------------------------------------

# 31. Girvi / Pawn

The legacy system contains:

-   Girvi Receipt
-   Girvi Return
-   Girvi Transfer
-   Girvi Transfer Return

This indicates support for a gold-backed pledge / pawn workflow.

Girvi should be treated as a separate major business module.

It should not be mixed directly into:

-   Normal Sales
-   Gold Exchange
-   Normal Inventory

Exact Girvi rules require business validation.

------------------------------------------------------------------------

# 32. Issue / Receive

The Daily Transaction screen contains:

-   Issue
-   Receive

These indicate stock / material / business transactions outside normal
Sale and Purchase.

The screenshots do not provide enough information to determine their
exact business rules.

Therefore these capabilities should be recorded as:

> **Requires business validation**

Do not invent their implementation.

------------------------------------------------------------------------

# 33. Goods Delivery

The Sales screen contains **Goods Delivery**.

This indicates that a sale can have a delivery state.

The business should distinguish between:

``` text
Invoice Confirmed
```

and

``` text
Goods Delivered
```

These are not necessarily the same event.

------------------------------------------------------------------------

# 34. Inventory and Tag Traceability

The legacy software relies heavily on **Tag No.**

The tag identifies a physical jewellery item.

A modern JMS implementation should support the conceptual lifecycle:

``` text
Purchase
   ↓
Inventory Item
   ↓
Tag Generation
   ↓
Barcode / QR
   ↓
Stock
   ↓
POS Scan
   ↓
Sale
   ↓
SOLD
   ↓
Return
   ↓
AVAILABLE
```

This is a major legacy business requirement.

------------------------------------------------------------------------

# 35. Major Business Dimensions

The legacy system can be understood through five major transaction
dimensions.

## 35.1 Physical Jewellery

-   Product
-   Tag
-   Weight
-   Purity
-   Stones
-   Design

## 35.2 Metal

-   Gold
-   Silver
-   Fine
-   Tunch
-   Metal Rate
-   Metal Balance

## 35.3 Money

-   Cash
-   Card
-   UPI
-   Bank
-   Cheque
-   Amount

## 35.4 Accounting

-   Debit
-   Credit
-   Ledger
-   Adjustment
-   Journal
-   Contra
-   Cash Book

## 35.5 Documents / Vouchers

-   Estimate
-   Quotation
-   Sale
-   Purchase
-   Return
-   Receipt
-   Payment
-   Credit Note
-   Transfer
-   Repair
-   Girvi

------------------------------------------------------------------------

# 36. Legacy Feature Inventory

  Area         Existing Capability     Evidence / Notes
  ------------ ----------------------- ---------------------------------------------
  Sales        Sales voucher           Item/tag-based jewellery sale
  Sales        Estimate                Pre-final sales document
  Sales        Goods Delivery          Delivery state exists
  Sales        Final Voucher           Finalized sale
  Sales        Payment                 Multiple payment methods
  Sales        Receipt                 Multiple receipt methods
  Sales        Rate Booking            Customer/business rate reservation
  Sales        Adjustments             Add, less, rate difference, round off, etc.
  Purchase     Purchase voucher        Jewellery purchase
  Purchase     Purchase Tagwise        Tag-level purchase
  Returns      Sales Return            Item/tag-level return
  Returns      Purchase Return         Listed in daily transactions
  Accounts     Account Master          Party/customer account
  Accounts     Ledger                  Short/detail ledger
  Accounts     A/C Summary             Account summary
  Accounts     Opening Balance         Amount + gold/silver fine
  Accounting   Journal                 Accounting adjustment
  Accounting   Contra                  Internal account transfer
  Accounting   Cash Book               Cash transaction tracking
  Accounting   Daily Balance           Daily financial summary
  Accounting   Credit Note             Financial document
  Accounting   Expense                 Business expense
  Metal        Gold Bhav               Gold transaction
  Metal        Silver Bhav             Silver transaction
  Metal        Gold Book               Gold balance/transactions
  Metal        Silver Book             Silver balance/transactions
  Metal        Gold Fine               Gold fine balance
  Metal        Silver Fine             Silver fine balance
  Metal        Gold Old Jewellery      Old gold / jewellery
  Metal        Rate Booking            Booked metal rate
  Inventory    Tag Generation          Physical jewellery tag
  Inventory    Issue                   Legacy transaction
  Inventory    Receive                 Legacy transaction
  Inventory    Transfer                Financial/metal transfer concept
  Operations   Repair                  Jewellery repair
  Operations   Order                   Listed in daily transactions
  Operations   Quotation               Pre-sale commercial document
  Pawn         Girvi Receipt           Pawn/pledge
  Pawn         Girvi Return            Pawn return
  Pawn         Girvi Transfer          Pawn transfer
  Pawn         Girvi Transfer Return   Pawn transfer return
  Tax          GST/PAN/etc.            Account tax information

------------------------------------------------------------------------

# 37. Features That Need Special Attention in JMS

The following legacy capabilities are especially important because they
involve business concepts that can easily be oversimplified:

### 1. Tag-level jewellery tracking

A physical jewellery piece is identified through a tag number.

### 2. Metal balances

Gold and silver can participate in financial / settlement transactions.

### 3. Fine / Tunch

The system tracks purity-related metal values.

### 4. Rate Booking

A booked rate is different from a daily metal rate.

### 5. Estimate vs Final Sale

Estimate and finalized sale are different business concepts.

### 6. Goods Delivery

Invoice confirmation and physical delivery can be separate events.

### 7. Sales Return vs Credit Note

These should not automatically be treated as identical.

### 8. Gold Exchange vs Gold Book

Old jewellery exchange and broader gold accounting are related but
distinct.

### 9. Inventory Transfer vs Financial Transfer vs Metal Transfer

The legacy system contains multiple transfer concepts.

### 10. Girvi

Girvi is a separate pawn/pledge business domain.

------------------------------------------------------------------------

# 38. What the Screenshots Do NOT Tell Us

The screenshots do **not** provide enough reliable information to
determine:

-   Exact legacy database structure
-   Exact legacy API structure
-   Exact accounting formulas
-   Exact GST accounting rules
-   Exact fine calculation formulas
-   Exact gold/silver ledger rules
-   Exact Girvi interest rules
-   Exact repair workflow rules
-   Exact purchase-return formulas
-   Exact voucher-numbering rules
-   Exact permission rules
-   Exact branch-accounting rules
-   Exact behavior of Issue / Receive
-   Exact behavior of all reports

Therefore these must not be invented.

Use:

> **Requires business validation**

until confirmed by:

-   Client
-   Existing legacy behavior
-   Existing backend implementation
-   Formal business requirements

------------------------------------------------------------------------

# 39. Rules for Mapping Legacy Software to JMS

The screenshots are **business reference**, not a UI specification.

Do not:

-   Copy the old UI
-   Reproduce the old desktop layout
-   Assume every visible feature needs a separate database table
-   Modify the JMS database merely because a feature exists in the
    legacy software
-   Duplicate an existing JMS table
-   Duplicate an existing JMS API

The correct process is:

``` text
Legacy Feature
      ↓
Understand Business Workflow
      ↓
Find Existing JMS Equivalent
      ↓
Inspect JMS Database
      ↓
Inspect JMS API
      ↓
Reuse Existing Capability
      ↓
Identify Genuine Gap
      ↓
Propose Missing Capability
      ↓
Implement
      ↓
Modern Web UI
```

------------------------------------------------------------------------

# 40. Current JMS Foundation Already Covers Important Areas

According to the current JMS project documentation, Phase 1--3 already
provides:

-   Company
-   Branch
-   Employees
-   Customers
-   Customer addresses/documents
-   Product categories
-   Product subcategories
-   Products
-   Inventory items
-   Inventory tags
-   Inventory images
-   Inventory transfers
-   Purchase orders
-   Purchase order items
-   Authentication
-   RBAC

Phase 4 already provides:

-   Sales invoices
-   Sales invoice items
-   Metal rates
-   Sales invoice metal-rate snapshots
-   Making charges
-   Tax rates
-   Pricing
-   POS
-   Sales payments
-   Gold exchange
-   Gold exchange items
-   Sales returns
-   Sales return items
-   Sales refunds

These existing JMS capabilities must be inspected before creating new
tables or APIs.

------------------------------------------------------------------------

# 41. Final Objective

The goal is **not** to make JMS look like the old software.

The goal is:

``` text
LEGACY BUSINESS CAPABILITY
          ↓
UNDERSTAND WORKFLOW
          ↓
MAP TO JMS
          ↓
REUSE EXISTING ARCHITECTURE
          ↓
IMPLEMENT GENUINE GAPS
          ↓
MODERN WEB UI
```

JMS should eventually cover the required business capabilities of the
legacy system while maintaining:

-   Modern UI
-   REST APIs
-   Proper RBAC
-   Clean database design
-   Auditability
-   Transaction safety
-   Inventory consistency
-   Financial consistency
-   Metal consistency
-   Branch support
-   Scalable architecture

------------------------------------------------------------------------

# 42. Required Next Analysis

Before implementing additional legacy features, produce a **Legacy → JMS
Feature Gap Analysis**.

Use this structure:

  ------------------------------------------------------------------------------------------------
  Legacy     Legacy           Existing JMS Existing   Existing   Status    Missing      Proposed
  Feature    Capability       Equivalent   Tables     APIs                 Capability   Phase
  ---------- ---------------- ------------ ---------- ---------- --------- ------------ ----------
  Sales      Jewellery sales  Sales        Inspect    Inspect    Covered / ---          ---
                              Invoice /    JMS        JMS        Partial /              
                              POS                                Missing                

  Purchase   Jewellery        Purchase     Inspect    Inspect    Covered / ---          ---
             purchase         module       JMS        JMS        Partial /              
                                                                 Missing                

  Sales      Tagged jewellery Sales Return Inspect    Inspect    Covered / ---          ---
  Return     return                        JMS        JMS        Partial /              
                                                                 Missing                

  Gold Book  Gold             Inspect JMS  Inspect    Inspect    Missing / Gold ledger  Future
             balance/ledger                JMS        JMS        Partial                

  Silver     Silver           Inspect JMS  Inspect    Inspect    Missing / Silver       Future
  Book       balance/ledger                JMS        JMS        Partial   ledger       

  Rate       Booked metal     Inspect JMS  Inspect    Inspect    Missing / Rate booking Future
  Booking    rate                          JMS        JMS        Partial   workflow     

  Girvi      Pawn/pledge      Inspect JMS  Inspect    Inspect    Missing   Complete     Future
                                           JMS        JMS                  Girvi module 

  Repair     Jewellery repair Inspect JMS  Inspect    Inspect    Missing   Repair       Future
                                           JMS        JMS                  workflow     

  Journal    Accounting entry Inspect JMS  Inspect    Inspect    Missing / Accounting   Future
                                           JMS        JMS        Partial   journal      

  Contra     Cash/bank        Inspect JMS  Inspect    Inspect    Missing / Contra       Future
             transfer                      JMS        JMS        Partial   workflow     
  ------------------------------------------------------------------------------------------------

This gap analysis should be completed **before starting the next
implementation phase**.
