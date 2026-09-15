# AgriMark — Visual Design Specification & Design System Architecture

*Source of Truth: Google Stitch Project `projects/14593492555073215209`*

---

## 🌾 1. Aesthetic Philosophy: "Agricultural Modernism"

AgriMark embodies **Agricultural Modernism**—a visual language that balances sovereign agronomic heritage with precision software engineering. It bridges two distinct user contexts:
1. **High-Glare Outdoor Field Environments**: Used by Indian progressive farmers, mandi traders, and field agronomists in high ambient daylight and variable connectivity.
2. **Analytical Trading Terminals**: Demanded by commodity buyers, ag-lenders, FPO managers, and institutional supply chains.

The visual direction is **tactile, grounded, and premium**. Instead of sterile SaaS whites, the canvas uses sun-warmed field cotton creams (`#F7F5EE`) paired with deep chlorophyll emeralds (`#1B4D3E`) and luminous harvest gold accents (`#E5A93C`).

---

## 🎨 2. Palette Architecture & Color Tokens

### Core Color Palette

| Token Name | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| **Primary (Chlorophyll Emerald)** | `#1B4D3E` | Sovereign authority tone. Used for headers, primary CTAs, active navigation, and key balance headers. |
| **Primary Container** | `#1B4D3E` | Surface container for high-emphasis panels. |
| **On Primary** | `#FFFFFF` | Text/icon contrast over Primary surfaces. |
| **Secondary (Harvest Green)** | `#3E7B54` | Growth accent. Applied to positive yield differentials, verified mandi tags, and secondary action buttons. |
| **Secondary Container** | `#ADEFBF` | Light green container for success badges and verified chips. |
| **On Secondary Container** | `#316E48` | Dark green text contrast inside secondary containers. |
| **Tertiary (Sun Gold)** | `#E5A93C` | Liquidity & transaction marker. Used for spot market triggers, escrow releases, and high-priority alerts. |
| **Tertiary Container** | `#5D3F00` | High-density gold container for pending harvest actions. |
| **Canvas Base (Warm Cotton Cream)** | `#F7F5EE` | Primary page background plane. Reduces sunlight glare outdoors compared to pure `#FFFFFF`. |
| **Card Surface** | `#FFFFFF` | Elevated interactive cards for immediate spatial contrast over `#F7F5EE`. |
| **Loam Black (Primary Text)** | `#19201D` | Natural off-black copy providing 13.8:1 WCAG AAA contrast ratio without visual screen glare vibration. |
| **Muted Hairline Border (Dried Husk)** | `#E2DDD1` | Hairline card separators, table row rules, and input container outlines. |

### Semantic Functional Colors

| State | Hex Value | Application |
| :--- | :--- | :--- |
| **Success / Credit** | `#257042` (Field Green) | Payment completed, KYC verified, harvest logged. |
| **Warning / Advisory** | `#D97706` (Amber Ochre) | Weather rain warnings, moisture threshold alerts. |
| **Critical / Pest Alert** | `#B91C1C` (Rust Crimson) | High pest pressure, order cancellation, dispute open. |
| **Info / Weather** | `#2A6F8F` (Monsoon Indigo) | Irrigation schedules, cold storage telemetry. |

---

## ✒️ 3. Typography Hierarchy

### Dual Typeface Engine
1. **Primary Typeface (`Plus Jakarta Sans`)**: Humanist geometric cuts with wide aperture terminals and sturdy x-height. Resists daylight glare degradation across low-cost mobile screens.
2. **Numeric & Telemetry Typeface (`JetBrains Mono`)**: Monospaced tabular alignment applied to mandi commodity prices (₹/quintal), weights (kg/Ton), moisture percentages, geolocation coordinates, and lot numbers.

### Operational Scale

| Style Token | Font Family | Size | Weight | Line Height | Letter Spacing | Operational Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Plus Jakarta Sans | 40px | 800 | 48px | -0.02em | Hero landing headlines |
| `display-lg-mobile` | Plus Jakarta Sans | 32px | 800 | 38px | -0.02em | Mobile hero section titles |
| `headline-lg` | Plus Jakarta Sans | 28px | 700 | 34px | -0.01em | Module headers, Page titles |
| `headline-md` | Plus Jakarta Sans | 22px | 700 | 28px | -0.01em | Section titles, Card headers |
| `headline-sm` | Plus Jakarta Sans | 18px | 600 | 24px | 0.00em | Sub-headers, Drawer titles |
| `body-lg` | Plus Jakarta Sans | 17px | 400 | 26px | 0.00em | Primary body copy, Descriptions |
| `body-md` | Plus Jakarta Sans | 15px | 400 | 22px | 0.00em | Standard body copy |
| `body-sm` | Plus Jakarta Sans | 13px | 400 | 18px | 0.00em | Dense table cell copy, Metadata |
| `data-metric-lg` | JetBrains Mono | 28px | 700 | 32px | -0.03em | Mandi price tickers, Financial totals |
| `data-metric-sm` | JetBrains Mono | 16px | 600 | 20px | -0.01em | Table numeric cells, Weight badges |
| `label-lg` | Plus Jakarta Sans | 15px | 600 | 20px | 0.01em | Primary button labels |
| `label-md` | Plus Jakarta Sans | 13px | 600 | 16px | 0.02em | Secondary button labels, Form labels |
| `label-sm` | Plus Jakarta Sans | 11px | 700 | 14px | 0.04em | Status tags, Badge labels |

---

## 📐 4. Layout, Spacing Rhythm & Elevation

### Spacing Rhythm
Built on a 4px / 8px modular base:
* `space-xs`: `0.25rem` (4px) — Micro icon gap, tight chip padding.
* `space-sm`: `0.5rem` (8px) — Button icon gap, badge padding.
* `space-md`: `1.0rem` (16px) — Card internal padding, form input spacing.
* `space-lg`: `1.5rem` (24px) — Inter-card module gap.
* `space-xl`: `2.5rem` (40px) — Page section separator.

### Viewport Layout Grids

```
+-----------------------------------------------------------------------+
|  DESKTOP VIEWPORT (>1024px)                                           |
|  +----------------+  +---------------------------------------------+  |
|  | Collapsible    |  | Top Header Navbar (Notifications, Search)   |  |
|  | 256px Sidebar  |  +---------------------------------------------+  |
|  |                |  | Main Content Area (Max 1280px Container)    |  |
|  | Navigation     |  | 12-Column Fluid Grid                        |  |
|  +----------------+  +---------------------------------------------+  |
+-----------------------------------------------------------------------+
|  MOBILE VIEWPORT (<640px)                                             |
|  +-----------------------------------------------------------------+  |
|  | Mobile Header & Search Bar                                       |  |
|  +-----------------------------------------------------------------+  |
|  | 4-Column Content Stack                                           |  |
|  | Sticky Bottom Dock Navigation (64px Height)                      |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### Depth & Elevation Levels
* **Level 0 (Field Canvas)**: `#F7F5EE` base plane. Completely flat.
* **Level 1 (Card & Data Panel)**: `#FFFFFF` fill with subtle outline `1px solid #E2DDD1` and contact shadow `0 2px 6px -1px rgba(27, 77, 62, 0.05)`.
* **Level 2 (Interactive Modals & Drawers)**: `#FFFFFF` / `#121a16` with medium shadow lift `0 8px 20px -4px rgba(27, 77, 62, 0.08)`.
* **Level 3 (Action Bars & Quick Trays)**: Sticky bottom navigation dock with olive-tinted lift shadow `0 14px 32px -4px rgba(27, 77, 62, 0.14)`.

---

## 🧱 5. Component Specifications

### 1. Buttons
* **Primary Button (Sovereign Action)**:
  * Resting: `#1B4D3E` background, `#FFFFFF` text, `Plus Jakarta Sans` 15px bold, pill contour (`rounded-full`), minimum 52px height for single-hand touch operation.
  * Pressed: `#13382D` with subtle `scale(0.99)` feedback.
* **Sun Gold Variant**:
  * Resting: `#E5A93C` background with `#19201D` text for commercial commitments.
* **Secondary Button**:
  * Surface `#FFFFFF` or `#0a0f0d` with `1.5px` border in `#1B4D3E` or `#1e2d26`.

### 2. Cards
* **StatCard**: Elevated container displaying top label, large numerical metric in `JetBrains Mono`, trend arrow, and icon badge.
* **ListingCard**: Produce lot tile featuring high-res crop photo, grade badge, quantity available tag, price per unit ticker, and direct procurement CTA.
* **AIInsightCard**: Dark emerald glassmorphism panel (`#121a16`) featuring AI badge, insight headline, bullet points, and action button.

### 3. Data Table (`DataTable`)
* Hairline row dividers (`#E2DDD1`).
* Tabular columns for commodity name, quantity (kg/Ton), price (₹/Qtl), status badge, and action trigger.
* Column numbers formatted strictly in monospaced `JetBrains Mono`.

### 4. Form Fields
* Container style: Filled container in `#FFFFFF` or `#0a0f0d` with `1.5px` border `#E2DDD1` / `#1e2d26`.
* Border transitions to `2px solid #1B4D3E` / `#059669` upon focus.
* Min-height 54px in mobile mode, with floating micro-label (`11px label-sm`) and large input font size (`18px`).

---

## 📱 6. Responsive Breakpoint Standards

1. **Mobile (375px)**: Single column stack, 16px margins, sticky 64px bottom thumb dock, minimum touch targets 48px–56px.
2. **Tablet (768px)**: 2-column card grid, 24px margins, split-panel view for forms and lot lists.
3. **Desktop (1024px+)**: 12-column grid, 32px margins, max-width 1280px, collapsible 256px left navigation sidebar.

---

## 🛡️ 7. Authoritative Data & State Enforcement

1. **No Fake Operational Data**: Never ship hardcoded values for farms, crops, listings, orders, or weather.
2. **Loading Feedback**: Shimmer `Skeleton` placeholders during network requests.
3. **Empty Feedback**: Clean `EmptyState` component with icon, description, and primary CTA when query returns 0 rows.
4. **Error Handling**: Non-blocking `Toast` notifications and inline error banners for retryable failures.
