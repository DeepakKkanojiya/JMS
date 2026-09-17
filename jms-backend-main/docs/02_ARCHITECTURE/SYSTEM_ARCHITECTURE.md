---
title: System Architecture Specification
type: ARCHITECTURE
status: ACTIVE
authority: AUTHORITATIVE
last_updated: 2026-08-20
owner: JMS Architecture Team
related:
  - MASTER_SYSTEM_AND_CODE_FLOW.md
  - DATABASE_ARCHITECTURE.md
  - API_ARCHITECTURE.md
  - ../03_CORE_FOUNDATION/IAM_AUTHENTICATION_AND_RBAC.md
---

# 🏛️ JMS System Architecture Specification

## 1. High-Level Architecture Overview

JMS Backend is built as a highly scalable, stateless RESTful service using Node.js, Express v5, TypeScript, Prisma ORM 7, PostgreSQL 18, and Redis.

The system strictly enforces a **5-Layer Software Architecture Pattern**:

```text
[ HTTP Request ] 
       │
       ▼
[ Express Router ] ──► [ Middleware Layer ]
                           ├── Helmet, CORS, Compression
                           ├── API Rate Limiter
                           ├── Authenticate Token (JWT)
                           ├── Require Permission (Dynamic Database RBAC)
                           └── Request Validation (Zod Schemas)
       │
       ▼
[ Controller Layer ] (Extracts req parameters, invokes service, formats response)
       │
       ▼
[ Service Layer ]    (Business logic, Prisma transactions, state machines, financial math)
       │
       ▼
[ Repository Layer ] (Database abstraction, Prisma query isolation)
       │
       ▼
[ PostgreSQL DB ]    (Prisma Client / Database)
```

---

# 2. Key Architectural Guarantees

1. **Transaction Isolation**: All multi-step mutations (e.g., Sales POS Billing deducting inventory, recording payments, generating invoices, writing audit logs) execute within `prisma.$transaction` blocks with Serializable or Read Committed isolation.
2. **Branch Security Scoping**: Data repositories enforce tenant & branch filtering on all queries to prevent cross-branch data leakage.
3. **Stateless JWT Security**: Requests carry bearer tokens evaluated against dynamic database roles and permissions.

For the comprehensive, step-by-step request lifecycle and module breakdown, refer to [Master System and Code Flow](file:///E:/JMS/jms-backend/docs/02_ARCHITECTURE/MASTER_SYSTEM_AND_CODE_FLOW.md).
