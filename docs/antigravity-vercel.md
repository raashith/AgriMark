# AgriMark — Antigravity Vercel Integration Documentation

This document outlines the canonical integration configuration connecting Google Antigravity (AGY) multi-agent development environment with Vercel and GitHub for the **AgriMark** platform.

---

## 1. Project Infrastructure

- **GitHub Repository**: `https://github.com/raashith/AgriMark`
- **Vercel Project Name**: `agrimark`
- **Canonical Vercel Domain**: `agrimark-six.vercel.app`
- **Framework Preset**: Next.js (App Router)
- **Root Directory**: `web`
- **Production Branch**: `main`
- **Render Backend API**: `https://agrimark-api.onrender.com`
- **Canonical API Base**: `https://agrimark-api.onrender.com/api/v1`
- **Supabase Database Ref**: `xrcqzpnstdbbtafhcwbb` (`AgriMark`, `ap-southeast-2`)

---

## 2. Vercel Configuration Settings

| Setting | Value |
| :--- | :--- |
| **Framework** | Next.js |
| **Root Directory** | `web` |
| **Production Branch** | `main` |
| **Build Command** | `npm run build` |
| **Install Command** | `npm ci` |
| **Output Directory** | Next.js default (`.next`) |

---

## 3. Required Environment Variables

| Variable Name | Environment | Value | Browser Exposable |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Production & Preview | `https://agrimark-api.onrender.com/api/v1` | **Yes** (Public) |

> [!CAUTION]
> **Security Rule**: Never add Supabase service-role keys (`SUPABASE_SERVICE_ROLE_KEY`), backend JWT secrets, database credentials, or OpenAI secret keys to Vercel frontend environment variables. All privileged database operations remain backend-authoritative on Render.

---

## 4. Git & Deployment Workflow

1. **Feature Development**: Changes committed to feature branches (e.g. `web-production-integration-final`).
2. **Preview Deployments**: Opening a Pull Request (such as PR #16 targeting `main`) triggers Vercel Preview Deployments automatically.
3. **Automated CI Validation**: GitHub Actions runs `web-checks` and `canonical-check`:
   ```bash
   cd web
   npm ci
   npx eslint .
   npx tsc --noEmit
   npm run build
   ```
4. **Production Merge**: Merging PR #16 into `main` automatically triggers Vercel Production Deployment.

---

## 5. Continuous Integration (CI) Commands

Run the following commands locally inside `web/` to verify compliance before pushing:

```bash
# 1. Clean installation matching package-lock.json
npm ci

# 2. ESLint code quality audit
npx eslint .

# 3. TypeScript type check
npx tsc --noEmit

# 4. Next.js production bundle build
npm run build
```

---

## 6. Authentication & Authorization Policies

- **Farmer & Buyer Self-Registration**: Permitted via `/auth/register` with explicit role selection.
- **Admin Registration**: Public self-registration as `admin` is strictly prohibited.
- **Role-Aware Redirection**:
  - `farmer` -> `/farmer/dashboard`
  - `buyer` -> `/buyer/marketplace`
  - `logistics` -> `/logistics/deliveries`
  - `admin` -> `/admin/dashboard`
- **Authenticated Requests**: Use Bearer token authorization headers fetched from `localStorage`.
