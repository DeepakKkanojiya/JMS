# JMS DESIGN SYSTEM (CLIENT REFERENCE EDITION)

Extracted from authoritative client reference screenshots (`jms-frontend/New UI/`).

---

## 1. Color Palette

```css
:root {
  /* Primary Sidebar & Shell */
  --jms-sidebar-bg: #0F0A1C;
  --jms-sidebar-active: #2C2045;
  --jms-sidebar-border: #1E1633;
  --jms-gold-brand: #D4AF37;
  --jms-gold-light: #E6CA65;

  /* Surfaces & Backgrounds */
  --jms-app-bg: #F4F5F8;
  --jms-card-bg: #FFFFFF;
  --jms-border-light: #E5E7EB;

  /* Typography Colors */
  --jms-text-heading: #111827;
  --jms-text-body: #374151;
  --jms-text-muted: #6B7280;
  --jms-text-dim: #9CA3AF;

  /* Interactive & Status */
  --jms-primary-button: #2B1C4B;
  --jms-primary-button-hover: #3E2B6B;
  --jms-accent-green: #10B981;
  --jms-accent-red: #EF4444;
  --jms-accent-blue: #3B82F6;
  --jms-accent-orange: #F97316;
}
```

---

## 2. Typography

- **Font Family**: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
- **Headings**:
  - H1 Page Header: `1.4rem` / `22px`, Weight `700`
  - H2 Section Header: `1.15rem` / `18px`, Weight `700`
  - Card Title: `0.95rem` / `15px`, Weight `700`
- **Body & Controls**:
  - Inputs / Buttons: `0.85rem` / `13.5px`, Weight `600`
  - Table Cell Text: `0.82rem` / `13px`, Weight `500`
  - Table Header Text: `0.72rem` / `11.5px`, Weight `700`, Uppercase, Letter-spacing `0.05em`
  - Badge / Tag Text: `0.7rem` / `11px`, Weight `700`

---

## 3. Component Specs

### Stat / KPI Card
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Radius**: `10px`
- **Padding**: `16px 18px`
- **Shadow**: `0 1px 3px rgba(0,0,0,0.05)`

### Action Card (Maintain, Cashier, Approval Hubs)
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Radius**: `12px`
- **Padding**: `18px`
- **Icon Container**: `42px x 42px`, `borderRadius: 10px`
- **Title**: `0.92rem`, Weight `700`, Color `#111827`
- **Subtitle**: `0.78rem`, Weight `500`, Color `#6B7280`

### Table Styling
- **Header**: `#FAFBFD`, bottom border `1.5px solid #E5E7EB`
- **Rows**: `#FFFFFF`, hover `#F8FAFC`, bottom border `1px solid #F3F4F6`
- **Row Height**: `44px`
- **Status Dot Badge**: Green `#10B981` dot + `#10B981` text for In Stock.

### Buttons & Shortcuts
- **Primary Action (Save / Payment)**: Background `#2B1C4B`, Color `#FFFFFF`, Radius `6px`
- **Secondary Action (Clear / Cancel)**: Background `#FFFFFF`, Border `1px solid #E5E7EB`, Color `#374151`
- **Keyboard Shortcut Tag**: `(F9)`, `(F8)`, `(F2)` enclosed in parenthesis beside action label.
