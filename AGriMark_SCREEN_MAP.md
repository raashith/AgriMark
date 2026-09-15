# AgriMark — Comprehensive Screen Inventory & Application Map

**Source Package:** `stitch_agrimark_agriculture_ecosystem.zip`  
**Stitch Project:** `AgriMark — Indian Agriculture Ecosystem` (`projects/15539262927297017189`)

---

## 1. Screen Inventory & Categorization

| # | Screen Directory Name | Category | Primary Target User | Key Visual & Functional Purpose |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `splash_app_loading` | **PUBLIC** | All Users | Initial full-screen splash video/logo intro & auth session checker. |
| 2 | `choose_your_role` | **ONBOARDING** | Unauthenticated | 4-card role selector (`FARMER`, `BUYER`, `FPO`, `LOGISTICS`). |
| 3 | `agrimark_login_auth` | **AUTH** | All Users | Login portal supporting Mobile Phone OTP, Email/Password, and Google OAuth. |
| 4 | `farmer_onboarding_farm_setup` | **ONBOARDING** | Farmer | Step-by-step 7/12 land record, village, taluka, and acreage initialization. |
| 5 | `agrimark_farmer_dashboard_1` | **FARMER** | Farmer | Today's Focus command deck, weather chip, pending dispatches, price alerts. |
| 6 | `agrimark_farmer_dashboard_2` | **FARMER** | Farmer | Compact crop summary variant with soil health & irrigation widgets. |
| 7 | `agrimark_farmer_dashboard_3` | **FARMER** | Farmer | Analytics-dense farm telemetry dashboard for multi-plot holdings. |
| 8 | `my_farm_crop_passport` | **FARM** | Farmer / Public | Plot summary, acreage breakdown, active cultivations, soil pH & organic carbon. |
| 9 | `add_farm_land_survey` | **FARM** | Farmer | GeoJSON boundary selector, survey number input, irrigation source. |
| 10 | `farm_details_shree_ganesh_krishi_farm` | **FARM** | Farmer | Detailed plot-level soil carbon, NPK balance, moisture telemetry, historical yields. |
| 11 | `crop_plan_phenology_calendar` | **CROP** | Farmer | 4-stage phenology arc (Sowing $\rightarrow$ Vegetative $\rightarrow$ Flowering $\rightarrow$ Harvest). |
| 12 | `smart_crop_timeline_labour_ledger` | **CROP** | Farmer | Task timeline dispatch, worker task vouchers (hired vs family labor), foliar spray. |
| 13 | `field_scouting_pest_observation` | **CROP** | Farmer | 3-tier crop health selector, photo scanner preview, audio memo recorder, GPS stamp. |
| 14 | `input_inventory_application_tracker` | **CROP** | Farmer | Fertilizer & bio-input storage shed inventory, seasonal budget progress bar, Khaata sync. |
| 15 | `record_harvest_sorting_tally` | **HARVEST** | Farmer | Grade A/B/C sorting tally, curing hours counter, field moisture %, lot code generation. |
| 16 | `produce_inventory_lot_ledger` | **INVENTORY** | Farmer / FPO | Active produce lots, available vs escrow-locked tonnage, NABL lab assay status. |
| 17 | `create_mandi_marketplace_listing` | **MARKETPLACE** | Farmer / FPO | Produce lot listing creation, APMC yard selector, minimum bid / buy-now price setting. |
| 18 | `agrimark_live_marketplace` | **MARKETPLACE** | Public / Buyer | Real-time commodity listings feed, dynamic price tickers, category filter pills. |
| 19 | `agrimark_marketplace_search_filters` | **MARKETPLACE** | Buyer | PostGIS distance radius slider, grade filter (Grade A/B), moisture %, organic tag. |
| 20 | `produce_lot_farmer_trust_details` | **MARKETPLACE** | Buyer | Verified farm passport, soil health badge, assay slip preview, direct escrow purchase bar. |
| 21 | `checkout_escrow_order_confirmation` | **BUYER** | Buyer | 3-tier milestone escrow breakdown, Bharat Mandi Escrow hold, logistics carrier select. |
| 22 | `buyer_procurement_dashboard` | **BUYER** | Buyer | Active bulk procurements, cold-chain in-transit orders, escrow release queue. |
| 23 | `agrimark_buyer_rfq_procurement` | **BUYER** | Buyer | Request For Quote (RFQ) builder, target price per quintal, delivery timeline. |
| 24 | `farmer_orders_mandi_dispatches` | **FARMER** | Farmer | Vehicle dispatch status, mandi dock appointment QR code, escrow milestone payouts. |
| 25 | `in_transit_reefer_cold_chain_gps_tracking` | **LOGISTICS** | Buyer / Logistics | Live reefer truck GPS map, temperature telemetry (+4.2°C), door-sensor log, ETA. |
| 26 | `dock_gate_pass_unloading_qr_bay_2` | **LOGISTICS** | Driver / Logistics | High-contrast QR gate pass, Bay #2 unloading assignment, security timestamp. |
| 27 | `dispute_resolution_mandi_arbitrator_desk` | **ADMIN** | Arbitrator / Admin | Weight variance assay slip, mandi conciliation timeline, escrow lock controls. |
| 28 | `escrow_disbursal_confirmation_case_dsp_2025_0842` | **FINANCE** | Farmer / Buyer | Arbitrator ruling settlement breakdown, instant bank RTGS payout reference. |
| 29 | `escrow_settlement_payment_receipt` | **FINANCE** | Farmer / Buyer | Tax-compliant digital sale voucher with APMC mandi cess breakdown and digital sign. |
| 30 | `farm_khaata_crop_profitability` | **FINANCE** | Farmer | Crop-by-crop ROI calculator, NABARD/KCC loan export, chronological cashflow feed. |
| 31 | `agriai_multilingual_assistant` | **AGRI AI** | All Users | Vernacular voice/text advisory bar, pest photo scanner overlay, KVK advisory answers. |
| 32 | `agrimark_language_selection_bottom_sheet` | **PUBLIC** | All Users | Language selection sheet (English, Hindi, Marathi, Tamil, Telugu, Kannada). |
| 33 | `agrimark_brand_logo` | **PUBLIC** | All System | Official AgriMark brand mark, icon variants, and favicon assets. |
| 34 | `agrimark_design_system` | **DESIGN** | All System | Design system token master sheet and component library reference. |
| 35 | `friendly_indian_progressive_farmer_smiling_warmly_with_a_clean_modern_farming` | **PUBLIC** | All System | Hero marketing visual & progressive farmer trust avatar asset. |

---

## 2. Connected User Flows

```
[Splash Loader]
       │
       ▼
[Login / Google OAuth / Phone OTP]
       │
       ├──────────────────────────┐
       ▼                          ▼
[Role Selection]           [Existing Profile]
       │                          │
       ▼                          ▼
[Farmer Onboarding]        [Role Dashboard]
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
  [Farmer Dashboard]      [Buyer Dashboard]      [Logistics / Admin]
          │                       │                       │
     (Farm / Crop)         (Marketplace / RFQ)    (Gate Pass / Disputes)
```
