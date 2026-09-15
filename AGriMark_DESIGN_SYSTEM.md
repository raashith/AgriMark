# AgriMark — Canonical Design System & UI Tokens

**Project Target:** `AgriMark — Indian Agriculture Ecosystem` (Google Stitch Project `projects/15539262927297017189`)  
**Visual Aesthetic:** Agricultural Modernism  
**Primary Color System:** Chlorophyll Emerald (`#1B4D3E`), Harvest Green (`#3E7B54`), Sun Gold (`#E5A93C`), Warm Cotton Cream (`#F7F5EE`), Loam Black (`#19201D`).

---

## 1. Aesthetic Foundations

AgriMark embodies **Agricultural Modernism**—a visual framework that synthesizes agrarian Indian heritage with precision commodity software.

- **Outdoor Sunlight High-Acuity Legibility:** High contrast ratios (>13.8:1 WCAG AAA) and warm cream backgrounds (`#F7F5EE`) prevent eye strain and sunlight glare for farmers in open fields and mandi yards.
- **Dual Type Architecture:** Humanist `Plus Jakarta Sans` for titles, forms, and interface labels paired with tabular `JetBrains Mono` for mandi tickers, weights, serial codes, and currency amounts.
- **Ergonomic Touch Targets:** Minimum 48px to 56px touch zones on mobile devices to support single-hand operation in demanding field conditions.

---

## 2. Design Tokens & Palette Specifications

### Color Palette

| Token Identifier | Hex Code | Role & Usage Description |
| :--- | :--- | :--- |
| `primary` | `#1B4D3E` | Deep Chlorophyll Emerald — Sovereign header tone, main CTA buttons, active navigation, primary balance tiles. |
| `secondary` | `#3E7B54` | Harvest Green — Verified crop lot badges, yield growth indicators, secondary action buttons. |
| `tertiary` | `#E5A93C` | Sun Gold — Liquidity triggers, spot market bids, escrow release buttons, trade alerts. |
| `canvas` | `#F7F5EE` | Warm Cotton Cream — Main page background plane preventing bright daylight glare. |
| `surface` | `#FFFFFF` | Card Clean Surface — Elevated cards and modules providing spatial separation over cotton canvas. |
| `dark-text` | `#19201D` | Loam Black — High contrast primary body text without glare vibration. |
| `border-husk` | `#E2DDD1` | Hairline card border outlines, input container rules, table row dividers. |
| `status-success` | `#257042` | Field Green — KYC verified, escrow payment released, crop harvested. |
| `status-warning` | `#D97706` | Amber Ochre — Weather advisories, moisture alerts, pending weighments. |
| `status-danger` | `#B91C1C` | Rust Crimson — Critical pest alerts, order cancellations, open disputes. |
| `status-info` | `#2A6F8F` | Monsoon Indigo — Irrigation schedules, satellite radar, cold-chain GPS telemetry. |
| `dark-surface` | `#121A16` | Terminal Surface — AgriAI glassmorphism, diagnostic camera viewports, dark mode cards. |

---

## 3. Typography Scale

```
+---------------------------------------------------------------------------------------+
| Plus Jakarta Sans (Interface Engine)                                                 |
| display-lg (40px/800), headline-lg (28px/700), headline-md (22px/700), body-lg (17px) |
+---------------------------------------------------------------------------------------+
| JetBrains Mono (Telemetry & Quantitative Engine)                                     |
| data-metric-lg (28px/700), data-metric-sm (16px/600), label-sm (11px/700)             |
+---------------------------------------------------------------------------------------+
```

---

## 4. Spacing, Elevation & Layout

- **Spacing Rhythm:** 4px / 8px base rhythm (`0.25rem`, `0.5rem`, `1.0rem`, `1.5rem`, `2.5rem`).
- **Elevation:**
  - `Level 0`: Flat `#F7F5EE` canvas.
  - `Level 1`: `#FFFFFF` surface card with `1px solid #E2DDD1` border and contact shadow `0 2px 6px -1px rgba(27,77,62,0.05)`.
  - `Level 2`: `#FFFFFF` floating modal with shadow `0 8px 20px -4px rgba(27,77,62,0.08)`.
  - `Level 3`: Sticky 64px bottom navigation dock with shadow `0 14px 32px -4px rgba(27,77,62,0.14)`.
