# AgriMark — Operational Route & Component Mapping Matrix

---

## 1. Complete Route Mapping Matrix

| Route Path | Associated Stitch Screen | Primary Role | Responsive Form Factor | Primary Action | Data Source & Supabase Table | Empty State Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `splash_app_loading` | Public | Full-screen video / hero | Select Role / Login | Auth session check | Hero splash cards |
| `/auth/login` | `agrimark_login_auth` | Public | Mobile stack / Centered card | Log In (OTP/Google/Pass) | `auth.users` | Clean input form |
| `/auth/register` | `agrimark_login_auth` | Public | Mobile stack / Centered card | Create Account | `auth.users`, `profiles` | Clean signup form |
| `/auth/onboarding` | `choose_your_role` | Unauthenticated | Step-based wizard | Choose Role & Submit | `profiles` insert | Role choice cards |
| `/onboarding/farmer` | `farmer_onboarding_farm_setup` | Farmer | Step wizard | Add First Farm | `farms` insert | Form input |
| `/farmer/dashboard` | `agrimark_farmer_dashboard_1` | Farmer | 4-col Mobile / 12-col Desktop | Quick Harvest / Check Price | `farms`, `cultivations`, `harvest_batches` | `<EmptyState message="No farms added yet" />` |
| `/farmer/farms` | `my_farm_crop_passport` | Farmer | Card list / Desktop split | Add New Farm Land | `farms`, `farm_details` | `<EmptyState message="No farm lands found" />` |
| `/farm/new` | `add_farm_land_survey` | Farmer | Form / GeoJSON picker | Save Farm Boundary | `farms` insert | Input form |
| `/farm/[id]` | `farm_details_shree_ganesh_krishi_farm` | Farmer | Metric grid / Soil breakdown | Log Soil Test | `farms` JOIN `farm_details` | `<Skeleton />` loaders |
| `/farm/[id]/crops/new` | `crop_plan_phenology_calendar` | Farmer | Interactive stage arc | Plant Crop | `crop_catalog`, `cultivations` | Catalog dropdown |
| `/crops/[cropId]/timeline`| `smart_crop_timeline_labour_ledger` | Farmer | Timeline feed | Dispatch Worker Task | `farm_tasks`, `farm_labor_logs` | Timeline skeleton |
| `/crops/[cropId]/scout` | `field_scouting_pest_observation` | Farmer | Mobile camera / Form | Scan Pest / Save Memo | `field_observations` insert | Scan camera placeholder |
| `/farm/[id]/inputs` | `input_inventory_application_tracker` | Farmer | Bar progress / Inventory grid | Record Input Usage | `farm_input_logs` | Empty shed state |
| `/crops/[cropId]/harvest/new`| `record_harvest_sorting_tally` | Farmer | Tally form | Generate Lot Code | `harvest_batches` insert | Input form |
| `/produce` | `produce_inventory_lot_ledger` | Farmer / FPO | Tonnage ledger / Filters | List Lot for Sale | `produce_lots` JOIN `harvest_batches` | `<EmptyState message="No produce lots logged" />` |
| `/marketplace` | `agrimark_live_marketplace` | Public / Buyer | Grid list / Price ticker bar | Buy Produce / Bid | `listings` JOIN `produce_lots` | `<EmptyState message="No active listings" />` |
| `/marketplace/search` | `agrimark_marketplace_search_filters` | Buyer | Filter sidebar / Cards | Filter by Distance/Grade | `listings` (PostGIS query) | Filter result skeleton |
| `/product/[id]` | `produce_lot_farmer_trust_details` | Buyer | Passport card / Escrow bar | Initiate Escrow Checkout | `listings`, `produce_lots`, `farms` | Product skeleton |
| `/checkout/[listingId]` | `checkout_escrow_order_confirmation` | Buyer | 3-tier milestone card | Lock Funds in Escrow | `marketplace_orders`, `escrow_accounts` | Order preview card |
| `/buyer/marketplace` | `buyer_procurement_dashboard` | Buyer | Bulk table / Map view | Place RFQ | `marketplace_orders` | `<EmptyState message="No active procurements" />` |
| `/buyer/rfqs` | `agrimark_buyer_rfq_procurement` | Buyer | RFQ builder | Submit RFQ to Mandi | `rfqs` insert | RFQ list empty state |
| `/farmer/orders` | `farmer_orders_mandi_dispatches` | Farmer | Order queue / Gate pass | Issue Gate Pass | `marketplace_orders` | Orders empty state |
| `/logistics/track/[orderId]`| `in_transit_reefer_cold_chain_gps_tracking` | Buyer / Logistics | Live GPS Map / Telemetry | Monitor Reefer Temp | `order_shipments`, reefer logs | Map loading shimmer |
| `/logistics/gate-pass/[orderId]`| `dock_gate_pass_unloading_qr_bay_2` | Driver / Logistics | High-contrast QR card | Scan Gate Pass | `dock_appointments` | Gate pass barcode card |
| `/admin/disputes` | `dispute_resolution_mandi_arbitrator_desk` | Admin / Arbitrator | Audit table / Evidence view | Release or Freeze Escrow | `disputes`, `dispute_evidence` | Dispute table empty |
| `/finance` | `farm_khaata_crop_profitability` | Farmer | Cashflow feed / ROI tiles | Download KCC Report | `farmer_finance_entries` | Khaata ledger empty state |
| `/ai-assistant` | `agriai_multilingual_assistant` | All Users | Conversational chat bar | Ask AgriAI / Voice Query | `/api/agri-ai` streaming endpoint | Initial prompt suggestions |

---

## 2. Production UI State Requirements

Every route MUST implement the standard AgriMark state machine:
1. **Loading / Shimmer**: Render `<Skeleton />` bounding blocks during network fetch.
2. **Empty Data**: Render `<EmptyState title="..." description="..." actionLabel="..." />` when database returns `[]`.
3. **Error / Offline**: Non-blocking toast alerts with retry action button.
4. **Populated Data**: Pixel-perfect rendering using `agrimark-ui` tokens and components.
