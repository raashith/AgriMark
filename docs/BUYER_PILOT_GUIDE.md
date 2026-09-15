# AgriMark Buyer Pilot Guide

## 1. Overview
The AgriMark Buyer Portal allows wholesale buyers, food processors, exporters, and retailers to inspect verified produce lots, submit RFQs, place direct orders, and verify produce provenance via Produce Passports.

## 2. Browsing & Ordering Workflow
1. Navigate to `/buyer/marketplace` or `/marketplace`.
2. Filter listings by Crop Category, Quality Grade, District, or Asking Price.
3. Click a listing to view detailed lot specifications, Mandi Price comparisons, and Produce Passport origin maps.
4. Enter order quantity (KG) and delivery address, then click **Place Order**.
5. Server-side reservation logic validates that `requested_quantity <= available_stock`.

## 3. Submitting RFQs & Managing Offers
1. Go to `/buyer/rfqs` and click **Create RFQ**.
2. Specify target crop, required quantity (KG), target price per KG, and required delivery date.
3. Review incoming farmer/FPO offers and click **Accept Offer** to convert an offer into a confirmed order.
