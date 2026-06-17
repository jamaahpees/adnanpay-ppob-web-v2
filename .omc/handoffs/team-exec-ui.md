## Handoff: team-exec (UI) → team-exec (Integration)

### Completed by UI Workers

**Worker-1 (Setup):** Next.js 14 App Router, TS strict, Tailwind v3, shadcn/ui. Build passes (10 routes).

**Worker-2 (Public UI):**
- src/app/(public)/layout.tsx — public shell (Navbar+Footer, Plus Jakarta Sans + JetBrains Mono fonts)
- src/app/(public)/page.tsx → <PublicHomepage/> (hero search, Pulsa/Game tabs, Grid/List toggle, 3-step checkout, sonner toast)
- src/app/(public)/lacak/page.tsx → <PublicLacakForm/> (RHF+Zod `/^INV-\d{8}-[A-Z0-9]{4}$/`)
- src/app/(public)/invoice/[code]/page.tsx — print-ready receipt (sync params Next 14)
- src/components/features/public-mock-data.ts (12 pulsa, 10 games, 5 pay methods, getMockInvoice)
- src/components/features/public-homepage.tsx, public-lacak-form.tsx, public-status-timeline.tsx, public-print-button.tsx
- globals.css has @media print rules (.no-print hides, .print-area expands)
- **Pay button** currently shows toast placeholder — Midtrans Snap wiring deferred to integration task

**Worker-3 (Admin UI):**
- src/middleware.ts — protects /dashboard /produk /pricing /transaksi, redirects logged-in /login
- src/app/(admin)/layout.tsx — admin shell + AdminSidebar + Toaster
- src/app/(admin)/login/page.tsx — RHF+Zod, mock cookie set
- src/app/(admin)/dashboard/page.tsx — 3 metrics (formatRupiah) + 7-day CSS bar chart
- src/app/(admin)/produk/page.tsx — sync btn (toast), live search, Switch toggle isActive
- src/app/(admin)/pricing/page.tsx — native select + number input, live final price via computeFinalPrice()
- src/app/(admin)/transaksi/page.tsx — status/date filters, sort toggle, CSV export (UTF-8 BOM)
- src/components/features/admin-mock-data.ts (14 products, 6 pricing rules, 12 orders, 7-day data, computeFinalPrice())

### Existing State
- src/lib/db.ts — mysql2/promise pool + query() helper (values as any cast, eslint-disabled)
- src/lib/utils.ts — cn() + formatRupiah()
- All secrets NOT yet in .env — integration worker must create .env.example

### Integration Points (Worker-4 must wire these)
1. **Homepage pay button** (public-homepage.tsx): currently toast placeholder → wire Midtrans Snap token fetch + window.snap.pay()
2. **Pulsa/Game data** (public-homepage.tsx lines 28-35): swap mock imports for DB fetch
3. **Admin login** (login/page.tsx): mock cookie → real JWT verify against admin_users
4. **Admin produk sync** (produk/page.tsx): toast → real Digiflazz pull server action
5. **Admin pricing save** (pricing/page.tsx): live preview only → persist pricing_rules via server action
6. **Invoice data** (invoice/[code]/page.tsx): getMockInvoice → real orders table lookup
7. **Lacak** (lacak-form.tsx): mock → real order status by invoice_code

### Key Patterns (from reference repo)
- **Midtrans webhook signature**: SHA512(order_id + status_code + gross_amount + SERVER_KEY)
- **Digiflazz webhook**: HMAC via X-Hub-Signature header, Buyer-API only
- **Order flow**: create order → Midtrans paid → trigger Digiflazz purchase → callback updates status + SN
- **CRITICAL**: Backend stores pricing snapshots. Frontend NEVER sets trusted final pricing. computeFinalPrice() exists in admin-mock-data.ts — move to lib/pricing.ts and reuse server-side.

### Risks for Integration
- Webhook signature verification must handle both sandbox + production Midtrans keys
- Order creation must be ATOMIC (lock base_price + margin → compute → insert) to prevent race conditions
- Secrets must stay in .env (gitignored), .env.example provided
- MySQL connection pool already configured (connectionLimit: 10) — ensure server actions reuse it
