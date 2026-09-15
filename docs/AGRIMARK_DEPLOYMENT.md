# AgriMark Production Deployment & Infrastructure Guide

## 1. Environment & Host Specifications
- **Frontend App**: Next.js 14 App Router deployed on Vercel Production (`https://agrimark-six.vercel.app/`).
- **Database Host**: Supabase PostgreSQL Canonical Instance.
- **Python Runtime**: Python 3.10+ for Pytest test suites and simulation execution scripts.

---

## 2. CI/CD & Deployment Exit Criteria
1. Full Pytest test suite passes.
2. Next.js production build (`npm run build`) succeeds with code 0.
3. Database migrations execute without RLS or schema errors.
4. Production smoke tests confirm `/api/v1/*` endpoint availability.
