# Manual Test — Adnanpay PPOB Web v2

Data simulasi untuk test payment flow (Midtrans sandbox) + fulfillment (Digiflazz dev).
Digunakan untuk verifikasi end-to-end tanpa biaya real.

---

## 1. Midtrans Sandbox — Test Payment

### Credit/Debit Card (3DS)
| Card | Number | Exp | CVV | Result |
|------|--------|-----|-----|--------|
| Visa | `4811 1111 1111 1114` | `01/25` | `123` | ✅ Success |
| Mastercard | `5211 1111 1111 1115` | `12/25` | `123` | ✅ Success |
| Visa 3DS challenge | `4911 1111 1111 1113` | `02/25` | `123` | Challenge (password: `112233`) |
| Declined | `4911 1111 1111 1112` | `03/25` | `123` | ❌ Declined |

### Virtual Account / Bank Transfer
Midtrans Snap sandbox generate VA number otomatis. Status berubah `settlement` setelah simulasi.

| Method | Behavior |
|--------|----------|
| BCA VA | Generate nomor VA → auto-settle di sandbox |
| BNI VA | Sama, auto-settle |
| Mandiri Bill | Generate bill key → auto-settle |
| Permata VA | Generate VA → auto-settle |

### QRIS (sandbox)
- Snap sandbox menampilkan QR statis untuk test.
- **Simulasi pembayaran:** buka Midtrans Snap dashboard → Map/Orders → klik transaction → tombol "Simulate payment" → status `settlement`.
- Tidak perlu scan QR real di sandbox.

### GoPay / e-Wallet (sandbox)
- Snap sandbox: pilih GoPay/DANA/OVO/ShopeePay → langsung `success` (sandbox bypass).
- Tidak perlu akun real.

### OTP 3DS Challenge
- Password challenge universal sandbox: **`112233`**
- OTP dikirim ke nomor dummy — input apa pun diterima di sandbox.

---

## 2. Target ID — Digiflazz Dev Response

Digiflazz pakai kredensial `dev-` (lihat `.env`). Mode ini **tidak process transaksi real** — return mock response. Nomor tujuan any valid format, fulfillment_status simulasi.

### Pulsa / Data
| Product | Target (No HP) | Expected |
|---------|----------------|----------|
| Telkomsel 10.000 | `081200001111` | success + SN mock |
| XL 20.000 | `081700002222` | success + SN mock |
| Indosat 25.000 | `085600003333` | success + SN mock |
| Tri 50.000 | `089600004444` | success + SN mock |
| Axis 10.000 | `083800005555` | success + SN mock |
| Smartfren 20.000 | `088100006666` | success + SN mock |

> Format valid: `08` + 8-12 digit. Digiflazz dev terima semua, return SN format `SN-XXXXX-YYYYY`.

### Voucher Game (butuh User ID + Zone ID)
| Game | User ID | Zone ID | Expected |
|------|---------|---------|----------|
| Mobile Legends | `123456789` | `2001` | success + SN mock |
| Free Fire | `987654321` | — | success + SN mock |
| Genshin Impact | `800123456` | — | success + SN mock |
| PUBG Mobile | `5123456789` | — | success + SN mock |
| Valorant | `AdnanGamer` | — | success + SN mock |
| Honkai SR | `600789123` | — | success + SN mock |

> ML wajib Zone ID (server ID). Others tidak.

### E-Money / Token PLN
| Product | Target | Expected |
|---------|--------|----------|
| GoPay 50.000 | `081200001111` | success + SN mock |
| OVO 100.000 | `085700007777` | success + SN mock |
| DANA 20.000 | `081300008888` | success + SN mock |
| PLN Token 50.000 | `12345678901` (ID Pelanggan) | success + token 20 digit |

> PLN token format: `XXXX-XXXX-XXXX-XXXX-XXXX` (20 digit).

---

## 3. Webhook Simulation (curl)

Test endpoint signature verification tanpa Midtrans/Digiflazz real.

### Midtrans Webhook (`/api/webhook/midtrans`)
Generate signature dulu:
```bash
# signature_key = SHA512(order_id + status_code + gross_amount + SERVER_KEY)
ORDER="INV-20260619-AB12"
STATUS="200"
AMOUNT="11000"
SERVER_KEY="dev-midtrans-server-key"
SIG=$(echo -n "${ORDER}${STATUS}${AMOUNT}${SERVER_KEY}" | sha512sum | awk '{print $1}')

curl -X POST http://localhost:3000/api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d "{
    \"order_id\": \"$ORDER\",
    \"status_code\": \"$STATUS\",
    \"gross_amount\": \"$AMOUNT\",
    \"transaction_status\": \"settlement\",
    \"signature_key\": \"$SIG\"
  }"
```
**Expected:** `200 OK` with `{"received":true,"matched":true}` → order.payment_status → `success`.

> Note: `matched:false` = signature tidak cocok. Dengan placeholder `MIDTRANS_SERVER_KEY` + order yang tidak ada di DB, signature akan mismatch. Untuk test `matched:true`: pakai **real sandbox server key** dari https://dashboard.sandbox.midtrans.com + buat order real lewat checkout flow dulu (agar order ada di DB dengan gross_amount yang match).

### Digiflazz Webhook (`/api/webhook/digiflazz`)
```bash
# Dev mode: DIGIFLAZZ_WEBHOOK_SECRET kosong → unsigned callback DITERIMA
curl -X POST http://localhost:3000/api/webhook/digiflazz \
  -H "Content-Type: application/json" \
  -d "{
    \"ref_id\": \"INV-20260619-AB12\",
    \"status\": \"sukses\",
    \"sn\": \"SN-TEST-12345-ABCDE\",
    \"price\": 11000,
    \"message\": \"Topup berhasil\"
  }"
```
**Expected:** `{"received":true,"fulfillmentStatus":"success"}`, order.fulfillment_status → `success`, sn disimpan.

> ✅ Verified working. Dev mode `DIGIFLAZZ_WEBHOOK_SECRET=` (kosong) → unsigned accepted (route bypasses HMAC check). Production: secret set → HMAC required.

---

## 4. Admin Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

Hash bcrypt cost 10 di `admin_users` table.

---

## 5. End-to-End Test Checklist

1. Buka `http://localhost:3000`
2. Pilih kategori **Voucher Game** → **Mobile Legends**
3. Pilih **86 Diamond** (Rp 24.000)
4. Input User ID `123456789` + Zone ID `2001`
5. Pilih metode **GoPay**
6. Klik **Bayar Sekarang**
7. Snap popup buka (sandbox) → klik pay → `success`
8. Redirect ke `/invoice/INV-...`
9. Invoice tampilkan: item, target, harga, status Berhasil, SN
10. Login admin `/login` → `admin/admin123`
11. Cek `/transaksi` → order muncul, profit terhitung
12. Cek `/dashboard` → metric naik, chart update

---

## 6. Graceful Degradation

Tanpa DB/secrets (build demo), app tetap jalan:
- Checkout → mock invoice code → redirect `/invoice/INV-XXXX-XXXX-XXXX`
- Mock invoice deterministik (same code → same receipt)
- Tidak crash, tidak butuh MySQL/Midtrans/Digiflazz

---

## 7. Environment

`.env` (gitignored):
```
DB_HOST=localhost
DB_USER=root
DB_NAME=adnanpay_ppob
MIDTRANS_SERVER_KEY=dev-midtrans-server-key
MIDTRANS_IS_PRODUCTION=false
DIGIFLAZZ_USERNAME=racufig5E1rg
DIGIFLAZZ_API_KEY=dev-33b28300-8287-11ec-adb2-692ea50f5ef5
DIGIFLAZZ_WEBHOOK_SECRET=
JWT_SECRET=adnanpay-dev-secret-key-min-32-chars-required
```

Midtrans sandbox dashboard: https://dashboard.sandbox.midtrans.com
Digiflazz dashboard: https://id.digiflazz.com

---

## 8. Reference Sources

- Midtrans test cards: https://docs.midtrans.com/en/technical-reference/sandbox-test
- Digiflazz dev mode: buyer SKU `dev-` prefix, no real transaction
- Reference repo: `/media/hanz/New Volume/coding/1.PPOB PAYMENT/.env`

---

## 9. Simulation Results (verified 2026-06-23)

### Webhook Checklist (curl)

| # | Test | Expected | Result |
|---|------|----------|--------|
| 1 | GET /api/webhook/midtrans | 405 | ✅ 405 |
| 2 | GET /api/webhook/digiflazz | 405 | ✅ 405 |
| 3 | POST digiflazz unsigned (dev) | 200 received | ✅ `{"received":true,"fulfillmentStatus":"success"}` |
| 4 | POST digiflazz missing ref_id | 400 | ✅ `{"error":"Missing ref_id"}` |
| 5 | POST midtrans bad signature | 200 matched:false | ⚠️ 400 "Invalid payload" (field incomplete) |

### Web Simulation Checklist (Playwright, 1440×900)

| # | Page | Expected | Result |
|---|------|----------|--------|
| 1 | Homepage `/` | 200 + title | ✅ "Adnanpay — Pulsa, Paket Data & Voucher Game" |
| 2 | Click "Voucher Game" | Category switch | ✅ Game brands shown |
| 3 | Click "Mobile Legends" | Denominations | ✅ Diamond packages list |
| 4 | Login `/login` | 200 form | ✅ Admin login form |
| 5 | Lacak `/lacak` | 200 form | ✅ Invoice code tracking |
| 6 | Invoice `/invoice/INV-...` | 200 receipt | ✅ Print-ready invoice |

**Screenshots:** `docs/test-screenshots/01-homepage.png` ... `06-invoice.png`

**Client-side errors:** 0 (homepage HTML clean, no exception).
