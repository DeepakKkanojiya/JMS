# 💎 Phase 6 Frontend Integration & Architecture Guide — Girvi / Pawn Management Subsystem

## 📌 Executive Summary

The **Phase 6 Frontend Integration** brings full operational UI capabilities for the **Girvi / Pawn Management Subsystem** (Sprints 6.1–6.5) to the Jewellery Management System (JMS) web application.

It seamlessly connects with the Phase 6 backend REST APIs to provide complete user workflows for:
1. **Self Girvi Loan Management** (Registration, Approval, Collateral Pledges, Status Lifecycle)
2. **Authoritative Financial Calculations & Real-Time Accruals**
3. **Interest & Principal Collections Ledger** (With Mandatory Reversal Reasons & Reversal Visibility)
4. **Loan Renewals & Due Date Extensions**
5. **Full Settlements & Automated Jewellery Release**
6. **Third-Party External Lender Catalog & Re-Pledge Subsystem** (Visually & Financially Isolated)
7. **Unified Read-Only Reporting & 360-Degree Activity Audit Trails**

---

## 🧭 System Architecture & Component Mapping

### 1. Navigation & Routing (`src/App.tsx` & `src/components/layout/AppLayout.tsx`)
A permission-aware sidebar group **"Girvi / Pawn"** with sub-navigation items protected by dynamic database permissions:

| Sidebar Label | Route Path | Permission Guard | Component |
| :--- | :--- | :--- | :--- |
| **Girvi Dashboard** | `/girvi` | `girvi.read` | `GirviDashboard` |
| **Self Girvi Loans** | `/girvi/loans` | `girvi.read` | `SelfGirviLoans` |
| **Loan Details** | `/girvi/loans/:id` | `girvi.read` | `GirviLoanDetail` |
| **Collections Ledger** | `/girvi/collections` | `girvi.collection.read` | `GirviCollections` |
| **Settlements & Release** | `/girvi/settlements` | `girvi.settlement.read` | `GirviSettlements` |
| **Third-Party Girvi** | `/girvi/third-party` | `third_party_girvi.read` | `ThirdPartyGirvis` |
| **Third-Party Detail** | `/girvi/third-party/:id` | `third_party_girvi.read` | `ThirdPartyGirviDetail` |
| **Third-Party Lenders** | `/girvi/lenders` | `third_party_girvi.read` | `ThirdPartyLenders` |
| **Girvi Reports** | `/girvi/reports` | `girvi.report.read` | `GirviReports` |

---

## 🛠️ API Service Layer (`src/api/girvi.ts` & `src/api/thirdPartyGirvi.ts`)

Directly implements authoritative backend API contracts:

### Self Girvi APIs (`girviApi`)
- `createLoan(payload)`: `POST /api/v1/girvi/loans`
- `listLoans(params)`: `GET /api/v1/girvi/loans`
- `getLoanById(id)`: `GET /api/v1/girvi/loans/:id`
- `updateLoan(id, payload)`: `PUT /api/v1/girvi/loans/:id`
- `approveLoan(id)`: `POST /api/v1/girvi/loans/:id/approve`
- `cancelLoan(id, cancellationReason)`: `POST /api/v1/girvi/loans/:id/cancel`
- `addCollateral(id, collateral)`: `POST /api/v1/girvi/loans/:id/collaterals`
- `getFinancialSummary(id, asOfDate)`: `GET /api/v1/girvi/loans/:id/financial-summary`
- `listOverdueLoans(params)`: `GET /api/v1/girvi/overdue-loans`
- `createCollection(payload)`: `POST /api/v1/girvi/collections`
- `listCollections(params)`: `GET /api/v1/girvi/collections`
- `getLoanCollections(loanId)`: `GET /api/v1/girvi/loans/:loanId/collections`
- `reverseCollection(id, reversalReason)`: `POST /api/v1/girvi/collections/:id/reverse`
- `renewLoan(id, newDueDate, remarks)`: `POST /api/v1/girvi/loans/:id/renew`
- `settleLoan(id, payload)`: `POST /api/v1/girvi/loans/:id/settle`
- `listSettlements(params)`: `GET /api/v1/girvi/settlements`
- `getReleasedCollateral(loanId)`: `GET /api/v1/girvi/loans/:loanId/released-collateral`
- `getAuditTrail(loanId, sortOrder)`: `GET /api/v1/girvi/loans/:loanId/audit-trail`
- `getPortfolioReport(companyId, branchId)`: `GET /api/v1/girvi/reports/portfolio`
- `getOverdueAgingReport(companyId, branchId)`: `GET /api/v1/girvi/reports/overdue-aging`

### Third-Party Girvi APIs (`thirdPartyGirviApi`)
- `createLender(payload)`: `POST /api/v1/girvi/third-party/lenders`
- `listLenders(companyId, branchId)`: `GET /api/v1/girvi/third-party/lenders`
- `createThirdPartyGirvi(payload)`: `POST /api/v1/girvi/third-party/loans`
- `listThirdPartyLoans(params)`: `GET /api/v1/girvi/third-party/loans`
- `getThirdPartyGirviById(id)`: `GET /api/v1/girvi/third-party/loans/:id`
- `approveThirdPartyGirvi(id)`: `POST /api/v1/girvi/third-party/loans/:id/approve`
- `closeThirdPartyGirvi(id, closureReason)`: `POST /api/v1/girvi/third-party/loans/:id/close`
- `cancelThirdPartyGirvi(id, cancellationReason)`: `POST /api/v1/girvi/third-party/loans/:id/cancel`

---

## 🔒 Financial Safety & Business Isolation Rules

1. **Backend Financial Ownership**: The frontend does NOT calculate interest, overdue days, or principal/interest collection allocations. All financial figures are rendered directly from backend calculations.
2. **Self Girvi vs. Third-Party Financial Separation**:
   - Self Girvi loans represent store-funded receivables.
   - Third-Party Girvi loans represent external re-pledges (e.g. Muthoot Finance).
   - Third-Party principal and collateral valuations are rendered in a distinct dark-themed card (`#0F172A`) and are **never** combined into store receivables or portfolio totals.
3. **Auditability & Permanent Reversals**: Reversed collections cannot be deleted; they remain visible with a red `REVERSED` badge and historical audit tracking.
4. **Automated Collateral Release**: Full loan settlement or Third-Party closure triggers automatic status updates to `RELEASED` and restores linked inventory stock status to `AVAILABLE` with `GIRVI_RELEASE` StockMovement audit logs.

---

## 🧪 Build & Quality Verification

- **TypeScript Compilation (`npm run build`)**: PASSED with zero errors.
- **Design System Alignment**: Reused existing JMS components (`Pagination`, `SearchInput`, `SkeletonLoader`, `Toast`, `ConfirmDialog`) and CSS variables.
- **Backend Untouched Guarantee**: Zero backend files modified.
- **Git Safety**: No commits or pushes performed.
