# AgriMark production auth fix — exact task for Antigravity

Fix the production authentication flow end-to-end. The live site currently shows “AgriMark authentication is temporarily unavailable” on `/auth/register` because the browser bundle does not have the required Supabase public client configuration at Vercel build time.

## Canonical architecture
- Frontend: Next.js on Vercel
- Auth: Supabase Auth only
- Database: Supabase project `xrcqzpnstdbbtafhcwbb`
- Supabase URL: `https://xrcqzpnstdbbtafhcwbb.supabase.co`
- Public browser credential: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Backend API: Render `https://agrimark-api.onrender.com`; do NOT use it as a browser password-auth fallback.
- Never expose any service-role/secret key in client code.

## Required fixes
1. Audit all auth files and remove any browser fallback from Supabase email/password auth to Render `/auth/login`.
2. Browser email/password login must call `supabase.auth.signInWithPassword({ email, password })` directly and then resolve the AgriMark profile using the resulting access token.
3. Registration must call `supabase.auth.signUp({ email, password, options: { data: ... } })` directly.
4. Google OAuth must use `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '<production-site>/auth/callback' }})`.
5. Implement/verify `/auth/callback` using the current Supabase PKCE flow (`exchangeCodeForSession`) and redirect to the correct role dashboard after profile sync.
6. Ensure browser Supabase client uses `flowType: 'pkce'`, `detectSessionInUrl: true`, `autoRefreshToken: true`, and `persistSession: true`.
7. Do NOT invent or hardcode a fake API key. The public publishable key is safe for the browser, but should come from Vercel env vars or an explicitly documented public runtime/build configuration.
8. Because the user cannot currently edit Vercel environment variables, add a robust production fallback strategy that does NOT require a secret: use the canonical Supabase URL and the real public publishable key supplied from the project configuration, but do not place service-role or database credentials anywhere client-side. Prefer a server/runtime injection if possible; otherwise document the exact Vercel env names and fail with a precise diagnostic.
9. Add/verify `.env.example` with:
   `NEXT_PUBLIC_SUPABASE_URL=https://xrcqzpnstdbbtafhcwbb.supabase.co`
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`
   `NEXT_PUBLIC_API_BASE_URL=https://agrimark-api.onrender.com/api/v1`
10. Add automated checks that fail the build if client code contains `SERVICE_ROLE`, `sb_secret_`, or database passwords.
11. Add a production auth smoke test/checklist covering: registration, email confirmation, email/password login, session persistence, Google login, logout, role redirect, and invalid credentials.
12. Verify registration/profile creation works with the existing `profiles` schema and does not depend on a separate Render auth table.
13. Keep user-facing errors accurate: distinguish invalid credentials, email confirmation required, Supabase configuration missing, Google provider disabled, and API unavailable.
14. Do not modify Supabase RLS or database schema unless an actual auth/profile query proves it is required.

## Success criteria
- `/auth/register` no longer displays the generic “authentication temporarily unavailable” when production configuration is present.
- A new farmer/buyer/FPO/logistics account can register successfully.
- A registered user can log in with email + password.
- After login, the session survives a hard refresh.
- The user is redirected to the correct role dashboard.
- Google login uses the same Supabase session.
- Logout clears the session and returns to the login page.
- No secret/service-role credentials are exposed to the browser.
- Vercel production build succeeds.

## Important
Do not stop after changing code. Inspect the actual deployed production build/config, verify the deployed `main` commit, and test the live auth flow. If Vercel environment variables cannot be edited by the agent, produce the exact remediation and do not claim the production auth is fixed until the live site is verified.
