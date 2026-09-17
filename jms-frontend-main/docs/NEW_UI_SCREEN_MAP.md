# JMS NEW UI SCREEN MAP

This document maps the authoritative reference screenshots located in `jms-frontend/New UI/` to the target pages and modules in the existing JMS (Jewellery Management System) codebase.

---

## 1. Reference Screenshots to JMS Routes Mapping

| Reference Screenshot | Reference Module Title | Primary Target JMS Route(s) | JMS Components & Pages | Key Design Patterns to Reproduce |
| :--- | :--- | :--- | :--- | :--- |
| `login.jpeg` | Login Screen (Role Based) | `/login` | `src/pages/Login.tsx` | Two-column split layout, dark navy/purple branding left panel with gold crown logo, white right card with clean role selection grid + PIN login button, copyright and version footer. |
| `admin dashboard.jpeg` | Dashboard (Admin View) | `/` | `src/pages/Dashboard.tsx` | Dark sidebar with purple active state, white header with branch selector & date pill, 4x3 stat card grid with clean icons, live metal rate cards (22K, 23K/24K), recent transactions table. |
| `cahsier.jpeg` | Cashier Module | `/cashier`, `/sales/pos`, `/sales/payments` | `src/pages/Cashier.tsx`, `src/pages/SalesPayments.tsx` | Module action grid layout (Daily Cash Book, Box Tag In, Box Tag Out, To Do Task, Work Book, Order Register) with colored icon badges and clean subtitles. |
| `maintain.jpeg` | Maintain Module (Main Screen) | `/maintain`, master data pages (`/customers`, `/vendors`, `/categories`, `/products`, `/branches`, `/users`, `/roles`, etc.) | `src/pages/Maintain.tsx`, master data pages | Sectioned master card grids (Accounts, Sub Accounts, Account Groups, Item setup) with action cards (`Add`, `Delete`, `Modify`, `List`) and category quick-pill navigation at bottom. |
| `item master.jpeg` | Item Master (Add / Edit) | `/inventory-items/new`, `/inventory-items/:id`, `/products` | `src/pages/InventoryItemDetail.tsx`, `src/pages/Products.tsx` | Clean tabbed modal/form layout (`General Details`, `Additional Details`, `Pricing`, `Image & Docs`, `Stock Details`), 2-column input grid, barcode generator, square image uploader with dotted dropzone, bottom action buttons (`Save (F9)`, `Save & New`, `Clear`, `Cancel`). |
| `item stock.jpeg` | Item Wise Stock | `/inventory-items`, `/stock-movements` | `src/pages/InventoryItems.tsx`, `src/pages/StockMovements.tsx` | Top filter bar (Branch, Category dropdowns, Search input with icon, Filter button), clean standard data table with green `In Stock` dot status badges, bottom action bar (`+ Add Item`, `Stock Transfer`, `Stock Adjustment`, `Print`, `Export`). |
| `retailer POS.jpeg` | Retailer POS (Billing Screen) | `/sales/pos`, `/pos-billing` | `src/pages/POSBilling.tsx` | Customer header bar (Bill No, Date, Customer, Mobile), item search input with shortcut tags `(F2)` & `+ Add Item (F3)`, detailed items table (S.No, Item Code, Description, Purity, Gross Wt, Stone Wt, Net Wt, Rate/gm, Making%, Amount), right summary card with totals breakdown, bottom keyboard shortcut action buttons (`Hold (F6)`, `Discount (F7)`, `Remove (Del)`, `Payment (F8)`). |
| `sale on approval.jpeg` | Sale on Approval | `/approvals` | `src/pages/ApprovalDashboard.tsx`, `src/pages/ApprovalList.tsx` | Clean feature action grid (`Sale Voucher`, `Sale Return Voucher`, `Approval List`, `Daily Reminder List`, `Live Rates`), bottom banner notice (`All types of Payments Modes Supported`). |

---

## 2. Global Module Coverage

Every route in `App.tsx` inherits this universal visual system:

1. **Global App Shell & Sidebar**: Deep purple-navy (`#0D0B18` / `#161224`) sidebar with gold crest brand logo (`JSJ JEWELLERS`), active menu highlight (`#2A1F45` with gold/white typography), crisp monochrome icons.
2. **Global Header**: Clean top bar with Branch Selector dropdown, Date pill (`21 May 2025`), Search button, Red notification badge, and Admin User profile pill.
3. **Global Master & Detail Design**: Grid action cards for hub pages (Maintain, Cashier, Approval, Girvi) and uniform 1px bordered clean white data tables for registers.
