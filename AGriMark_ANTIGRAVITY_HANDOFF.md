# AgriMark — Antigravity Developer Handoff & Production Architecture Specification

**Project Target:** `AgriMark — Indian Agriculture Ecosystem` (Stitch Project `projects/15539262927297017189`)  
**Repository Authority:** `raashith/AgriMark` (Next.js 14 App Router, Tailwind CSS, Supabase Auth & PostgreSQL)  
**Production URL:** [https://agrimark-six.vercel.app/](https://agrimark-six.vercel.app/)

---

## 1. Executive Integration Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
|                      STITCH NEW PROJECT SPECIFICATION                    |
|   Project Title: AgriMark — Indian Agriculture Ecosystem                 |
|   Project Name: projects/15539262927297017189                            |
|   Design Language: Agricultural Modernism (#1B4D3E, #F7F5EE, #E5A93C)   |
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Adapted Presentation Layer)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
|                   AGRIMARK NEXT.JS APP ROUTER ARCHITECTURE               |
|                                                                          |
|   ┌────────────────────────────┐       ┌─────────────────────────────┐   |
|   │ App Router Routes (45)     │ ◄─────┤ Shared AgriMark UI Tokens   │   |
|   │ (/farmer, /buyer, /admin)  │       │ (AgriButton, AgriCard, etc) │   |
|   └─────────────┬──────────────┘       └─────────────────────────────┘   |
|                 │                                                        |
|                 ▼                                                        |
|   ┌────────────────────────────┐       ┌─────────────────────────────┐   |
|   │ Supabase Auth & PKCE       │ ◄─────┤ RLS Security Guards & Roles │   |
|   │ Callback Handler           │       │ (Farmer, Buyer, FPO, Admin) │   |
|   └─────────────┬──────────────┘       └─────────────────────────────┘   |
└─────────────────┼────────────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
|                 SUPABASE POSTGRESQL 15+ (AUTHORITATIVE DATA)             |
|   farms • cultivations • crop_plans • harvest_batches • produce_lots     |
|   listings • marketplace_orders • escrow_accounts • disputes • profiles  |
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory Production Constraints

1. **No Operational Seed Data in Production**: All dynamic metrics, farms, crops, marketplace listings, and orders MUST come directly from Supabase query hooks.
2. **Authoritative Auth**: Supabase Auth (Email/Password, Phone OTP, Google OAuth PKCE) is the single source of truth for user authentication and role authorization.
3. **Graceful Loading & Empty States**: When Supabase queries return `[]`, display the `<EmptyState />` component instead of fallback mock arrays.
4. **Environment Variables**: No hardcoded API keys or secrets in source code or Stitch project.

---

## 3. Deployment & Sync Summary

- **Stitch Canonical Project**: `projects/15539262927297017189` (`AgriMark — Indian Agriculture Ecosystem`)
- **GitHub Repository**: `raashith/AgriMark`
- **Main Merge Commit SHA**: [`ac039b7631923395af04268ab1fe40017553d843`](https://github.com/raashith/AgriMark/commit/ac039b7631923395af04268ab1fe40017553d843)
- **Vercel Production Target**: [https://agrimark-six.vercel.app/](https://agrimark-six.vercel.app/)
