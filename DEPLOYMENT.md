# Deployment Status — Adnanpay Web v2

**Date:** 2026-06-23  
**VPS:** 103.164.173.46 (pirus.hidden-server.net)  
**Status:** ✅ App deployed, ⏳ DNS pending

---

## Completed

### 1. Security Hardening (commit `97be3d1`)

| Fix | File | Detail |
|---|---|---|
| CSP headers | `next.config.mjs` | 7 headers (CSP, X-Frame, HSTS, etc.) |
| Rate limiting | `src/lib/rate-limit.ts` | In-memory limiter |
| Webhook limits | `src/app/api/webhook/*/route.ts` | 20/min (midtrans), 30/min (digiflazz) |
| JWT hardening | `src/middleware.ts` | Throw error jika JWT_SECRET unset |
| Type safety | `src/lib/db.ts` | Replace `as any` dengan `mysql.RowDataPacket[]` |
| Demo fallback | `src/actions/auth.ts` | `admin/admin123` hanya aktif di dev |

### 2. VPS Deployment

- **App location:** `/home/adnanpay/adnanpay-web/`
- **Port:** 3001 (replace old Express backend)
- **Process:** Next.js server (PID 2907873)
- **Auto-start:** Crontab `@reboot ~/adnanpay-web/start.sh`
- **Env:** `.env.local` with JWT_SECRET, MIDTRANS_IS_PRODUCTION=true

**Status check:**
```bash
ssh -i /path/to/key -p 31988 adnanpay@103.164.173.46 "ps aux | grep next"
```

### 3. Build Strategy

Karena VPS ulimit terbatas (`ulimit -n 1024`) → Next.js build gagal dengan EAGAIN.

**Solution:** Build lokal → transfer artifact.
```bash
npm run build
tar czf build.tar.gz .next package.json package-lock.json next.config.mjs public/
scp -P 31988 build.tar.gz adnanpay@VPS:~/adnanpay-web/
```

---

## Pending (Waiting DNS)

### DNS Configuration

**Current status:** Cloudflare nameserver verification pending (1-24 jam)

**Required DNS record:**
```
Type: A
Name: @
Content: 103.164.173.46
Proxy: DNS only (🌐 grey cloud)
TTL: Auto
```

### After DNS Propagates

**1. Verify access:**
```bash
curl -I https://adnanpay.com
```

**2. If 404/redirect → LiteSpeed vhost config needed:**

cPanel LiteSpeed serve berdasarkan domain matching. Jika DNS propagate tapi masih 404, perlu:

**Option A — cPanel Node.js App Manager (if available):**
1. Login cPanel → Software → Setup Node.js App
2. Application root: `/home/adnanpay/adnanpay-web`
3. Application URL: `adnanpay.com`
4. Application startup file: `node_modules/.bin/next`
5. Application startup command: `start -p 3001`

**Option B — LiteSpeed vhost manual (via support ticket):**

Request host provider untuk enable `allowOverride` di LiteSpeed vhost `adnanpay.com`, atau tambah context:
```xml
<context>
  <uri>/</uri>
  <type>proxy</type>
  <location>http://localhost:3001/</location>
</context>
```

**Option C — Replace static files:**

Jika A & B tidak memungkinkan, copy `.next/` build ke `public_html/` dan setup sebagai static export (tapi kehilangan SSR/API routes).

---

## Server Specs

| Item | Value |
|---|---|
| RAM | 64 GB (shared) |
| Disk | ~1.8 TB (436 GB free) |
| Node | 20.x (`/opt/alt/alt-nodejs20/root/usr/bin/node`) |
| Web server | LiteSpeed |
| Panel | cPanel |
| ulimit -n | 1024 (low — cause EAGAIN on build) |
| ulimit -u | 255816 |

---

## Manual Testing

See [`docs/MANUAL_TEST.md`](docs/MANUAL_TEST.md) for:
- Midtrans sandbox cards
- Digiflazz dev target IDs
- Webhook simulation (curl)
- Playwright web tests (6/6 pass)

---

## Rollback Plan

Jika deployment bermasalah:

**1. Restore old backend:**
```bash
cd /home/adnanpay/ppob-backend
nohup node app.js > /dev/null 2>&1 &
```

**2. Stop Next.js:**
```bash
pkill -f "next-server"
```

**3. Revert crontab:**
```bash
crontab -l | grep -v adnanpay-web | crontab -
```

---

## Security Notes

✅ All fixes applied (CSP, rate limit, JWT)  
✅ HSTS enabled (prod only)  
✅ Error responses sanitized  
✅ No hardcoded secrets in code  
⚠️ In-memory rate limiter — reset on deploy/restart (upgrade to Redis/Upstash for multi-instance)

---

## Contact

**SSH:** `ssh -i /path/to/key -p 31988 adnanpay@103.164.173.46`  
**Start script:** `/home/adnanpay/adnanpay-web/start.sh`  
**Logs:** `/tmp/adnanpay-web.log`  
**Env:** `/home/adnanpay/adnanpay-web/.env.local`
