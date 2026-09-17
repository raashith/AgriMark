# AgriMark — Antigravity Master Build & Deployment Prompt

## Mission
Build the next-generation AgriMark frontend as a production-grade, mobile-first agricultural ecosystem using the existing AgriMark repository, Stitch design assets, existing FastAPI services, Supabase Auth/Database/Storage, and Render deployment. Do not create a disconnected mockup. Deliver a real, maintainable, accessible, secure, data-driven application in GitHub.

## Existing Project Context
Repository: `raashith/AgriMark`
Canonical production frontend: `web/` — DO NOT BREAK OR REPLACE IT.
Stitch application: `stitch-app/` and `stitch-assets/`.
Current Stitch integration branch: `feature/stitch-import-v2`.
Main production branch: `main`.
Existing API: `https://agrimark-api.onrender.com`.
Existing Stitch Render service: `https://agrimark-stitch-web.onrender.com`.
Supabase project: existing AgriMark project `xrcqzpnstdbbtafhcwbb`.
Supabase Stitch schema: `stitch_app` inside the same Supabase project. Do not create a second Supabase project unless technically unavoidable and explicitly justified.

## Non-Negotiable Architecture Rules
1. Preserve `web/` as the canonical production frontend. Do not overwrite it, redesign it, or introduce breaking changes there.
2. Build the advanced Stitch frontend as a separate, production-ready Next.js App Router application under `stitch-app/`.
3. Reuse existing AgriMark API contracts wherever they are correct; do not duplicate business logic unnecessarily.
4. Use Supabase for authentication, database access, storage, RLS and realtime where appropriate.
5. Keep server secrets server-side. Never expose service-role/secret keys in client code or `NEXT_PUBLIC_*` variables.
6. Prefer Next.js Server Components by default. Use Client Components only where browser state, events, device APIs or realtime subscriptions require them.
7. Prefer Server Actions for UI-owned mutations and Route Handlers for genuine HTTP contracts. Every mutation must validate input and authorize the acting user.
8. Keep ownership and authorization enforced at the data layer and by Supabase RLS. Hiding a button is not authorization.
9. Do not store sensitive long-lived authentication tokens in localStorage when a secure cookie/session architecture can be used.
10. Make the system resilient to network failures, retries, duplicate submits and partial failures.

## Product Vision
AgriMark is a multilingual AI-powered agricultural ecosystem connecting farmers, buyers, FPOs, logistics providers and administrators. It must feel like a serious real-world product, not a student demo.

The frontend must support these core journeys:
- Landing / product discovery
- Login / signup / Google OAuth / session recovery
- Role selection and onboarding
- Farmer profile and farm passport
- Farm creation and editing
- Crop planning and cultivation tracking
- Crop timeline
- Field scouting and evidence capture
- Soil, irrigation and field context
- Harvest planning and harvest recording
- Traceable produce lots
- Produce inventory
- Farmer selling/listing workflow
- Buyer marketplace discovery
- Product detail
- RFQ creation and management
- Checkout and order placement
- Farmer order management
- Logistics tracking
- Gate pass / arrival workflow
- Finance dashboard and entries
- Escrow / settlement / receipt flows
- AI agricultural assistant
- Admin dispute management
- Notifications and activity
- Language selection / localization

## Stitch Screen Requirement
Use the uploaded Stitch package as the primary visual/product reference. Reconcile the complete Stitch screen set with the current Next.js App Router implementation.

There are 33 core Stitch screens/routes in the existing integration. Do not merely preserve route names — reproduce their intended UX, content hierarchy, states, transitions and interactions.

For every Stitch screen:
- Match the intended layout and responsive behavior.
- Preserve the AgriMark visual language.
- Rebuild visual elements as reusable React components rather than static HTML copies.
- Implement every actionable control.
- Implement loading, empty, error, success, disabled and offline states.
- Connect forms to real backend/database operations.
- Provide proper route transitions and back navigation.
- Make keyboard, screen-reader and touch interactions work.

## Design System
Primary visual direction:
- Earth + agriculture + trustworthy technology
- Premium but practical
- High readability in outdoor/field conditions
- Large touch targets
- Clear information hierarchy
- Subtle motion, never distracting
- Responsive from small mobile phones to large desktop displays

Current AgriMark production palette may be retained as the base brand system:
- Chlorophyll Emerald: `#1B4D3E`
- Harvest Green: `#3E7B54`
- Sun Gold: `#E5A93C`
- Warm Cotton Cream: `#F7F5EE`
- Loam Black: `#19201D`

Use a coherent design-token system and CSS variables. Avoid random per-page colors.

Typography:
- Plus Jakarta Sans for UI/content
- JetBrains Mono only for technical/metric values where useful

Build a reusable component system including:
- AppShell
- Top navigation
- Desktop sidebar
- Mobile bottom dock
- Page headers
- Metric cards
- Cards/panels
- Data tables
- Status badges
- Empty states
- Error states
- Skeletons
- Toasts
- Confirmation dialogs
- Drawers/modals
- Form fields
- File/image upload controls
- Search/filter controls
- Stepper/timeline
- Maps/location widgets
- Charts where meaningful

## Farmer-First UX
The most important user is the farmer using the product on an ordinary Android phone.

Therefore:
- Prioritize mobile-first layouts.
- Minimum comfortable touch target around 44–48px, larger for field actions.
- Avoid dense desktop-only interfaces.
- Keep important actions one or two taps away.
- Use concise labels and clear icons.
- Use simple-language copy.
- Support slow networks and intermittent connectivity.
- Preserve unfinished form state where safe.
- Provide clear retry actions.
- Make camera/photo/location features graceful when permissions are unavailable.

## Multilingual Support
Maintain the existing AgriMark multilingual direction and architecture.

Support localized UI through a central translation system rather than hard-coded strings.
Avoid translating database identifiers, enum keys or technical logs.
All new user-visible strings must be localization-ready.

## Authentication & Authorization
Implement a coherent auth architecture using Supabase Auth and secure Next.js server-side session handling.

Required flows:
- Email/password sign in
- Registration
- Google OAuth
- OAuth callback handling
- Session refresh
- Logout
- Protected route handling
- Role-aware route access
- Authenticated API calls
- Unauthorized and expired-session recovery

Roles:
- farmer
- buyer
- fpo
- logistics
- admin

Do not trust client-provided role/ownership fields. Recheck permissions server-side and through RLS.

## Supabase Requirements
Use the existing Supabase project and existing production tables wherever applicable.

Known important tables include:
- `public.profiles`
- `public.farms`
- `public.crops`
- `public.cultivations`
- `public.produce_lots`
- `public.listings`
- `public.marketplace_orders`
- `public.buyer_rfqs`
- `public.marketplace_offers`
- `public.farm_input_logs`
- `public.field_observations`
- `public.harvest_batches`
- `public.farmer_finance_entries`
- `public.farm_tasks`
- `public.location_telemetry`
- `stitch_app.user_profiles`
- `stitch_app.sessions`
- `stitch_app.screen_events`
- `stitch_app.action_events`

Inspect the live schema before changing it.
Generate/update TypeScript types from Supabase where practical.
Do not duplicate tables unnecessarily.

## Database & RLS
Audit every table used by the Stitch app.
Verify:
- RLS enabled where required.
- Read policies only expose data the user should see.
- Insert/update/delete policies verify ownership or role.
- Marketplace/public data is intentionally public only where appropriate.
- Admin operations require admin authorization.
- Cross-user and cross-role access is impossible through client tampering.

When a migration is required:
1. Create a migration.
2. Apply it safely.
3. Verify the resulting schema.
4. Regenerate types if needed.
5. Test affected workflows.

Do not use destructive migrations unless absolutely necessary.

## Backend Integration
The existing FastAPI backend remains an important domain/API layer.
Use it for existing authenticated business workflows when the endpoint already represents the correct contract.
Do not create parallel client-side business logic merely to imitate the API.

Before adding a new API call:
- Inspect existing endpoint contracts.
- Reuse an existing endpoint when possible.
- Add a new endpoint only when a real capability is missing.
- Validate requests and responses.
- Give users useful error messages.

## Data Completeness
The current Stitch screens are visually broader than the simplified implementation. Close that gap.
For example:
- scouting should capture meaningful observation/evidence metadata;
- inputs should record meaningful input/application details;
- finance should use real finance entries;
- harvest should create proper cultivation/harvest/produce relationships;
- listings should reference actual produce lots;
- orders should update inventory transaction-safely;
- logistics should use real location/order context;
- AI should call the existing AgriAI backend instead of returning canned text.

Never fake a success message when the mutation failed.

## Marketplace Integrity
Marketplace operations must be transaction-safe.
Prevent overselling and invalid quantities.
Do not trust client-side available-stock values.
Verify stock again at mutation time.
Use explicit order state transitions.
Record appropriate audit information.

## AI Assistant
AgriAI should feel like an integrated product capability, not a generic chatbot page.

Include:
- Suggested prompts
- Farming-context-aware chat
- Clear conversation state
- Loading/typing state
- Error/retry state
- Relevant crop/farm context when authorized
- Mobile-friendly conversation layout
- Source/context indicators where supported by the backend

Do not invent agricultural recommendations that imply professional certainty. When the backend cannot determine something, communicate uncertainty clearly.

## Maps, Camera, Location
Use browser/device capabilities when available:
- geolocation
- camera/photo capture
- image previews
- map views
- logistics location tracking

Handle denied permissions and unsupported devices without breaking the page.

## Performance
Build for production performance.

Required:
- Server-first rendering where appropriate.
- Small client bundles.
- Lazy-load expensive components.
- Optimize images.
- Avoid unnecessary rerenders.
- Avoid duplicate requests.
- Use explicit cache/revalidation behavior for data.
- Use streaming/Suspense for genuinely slow sections where valuable.
- Paginate large tables/lists.
- Debounce search inputs.
- Do not fetch entire datasets just to filter them in the browser.

## Accessibility
Meet strong accessibility expectations:
- semantic HTML
- keyboard navigation
- visible focus states
- labels for inputs
- accessible names for icon buttons
- ARIA only where needed
- sufficient contrast
- reduced-motion support
- screen-reader-friendly status messaging

## Error / Loading / Empty States
Every data-driven page must deliberately handle:
- initial loading
- refreshing
- empty data
- API error
- auth expiration
- offline/network failure
- invalid input
- successful mutation

Do not leave blank screens.

## Observability
Continue the existing Stitch telemetry architecture.
Track meaningful:
- screen views
- primary actions
- mutation success/failure
- latency where useful

Never capture passwords, auth tokens, secrets or unnecessary personal data in telemetry.

## Testing
Before declaring completion, run:
- TypeScript type checking
- ESLint if configured
- production build
- existing unit/integration tests
- existing E2E tests

Add targeted tests for:
- auth redirects
- role guards
- marketplace order quantity validation
- inventory changes
- key forms
- critical state transitions
- error recovery

Use real test fixtures and deterministic mocks where needed.

## GitHub Workflow
Work directly in the `raashith/AgriMark` repository.

Development branch:
`feature/stitch-import-v2`

Do not commit directly to `main` for this task.

Create focused commits such as:
- `feat(stitch): rebuild core design system`
- `feat(stitch): wire farmer workflows`
- `feat(stitch): wire marketplace workflows`
- `feat(stitch): harden auth and data access`
- `test(stitch): add critical workflow coverage`
- `chore(stitch): production deployment configuration`

Keep commits understandable.

When implementation is complete:
1. Push all changes to the development branch.
2. Run the production build.
3. Verify deployment.
4. Create/update a PR to `main` with a detailed summary and testing evidence.
5. Do NOT merge the PR automatically unless explicitly instructed.

## Render Deployment
Deploy the Stitch app on Render as a separate service.

Target service:
`agrimark-stitch-web`

Repository:
`https://github.com/raashith/AgriMark`

Branch:
`feature/stitch-import-v2`

Node/Next.js deployment.

The deployment must:
- install dependencies
- build successfully
- start successfully
- expose the Next.js application
- have all required environment variables
- have automatic deploys enabled from the development branch

Do not create a second competing Stitch deployment unnecessarily.

After deployment:
- verify the service is live;
- open representative routes;
- inspect Render build/runtime logs if anything fails;
- confirm the deployed commit matches the GitHub branch.

## Environment Variables
Use only non-secret public configuration in client-exposed variables.
Expected categories include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Any secret/admin/service-role/API credentials must be server-side only.
Never commit `.env` secrets to GitHub.

## Security Audit Before Completion
Check for:
- leaked secrets
- service-role keys in frontend bundles
- unsafe redirects
- client-only authorization
- unvalidated form inputs
- IDOR / cross-user data access
- insecure file uploads
- unsafe HTML injection
- overly broad Supabase policies
- missing auth checks
- accidental token logging

Also check current Supabase security advisors and address actionable warnings.

## Visual QA
For each major route:
- compare against the Stitch screen reference;
- inspect desktop and mobile;
- verify no clipping/overflow;
- verify button states;
- verify tables/forms on narrow screens;
- verify loading/error states;
- verify navigation consistency.

Do not stop at “build passed”.

## Definition of Done
The task is complete only when all of the following are true:
- The Stitch frontend is a real Next.js application, not a static mockup.
- All 33 Stitch routes/screens are represented and usable.
- Major CTAs and buttons have meaningful behavior.
- Core workflows persist real data.
- Supabase Auth and RLS are enforced correctly.
- Existing FastAPI services are reused correctly.
- Mobile experience is strong.
- Accessibility basics are covered.
- Error/loading/empty states exist.
- Tests and production build pass.
- GitHub branch contains the implementation.
- Render deployment is live from the branch.
- A final deployment and implementation report is written.

## Execution Style
Do not ask unnecessary clarification questions. Inspect the repository, Stitch assets, existing API, Supabase schema and current deployment first. Make a plan, implement in coherent phases, verify each phase, fix errors automatically, and continue until the defined completion criteria are met.

Do not replace working production functionality with placeholders.
Do not invent backend behavior when an existing contract is available.
Do not claim something is complete without verifying it.

## Final Deliverable
At the end, provide:
1. GitHub branch and latest commit.
2. PR URL.
3. Render deployment URL.
4. Summary of screens/workflows implemented.
5. Supabase schema/RLS changes.
6. Test/build results.
7. Known non-blocking issues, if any.
8. Clear instructions for the next phase only if something genuinely remains.

Build AgriMark like a product that real Indian farmers, buyers, FPOs and logistics teams can depend on — polished, fast, secure, multilingual, data-driven, accessible and production-ready.