# AgriMark Frontend Design System & Design DNA (Stitch Source of Truth)

Authoritative visual and design system specification extracted from Stitch projects:
- **AgriMark 3D Intelligence Landing Page** (`projects/4468772449935595295`)
- **AgriMark Agriculture Ecosystem** (`projects/14593492555073215209`)

---

## 1. Visual Ethos: "Agro-Industrial Sovereign & Precision Telemetry"

The AgriMark frontend design system balances sovereign agronomic heritage with high-density precision software instrumentation. It bridges high-glare field usability for farmers and mandi traders with high-fidelity analytical surfaces for buyers, agronomists, FPOs, and logistics managers.

---

## 2. Color Palette & Chromatic Tokens

### Primary Brand Palette
- **Chlorophyll Emerald / Deep Forest (`#1B4D3E` / `rgb(27, 77, 62)`)**: Primary brand container and navigation anchor.
- **Harvest Green (`#3E7B54` / `rgb(62, 123, 84)`)**: Secondary active states, healthy crop yield indicators, and positive trends.
- **Sun Gold / Sovereign Amber (`#E5A93C` / `#D49216`)**: Market pulse signal, active telemetry ticks, CTA highlights, and trade execution triggers.
- **Warm Cotton Cream (`#F7F5EE` / `#E1EFED`)**: Primary text and high-contrast editorial reader surfaces to prevent eye strain.
- **Loam Black / Void Substrate (`#07110D` / `#19201D`)**: Deep canvas background absorbing specular noise.
- **Vitreous Dark Glass (`#121A16` / `#1A241F`)**: Tonal surface containers for card modules, floating sheets, and modals.
- **Sovereign Red / Alert (`#CB1B1B`)**: Critical risk, urgent market drops, and dispute flags.

### Neutral Surface Hierarchy
- `bg-canvas`: `#07110D` (Subterranean Loam Base)
- `bg-surface-low`: `#0A0F0D` (Panel Floor)
- `bg-surface`: `#121A16` (Card Container)
- `bg-surface-high`: `#18241F` (Hover / Elevated Surface)
- `border-glass`: `#1E2D26` / `rgba(255, 255, 255, 0.08)` (Micro Perimeter Highlight)

---

## 3. Typography Scale & Font Hierarchy

- **Display & Headlines**: `Space Grotesk` or `Merriweather`
  - Display Hero: `56px` / `lineHeight: 64px` / `fontWeight: 700`
  - Headline LG: `32px` / `lineHeight: 40px` / `fontWeight: 600`
  - Headline MD: `24px` / `lineHeight: 32px` / `fontWeight: 600`
  - Headline SM: `20px` / `lineHeight: 28px` / `fontWeight: 500`

- **Interface & Prose**: `Plus Jakarta Sans`
  - Body XL: `18px` / `lineHeight: 28px`
  - Body LG: `16px` / `lineHeight: 24px`
  - Body MD: `14px` / `lineHeight: 20px`
  - Body SM: `12px` / `lineHeight: 16px`

- **Telemetry & Micro-labels**: `JetBrains Mono`
  - Label LG: `13px` / `letterSpacing: 0.04em` / `uppercase`
  - Label MD: `11px` / `letterSpacing: 0.06em` / `uppercase`
  - Label SM: `10px` / `letterSpacing: 0.08em` / `uppercase`

---

## 4. Layout, Spacing & Corner Radii

### Grid Systems
- **Desktop (1200px+)**: 12-column adaptive fluid grid (`gutter: 1.5rem`, `margin: 2rem-3rem`).
- **Tablet (768px - 1199px)**: 8-column layout (`gutter: 1.25rem`).
- **Mobile (<768px)**: 4-column single-stack layout (`gutter: 1rem`).

### Corner Radii
- `rounded-sm`: `0.25rem` (4px) — Telemetry chips, badges, input controls
- `rounded-md`: `0.375rem` (6px) — Tactical buttons
- `rounded-lg`: `0.5rem` (8px) — Cards, inventory lists
- `rounded-xl`: `0.75rem` (12px) — Structural containers, modals
- `rounded-2xl`: `1rem` (16px) — Major drawers, onboarding sheets
- `rounded-full`: `9999px` — Status dots, avatar rings

---

## 5. Reusable Component Patterns (`web/src/components/stitch/`)

1. **Navigation & Layout**: `StitchNavbar`, `StitchSidebar`, `StitchFooter`, `StitchMobileDock`
2. **Dashboard Modules**: `TelemetryCard`, `CropMetricsGrid`, `MandiPriceTicker`, `WeatherWidget`
3. **Marketplace & Orders**: `ListingCard`, `MandiAuctionTerminal`, `EscrowStatusBadge`, `RFQDrawer`
4. **Agronomy & Field Operations**: `CropStageProgress`, `SoilHealthPanel`, `ScoutingObservationCard`, `HarvestTallySheet`
5. **AI Assistant**: `AgriAiChatWindow`, `VoiceCommandTrigger`

---

## 6. Functional Integrity Rules

- **Data Binding**: All visual components read directly from real application services (Supabase tables, Weather OpenWeather gateway `/api/v1/interoperability/weather`, AgriMark AI `/api/v1/ai`).
- **Auth & Authorization**: Firebase Auth + Supabase session sync. Role protection strictly enforced.
- **Production Asset Pipeline**: Assets served locally under `/public/images/` or Next.js optimized paths.
