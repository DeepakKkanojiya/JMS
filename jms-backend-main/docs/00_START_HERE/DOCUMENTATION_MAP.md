---
title: JMS Documentation Map & Authority Matrix
type: START_HERE
status: ACTIVE
authority: AUTHORITATIVE
last_updated: 2026-08-20
owner: JMS Architecture Team
related:
  - README.md
  - PROJECT_OVERVIEW.md
  - CURRENT_STATUS.md
---

# 🗺️ JMS Documentation Map & Authority Table

This document serves as the canonical directory map and authority matrix for all documentation within the JMS repository.

---

# 📊 Documentation Authority & Status Directory

| Document Path | Type | Status | Authority | Purpose / Target Audience |
| :--- | :--- | :--- | :--- | :--- |
| [`00_START_HERE/README.md`](file:///E:/JMS/jms-backend/docs/00_START_HERE/README.md) | START_HERE | ACTIVE | AUTHORITATIVE | Primary entry point and navigation guide for all developers/agents. |
| [`00_START_HERE/DOCUMENTATION_MAP.md`](file:///E:/JMS/jms-backend/docs/00_START_HERE/DOCUMENTATION_MAP.md) | START_HERE | ACTIVE | AUTHORITATIVE | Canonical map of all documents, types, statuses, and authorities. |
| [`00_START_HERE/PROJECT_OVERVIEW.md`](file:///E:/JMS/jms-backend/docs/00_START_HERE/PROJECT_OVERVIEW.md) | START_HERE | ACTIVE | AUTHORITATIVE | Executive summary of business background, legacy migration, and ERP vision. |
| [`00_START_HERE/CURRENT_STATUS.md`](file:///E:/JMS/jms-backend/docs/00_START_HERE/CURRENT_STATUS.md) | START_HERE | ACTIVE | AUTHORITATIVE | Single source of truth for implemented vs in-progress vs planned features. |
| [`01_BUSINESS/LEGACY_SYSTEM/LEGACY_FEATURES.md`](file:///E:/JMS/jms-backend/docs/01_BUSINESS/LEGACY_SYSTEM/LEGACY_FEATURES.md) | BUSINESS | ACTIVE | REFERENCE | Detailed specification of existing legacy desktop software functionality. |
| [`01_BUSINESS/ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md`](file:///E:/JMS/jms-backend/docs/01_BUSINESS/ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md) | BUSINESS | ACTIVE | AUTHORITATIVE | Master proposal requirement matrix combining legacy & Cognieos ERP target scope. |
| [`02_ARCHITECTURE/MASTER_SYSTEM_AND_CODE_FLOW.md`](file:///E:/JMS/jms-backend/docs/02_ARCHITECTURE/MASTER_SYSTEM_AND_CODE_FLOW.md) | ARCHITECTURE | ACTIVE | AUTHORITATIVE | System-wide 5-layer technical architecture, code flow, and request lifecycles. |
| [`03_CORE_FOUNDATION/IAM_AUTHENTICATION_AND_RBAC.md`](file:///E:/JMS/jms-backend/docs/03_CORE_FOUNDATION/IAM_AUTHENTICATION_AND_RBAC.md) | DOMAIN | ACTIVE | AUTHORITATIVE | Identity & Access Management, JWT auth, and dynamic RBAC security matrix. |
| [`03_CORE_FOUNDATION/ENTERPRISE_MASTER_DATA.md`](file:///E:/JMS/jms-backend/docs/03_CORE_FOUNDATION/ENTERPRISE_MASTER_DATA.md) | DOMAIN | ACTIVE | AUTHORITATIVE | Multi-company, branch, employee, customer, vendor, and product hierarchy. |
| [`04_DOMAINS/INVENTORY/INVENTORY_AND_ITEM_TRACKING.md`](file:///E:/JMS/jms-backend/docs/04_DOMAINS/INVENTORY/INVENTORY_AND_ITEM_TRACKING.md) | DOMAIN | ACTIVE | AUTHORITATIVE | Tagged inventory, RFID stock management, movement audit ledger, transfers. |
| [`04_DOMAINS/SALES/SALES_AND_POS_SUBSYSTEM.md`](file:///E:/JMS/jms-backend/docs/04_DOMAINS/SALES/SALES_AND_POS_SUBSYSTEM.md) | DOMAIN | ACTIVE | AUTHORITATIVE | Sales billing, metal rates engine, payments, gold exchange, returns, refunds. |
| [`05_API/FRONTEND_API_HANDOVER.md`](file:///E:/JMS/jms-backend/docs/05_API/FRONTEND_API_HANDOVER.md) | API | ACTIVE | AUTHORITATIVE | Complete REST API reference, request/response specs, and Swagger/Postman guide. |
| [`10_PHASES/PHASE_5/SPRINT_5_1/PURCHASE_FOUNDATION.md`](file:///E:/JMS/jms-backend/docs/10_PHASES/PHASE_5/SPRINT_5_1/PURCHASE_FOUNDATION.md) | PHASE | COMPLETED | IMPLEMENTATION_NOTE | Procurement & PO foundation sprint implementation notes. |
| [`10_PHASES/PHASE_5/SPRINT_5_3/PURCHASE_BILLING.md`](file:///E:/JMS/jms-backend/docs/10_PHASES/PHASE_5/SPRINT_5_3/PURCHASE_BILLING.md) | PHASE | COMPLETED | IMPLEMENTATION_NOTE | Purchase billing & vendor payable foundation sprint implementation notes. |
| [`10_PHASES/PHASE_5/SPRINT_5_4/VENDOR_PAYMENTS.md`](file:///E:/JMS/jms-backend/docs/10_PHASES/PHASE_5/SPRINT_5_4/VENDOR_PAYMENTS.md) | PHASE | COMPLETED | IMPLEMENTATION_NOTE | Vendor payment & payable settlement sprint implementation notes. |
| [`10_PHASES/PHASE_5/SPRINT_5_5/PURCHASE_RETURNS.md`](file:///E:/JMS/jms-backend/docs/10_PHASES/PHASE_5/SPRINT_5_5/PURCHASE_RETURNS.md) | PHASE | IN_PROGRESS | IMPLEMENTATION_NOTE | Purchase return & debit note sprint implementation notes. |
| [`10_PHASES/PHASE_5/SPRINT_5_6/JOB_WORK.md`](file:///E:/JMS/jms-backend/docs/10_PHASES/PHASE_5/SPRINT_5_6/JOB_WORK.md) | PHASE | IN_PROGRESS | IMPLEMENTATION_NOTE | Artisan / Karigar job work sprint implementation notes. |
| [`10_PHASES/PHASE_5/SPRINT_5_7/STOCK_AUDIT.md`](file:///E:/JMS/jms-backend/docs/10_PHASES/PHASE_5/SPRINT_5_7/STOCK_AUDIT.md) | PHASE | IN_PROGRESS | IMPLEMENTATION_NOTE | Stock audit & inventory reconciliation sprint implementation notes. |
| [`11_REPORTS/COMPLETION/PHASE_4_FINAL_COMPLETION_REPORT.md`](file:///E:/JMS/jms-backend/docs/11_REPORTS/COMPLETION/PHASE_4_FINAL_COMPLETION_REPORT.md) | REPORT | COMPLETED | HISTORICAL | Formal sign-off and audit verification report for Phase 4 completion. |
| [`13_DECISIONS/ADR_INDEX.md`](file:///E:/JMS/jms-backend/docs/13_DECISIONS/ADR_INDEX.md) | DECISION | ACTIVE | AUTHORITATIVE | Index of all Architectural Decision Records (ADRs). |

---

# 📐 Full Documentation Hierarchy Tree

```text
docs/
├── 00_START_HERE/              # Primary onboarding & map
│   ├── README.md               # Visual navigation & quicklinks
│   ├── DOCUMENTATION_MAP.md    # Map & authority matrix (This document)
│   ├── PROJECT_OVERVIEW.md     # Business & technical context
│   └── CURRENT_STATUS.md       # Empirical codebase status
│
├── 01_BUSINESS/                # Requirements & background
│   ├── LEGACY_SYSTEM/
│   │   └── LEGACY_FEATURES.md  # Original desktop system specs
│   └── ERP_SCOPE/
│       └── COMPLETE_JMS_BUILD_SCOPE.md # Full ERP requirement scope
│
├── 02_ARCHITECTURE/            # System design & pattern docs
│   └── MASTER_SYSTEM_AND_CODE_FLOW.md # 5-layer architecture & request flow
│
├── 03_CORE_FOUNDATION/         # Shared core platform modules
│   ├── ENTERPRISE_MASTER_DATA.md # Companies, branches, master entities
│   └── IAM_AUTHENTICATION_AND_RBAC.md # Auth, JWT, permission engine
│
├── 04_DOMAINS/                 # Business domain specifications
│   ├── INVENTORY/
│   │   └── INVENTORY_AND_ITEM_TRACKING.md # Stock tags, RFID, movements
│   └── SALES/
│       └── SALES_AND_POS_SUBSYSTEM.md # POS billing, gold rate, returns
│
├── 05_API/                     # API specification & integration guides
│   └── FRONTEND_API_HANDOVER.md# Full API endpoints reference
│
├── 10_PHASES/                  # Sprint implementation records
│   └── PHASE_5/
│       ├── SPRINT_5_1/PURCHASE_FOUNDATION.md
│       ├── SPRINT_5_3/PURCHASE_BILLING.md
│       ├── SPRINT_5_4/VENDOR_PAYMENTS.md
│       ├── SPRINT_5_5/PURCHASE_RETURNS.md
│       ├── SPRINT_5_6/JOB_WORK.md
│       └── SPRINT_5_7/STOCK_AUDIT.md
│
├── 11_REPORTS/                 # Audit & sign-off completion reports
│   └── COMPLETION/
│       └── PHASE_4_FINAL_COMPLETION_REPORT.md
│
├── 13_DECISIONS/               # Architecture Decision Records
│   └── ADR_INDEX.md            # Index of system ADRs
│
└── 99_ARCHIVE/                 # Deprecated / superseded documents
```
