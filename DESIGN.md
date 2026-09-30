# AgriMark Design System & Design DNA (Stitch Source of Truth)

Extracted directly from Stitch Projects:
- **AgriMark Ecosystem Design System** (`projects/14345374774406971474`)
- **AgriMark Agriculture Ecosystem** (`projects/14593492555073215209`)
- **AgriMark 3D Intelligence Landing Page** (`projects/4468772449935595295`)

---

## 1. Brand & Aesthetic Philosophy: "Agricultural Modernism"

This design system expresses **Agricultural Modernism**—a synthesis of agrarian heritage and rigorous digital engineering. It bridges the gap between field pragmatism and institutional commodity trading, serving two primary user groups across India:
1. Progressive farmers, mandi commission agents, and field agronomists working outdoors under intense sunlight, variable network quality, and demanding physical conditions.
2. Institutional agri-buyers, FPO executives, and supply chain analysts operating complex trading, logistics, and settlement desks.

The aesthetic rejects sterile, clinical whites in favor of an organic, tactile, and grounded palette. It pairs sun-warmed cotton canvas surfaces with rich chlorophyll emeralds, harvest greens, and luminous sun-gold accents.

The interaction tone is decisive, dignified, and tactile. Interface elements utilize generous touch zones, robust structural hairline borders, clear spatial hierarchy, and high-visibility typographic contrasting to deliver effortless legibility in outdoor glare while projecting sovereign trust for high-value financial transactions.

---

## 2. Color Palette & Chromatic Tokens

### Primary Palette
- **Primary Chlorophyll Emerald (`#003629` / Container `#1B4D3E`)**: Sovereign tone of authority. Anchors primary calls-to-action, navigation headers, structural anchors, and balance status cards.
- **Secondary Harvest Green (`#2C6A44` / Container `#3E7B54`)**: Botanical indicator of growth and vitality. Applied to confirmed yields, verified mandi lots, progress states, and secondary actions.
- **Tertiary Sun Gold (`#402A00` / Container `#E5A93C`)**: Marker of commerce and immediate liquidity. Highlights market tickers, trade triggers, escrow releases, and key alerts.
- **Background & Canvas Cotton Cream (`#FBF9F2` / Surface Low `#F6F4ED`)**: Foundational canvas plane. Prevents eye fatigue and reduces glare under outdoor sunlight compared to harsh pure white.

### Supporting & Semantic Tokens
- **`loam-black` (`#19201D`)**: Primary copy and structural contrast, achieving an AAA contrast ratio.
- **`card-surface` (`#FFFFFF`)**: Pure elevated surface layer creating spatial separation against the warm cotton background.
- **`husk-border` (`#E2DDD1`)**: Natural, low-intensity hairline border color for card envelopes, dividers, and input borders.
- **`field-green` (`#257042`)**: State token for completed payouts, KYC clearance, and pristine crop health.
- **`amber-ochre` (`#D97706`)**: State token for weather advisories, moisture alerts, and trade timeouts.
- **`rust-crimson` (`#B91C1C` / `#BA1A1A`)**: State token for critical pest threats, lot rejections, and dispute escalations.
- **`monsoon-indigo` (`#2A6F8F`)**: Dedicated to meteorological data, satellite soil moisture, and cold chain telemetry.
- **`terminal-dark` (`#0A0F0D`) & `terminal-surface` (`#121A16`)**: Dark containers reserved for agritech intelligence panels and AI vision viewports.

---

## 3. Typography Architecture

The type system runs on a dual-engine architecture:

1. **Plus Jakarta Sans (Humanist Interface Engine)**: Serves all interface headings, conversational elements, form labels, and operational instructional copy.
2. **JetBrains Mono (Telemetry & Quantitative Engine)**: Deployed strictly for analytical and computational data—mandi price rates (`₹/Qtl`), bag tallies, moisture percentages, geolocation coordinates, and lot identification serials.

### Typography Token Hierarchy
- `display-lg`: Plus Jakarta Sans, 40px, Weight 800, Line-height 48px, Letter-spacing -0.02em
- `headline-lg`: Plus Jakarta Sans, 28px, Weight 700, Line-height 34px, Letter-spacing -0.01em
- `headline-md`: Plus Jakarta Sans, 22px, Weight 700, Line-height 28px, Letter-spacing -0.01em
- `headline-sm`: Plus Jakarta Sans, 18px, Weight 600, Line-height 24px
- `body-lg`: Plus Jakarta Sans, 17px, Weight 400, Line-height 26px
- `body-md`: Plus Jakarta Sans, 15px, Weight 400, Line-height 22px
- `body-sm`: Plus Jakarta Sans, 13px, Weight 400, Line-height 18px
- `data-metric-lg`: JetBrains Mono, 28px, Weight 700, Line-height 32px, Letter-spacing -0.03em
- `data-metric-sm`: JetBrains Mono, 16px, Weight 600, Line-height 20px, Letter-spacing -0.01em
- `label-lg`: Plus Jakarta Sans, 15px, Weight 600, Line-height 20px, Letter-spacing 0.01em
- `label-md`: Plus Jakarta Sans, 13px, Weight 600, Line-height 16px, Letter-spacing 0.02em
- `label-sm`: Plus Jakarta Sans, 11px, Weight 700, Line-height 14px, Letter-spacing 0.04em

---

## 4. Layout, Elevation & Corner Radii

### Layout Grid Rhythms
- **Mobile (<640px)**: 4-column fluid layout (`margin: 1rem`, `gutter: 1rem`), sticky bottom thumb dock (64px safe height).
- **Tablet (641px–1023px)**: 8-column layout (`margin: 1.5rem`, `gutter: 1.5rem`).
- **Desktop (≥1024px)**: 12-column layout (`margin: 2rem`, `gutter: 1.5rem`), bound to a maximum width of 1280px.

### Elevation Layers
- **Level 0 (Field Canvas)**: Flat `#FBF9F2` surface.
- **Level 1 (Operational Cards)**: `#FFFFFF` card surface wrapped in 1px solid `#E2DDD1` border with subtle contact shadow `0 2px 6px -1px rgba(27, 77, 62, 0.05)`.
- **Level 2 (Dropdowns & Modals)**: `#FFFFFF` lifted with `0 8px 20px -4px rgba(27, 77, 62, 0.08)` and bordered with `#E2DDD1`.
- **Level 3 (Action Bars & Docks)**: Floated control planes with shadow `0 14px 32px -4px rgba(27, 77, 62, 0.14)`.
- **Agronomic Dark Glass**: `#121A16` container with 1px border `rgba(255, 255, 255, 0.08)` and ambient glow `0 12px 30px -4px rgba(0, 0, 0, 0.4)`.

### Corner Radii
- `rounded-sm`: 4px (`0.25rem`) — Table containers, metric badges, small chips
- `rounded-md`: 8px (`0.5rem`) — Default input fields, standard cards
- `rounded-lg`: 12px (`0.75rem`) — Produce lot cards, diagnostic containers
- `rounded-xl`: 16px (`1rem`) — Action sheets, onboarding drawers
- `rounded-full`: 9999px — Status dots, primary CTA buttons, grade badges

---

## 5. Screen Inventory & Inspection Map

- **Farmer Dashboard** (`projects/14345374774406971474/screens/afad98439a29422ca539bd908c2221d8`)
- **Farm Operations & Phenology** (`projects/14345374774406971474/screens/66b1922fcad2419bb9ddd75aa63873c6`)
- **Marketplace & Mandis** (`projects/14345374774406971474/screens/582f273e85ca4e09a8acab8add4a33ee`)
- **Buyer Procurement & RFQs** (`projects/14345374774406971474/screens/9aab766ccf0940c7b9118f6f65b97c87`)
- **Auth & Role Onboarding** (`projects/14345374774406971474/screens/e86a6f94684b4028a63145656dd88ff2`)
- **AgriAI Advisory** (`projects/14345374774406971474/screens/356661a03f2240c8b5717324cd5a53d0`)
- **FPO Aggregation & Pooling** (`projects/14345374774406971474/screens/cfc48826067d484c92f18d92308c50e1`)
- **Farm & Traceability** (`projects/14345374774406971474/screens/2effe929b04e48ccbda84eb725647c74`)
