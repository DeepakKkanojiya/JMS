---
title: JMS High-Level Project Overview
type: START_HERE
status: ACTIVE
authority: AUTHORITATIVE
last_updated: 2026-08-20
owner: JMS Architecture Team
related:
  - README.md
  - DOCUMENTATION_MAP.md
  - CURRENT_STATUS.md
  - ../01_BUSINESS/ERP_SCOPE/COMPLETE_JMS_BUILD_SCOPE.md
  - ../02_ARCHITECTURE/MASTER_SYSTEM_AND_CODE_FLOW.md
---

# 💎 JMS — Jewellery Management System: High-Level Overview

## 1. Executive Summary

The **Jewellery Management System (JMS)** is a modern, enterprise-grade cloud ERP and Point of Sale (POS) backend built for jewellery retailers, wholesalers, manufacturers, and pawnshops.

JMS replaces legacy desktop-bound software with a scalable, highly secure, audit-compliant 5-Layer Node.js/TypeScript system powered by Express v5, Prisma 7, PostgreSQL 18, and Redis.

---

# 2. Business Objectives & System Vision

Modern jewellery businesses face unique operational challenges that standard retail ERPs cannot address:

1. **Multi-metal & Dynamic Pricing**: Real-time metal rate tracking (Gold, Silver, Platinum), purity carats (24K, 22K, 18K), board rate locking, and automated making charge / wastage calculations.
2. **Item-Level Traceability**: Individual item tagging with unique Serial numbers, Barcode/QR codes, and RFID electronic tags, tracking metal weight, stone weight, net weight, wastage, and gross value.
3. **Complex Settlement Workflows**: Mixed payment methods (Cash, Card, UPI, Bank Transfer), customer Gold Exchange (Old Gold trade-in with purity testing and melting deduction), and store credit / advance adjustments.
4. **Artisan / Karigar Job Work**: Issuing raw metal/stones to artisans, tracking metal loss/wastage, and receiving finished jewellery.
5. **Girvi / Pawn Broking**: Collateral loan management, interest calculation, monthly collection, self vs 3rd-party pawn tracking, and loan redemption/foreclosure.

---

# 3. Evolutionary Architecture & Legacy Migration Strategy

JMS is engineered around three clear layers of requirement evolution:

```text
┌─────────────────────────────────────────────────────────┐
│              Target Jewellery ERP Scope                  │
│  (Cognieos Proposal: Cloud, RFID, Mobile, Multi-Branch)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Existing Legacy Business Reference           │
│    (Preserves real-world workflows, GST, Day Close)     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               JMS Backend Implementation                │
│    (5-Layer Clean Architecture, Prisma 7, PostgreSQL 18)│
└─────────────────────────────────────────────────────────┘
```

### Core Architecture Highlights:
* **Strict 5-Layer Design**: Router → Controller → Service → Repository → Database (Prisma ORM).
* **Multi-Branch Multi-Company Isolation**: Enterprise-grade tenant isolation with branch-scoped data security.
* **ACID Transaction Boundaries**: All inventory stock transfers, POS billing, payment settlements, and debit/credit notes run inside strict database transactions.
* **Dynamic Database RBAC**: Fine-grained role-based access control evaluated dynamically per request.
