## Handoff: team-plan → team-exec

### Decided
- **Tech Stack**: Next.js 14+ App Router, Tailwind CSS v4, shadcn/ui (Radix), MySQL, TypeScript strict mode
- **Architecture**: Single admin role + guest users. No reseller system. B2C only.
- **Database**: MySQL with connection pool (mysql2/promise or Prisma). Order pricing snapshots stored server-side (never trust client pricing).
- **Payment**: Midtrans Snap popup integration. Webhook signature = SHA512(order_id + status_code + gross_amount + SERVER_KEY)
- **Fulfillment**: Digiflazz Buyer API. HMAC via X-Hub-Signature header.
- **Flow**: Product select → Input target ID → Payment method → Midtrans Snap → Success → Redirect to /invoice/[code]

### Reference Repo Insights (jamaahpees/PPOB-Payment-Gateway)
- **Backend pattern**: Express TS with Supabase (we'll use MySQL instead)
- **Order flow**: POST /api/orders → initialize → webhook → Digiflazz trigger → callback
- **Admin/role separation**: JWT + role field (`admin`/`pengguna`). Admin routes protected by middleware.
- **Key principle**: Backend stores order pricing snapshots. Frontend NEVER sets trusted final pricing.
- **Invoice**: Public route `/invoice/:code` - no auth required, print-ready CSS

### Task Decomposition
1. **Setup (worker-1)**: Next.js init, Tailwind, shadcn/ui, base layout - UNBLOCKED, starts immediately
2. **Public UI (worker-2)**: Homepage catalog, invoice, lacak - BLOCKED by #1
3. **Admin UI (worker-3)**: Login, dashboard, produk, pricing, transaksi - BLOCKED by #1
4. **Integration (worker-4)**: MySQL, Server Actions, Midtrans, Digiflazz webhooks - BLOCKED by #2 and #3

### Rejected
- **Reseller system**: Out of scope for v2
- **Email in invoice**: Only print button, no email form
- **MongoDB**: Team expertise is SQL (MySQL chosen)
- **Session cookies for admin auth**: JWT preferred for API-first design

### Risks
- **Midtrans sandbox vs production**: Need to verify webhook signature handling works in both environments
- **Digiflazz API rate limits**: Sync button could hit rate limits if clicked repeatedly
- **MySQL connection pool exhaustion**: Must configure proper pool limits in lib/db.ts
- **Race condition on order creation**: Server Action must lock pricing snapshot atomically
- **Print CSS compatibility**: Invoice print layout may break on some browsers - test Firefox + Chrome

### Files (to be created)
- `package.json`, `next.config.ts`, `tailwind.config.ts`
- `src/app/layout.tsx`, `src/app/globals.css`
- `src/components/ui/*` (shadcn/ui components)
- `src/components/layout/` (Navbar, Footer)
- `src/lib/db.ts` (MySQL connection)
- `src/actions/*` (Server Actions)
- `src/app/api/webhook/midtrans/route.ts`
- `src/app/api/webhook/digiflazz/route.ts`

### Remaining
- Database schema design (tables: orders, products, pricing, admin_users)
- Midtrans Snap script integration details
- Digiflazz API credentials and test mode setup
- Admin middleware implementation
- CI/CD pipeline (out of scope for initial implementation)
