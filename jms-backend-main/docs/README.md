---
title: JMS Documentation & Architecture Portal
type: START_HERE
status: ACTIVE
authority: AUTHORITATIVE
last_updated: 2026-08-20
owner: JMS Architecture Team
related:
  - DOCUMENTATION_MAP.md
  - PROJECT_OVERVIEW.md
  - CURRENT_STATUS.md
---

# 🚀 Welcome to Jewellery Management System (JMS) Documentation

The **Jewellery Management System (JMS)** is an enterprise-grade ERP, POS, and financial accounting system engineered specifically for multi-branch jewellery retail, wholesale, manufacturing (job work), and pawn-broking (Girvi) operations.

---

# 🗺️ Master Navigation & System Architecture Flow

A new developer, architect, AI agent, or tester should read the documentation in this structured order:

```text
               1. What is JMS & What are we building?
                                 ↓
                  [ 00_START_HERE / README.md ]
                                 ↓
        2. Business Requirements, Legacy Scope & ERP Target
                                 ↓
             [ 01_BUSINESS / ERP_SCOPE & LEGACY_SYSTEM ]
                                 ↓
        3. Technical Architecture & Database Design
                                 ↓
         [ 02_ARCHITECTURE / MASTER_SYSTEM_AND_CODE_FLOW.md ]
                                 ↓
        4. Core Security, IAM, RBAC & Enterprise Data
                                 ↓
                [ 03_CORE_FOUNDATION / IAM & MASTER ]
                                 ↓
        5. Specific Business Domain Implementation
                                 ↓
             [ 04_DOMAINS / SALES, INVENTORY, PURCHASE... ]
                                 ↓
        6. API Endpoints & Handover Interfaces
                                 ↓
                [ 05_API / FRONTEND_API_HANDOVER.md ]
                                 ↓
        7. Audit Verification & Execution Reports
                                 ↓
                [ 11_REPORTS & 10_PHASES / PHASE_X ]
```

---

# 📚 Recommended Reading Order

### For New Backend / Fullstack Developers
1. [README.md](file:///E:/JMS/jms-backend/docs/00_START_HERE/README.md) (This file)
2. [PROJECT_OVERVIEW.md](file:///E:/JMS/jms-backend/docs/00_START_HERE/PROJECT_OVERVIEW.md)
3. [CURRENT_STATUS.md](file:///E:/JMS/jms-backend/docs/00_START_HERE/CURRENT_STATUS.md)
4. [Master System and Code Flow](file:///E:/JMS/jms-backend/docs/02_ARCHITECTURE/MASTER_SYSTEM_AND_CODE_FLOW.md)
5. [IAM & RBAC Security](file:///E:/JMS/jms-backend/docs/03_CORE_FOUNDATION/IAM_AUTHENTICATION_AND_RBAC.md)
6. Domain docs relevant to your feature task under `docs/04_DOMAINS/`

### For Frontend Developers
1. [Frontend API Handover Guide](file:///E:/JMS/jms-backend/docs/05_API/FRONTEND_API_HANDOVER.md)
2. [IAM & RBAC Security](file:///E:/JMS/jms-backend/docs/03_CORE_FOUNDATION/IAM_AUTHENTICATION_AND_RBAC.md)
3. Domain specifications under `docs/04_DOMAINS/`

### For Solution Architects & AI Agents
1. [Documentation Map](file:///E:/JMS/jms-backend/docs/00_START_HERE/DOCUMENTATION_MAP.md)
2. [Complete JMS Build Scope](file:///E:/JMS/jms-backend/docs/01_BUSINESS/ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md)
3. [Master System and Code Flow](file:///E:/JMS/jms-backend/docs/02_ARCHITECTURE/MASTER_SYSTEM_AND_CODE_FLOW.md)
4. [ADR Index](file:///E:/JMS/jms-backend/docs/13_DECISIONS/ADR_INDEX.md)

---

# 🔑 System Answers Quick Index

* **What is JMS?** → [PROJECT_OVERVIEW.md](file:///E:/JMS/jms-backend/docs/00_START_HERE/PROJECT_OVERVIEW.md)
* **What did the legacy system do?** → [Legacy Features](file:///E:/JMS/jms-backend/docs/01_BUSINESS/LEGACY_SYSTEM/LEGACY_FEATURES.md)
* **What does the target ERP scope require?** → [Complete Build Scope](file:///E:/JMS/jms-backend/docs/01_BUSINESS/ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md)
* **What is already implemented & tested?** → [CURRENT_STATUS.md](file:///E:/JMS/jms-backend/docs/00_START_HERE/CURRENT_STATUS.md)
* **Where are the API endpoints documented?** → [Frontend API Handover](file:///E:/JMS/jms-backend/docs/05_API/FRONTEND_API_HANDOVER.md)
* **Where are phase completion reports stored?** → [Phase 4 Completion Report](file:///E:/JMS/jms-backend/docs/11_REPORTS/COMPLETION/PHASE_4_FINAL_COMPLETION_REPORT.md) & [10_PHASES](file:///E:/JMS/jms-backend/docs/10_PHASES/)
