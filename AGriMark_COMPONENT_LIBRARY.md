# AgriMark — Component Library Specification

**Package Target:** `@/components/agrimark-ui` & `@/components/ui`  
**Design Tokens:** Agricultural Modernism (`#1B4D3E`, `#3E7B54`, `#E5A93C`, `#F7F5EE`, `#1C1917`)

---

## 1. Reusable Component Inventory

### 1. `AgriButton` (`AgriButton.tsx`)
- **Touch Target:** Minimum height 48px–56px.
- **Variants:**
  - `primary`: Background `#1B4D3E`, Text `#FFFFFF`, Hover `#143B30`, Pill contour.
  - `secondary`: Background `#F6F4ED`, Text `#1B4D3E`, Border `#E7E5DC`.
  - `accent`: Background `#D97706` (Sun Gold), Text `#FFFFFF`.
  - `outline`: Surface `#FFFFFF`, Border `#E7E5DC`, Text `#1C1917`.
  - `danger`: Background `#DC2626`, Text `#FFFFFF`.

### 2. `AgriCard` (`AgriCard.tsx`)
- **Shell Layout:** `rounded-2xl p-4 md:p-6 transition-all border shadow-sm`
- **Variants:**
  - `default`: Background `#121a16`, Border `#1e2d26`, Text `#F3F4F6`.
  - `highlight`: Background `#121a16`, Border Emerald `#059669`, Ring highlight.
  - `alert`: Background `#121a16`, Border Amber `#D97706`, Ring warning.
  - `dark`: Background `#0a0f0d`, Border `#1e2d26`.

### 3. `AgriDock` (`AgriDock.tsx`)
- **Position:** Fixed 64px bottom dock for mobile viewports (`md:hidden`).
- **Items:**
  1. `Home` (`/farmer/dashboard`)
  2. `My Farm` (`/farmer/farms`)
  3. `AgriAI` (Center elevated floating 56px action button with microphone/bot icon)
  4. `Bazaar` (`/marketplace`)
  5. `Khaata` (`/finance`)

### 4. `AgriHeader` (`AgriHeader.tsx`)
- **Persistent Header:** Includes back navigation arrow, current page title, live weather & APMC mandi price ticker (`☀️ 28°C • Nashik ₹2,450/q`), bilingual language switcher (`தமிழ்`), and authenticated user role avatar.

### 5. `AgriBadge` (`AgriBadge.tsx`)
- **Variants:** `emerald`, `amber`, `blue`, `purple`, `red`, `gray`.
- **Typography:** `JetBrains Mono` / `Plus Jakarta Sans` 11px uppercase label.

### 6. `EmptyState` (`EmptyState.tsx`)
- **Role:** Handles zero-data query responses gracefully with icon, title, description, and primary CTA.

### 7. `Skeleton` (`Skeleton.tsx`)
- **Role:** Shimmer loading state placeholder during API/Supabase fetches.
