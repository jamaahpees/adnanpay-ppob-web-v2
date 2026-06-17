

# Frontend Development Plan — Adnanpay PPOB Web v2

## 1. Overview & Tech Stack

Fokus utama *frontend* ini adalah memberikan pengalaman transaksi secepat mungkin (*frictionless*) bagi pengguna umum (Guest) yang ingin membeli Pulsa atau Voucher Game. Sistem ini hanya memiliki satu *role* otentikasi, yaitu **Admin**.

* **Framework**: Next.js 14+ (App Router)
* **Styling**: Tailwind CSS
* **UI Components**: shadcn/ui (Radix UI) untuk komponen modular & *accessible*
* **Data Fetching**: React Query (Client-side) & Server Components/Server Actions (Next.js)
* **Icons & Assets**: Lucide React, format gambar WebP/AVIF (via `next/image`)

---

## 2. Struktur Direktori (App Router)

Arsitektur direktori disederhanakan tanpa adanya entitas *Reseller*.

```text
src/
├── app/
│   ├── (public)/                 # Area Guest (Tanpa Login)
│   │   ├── page.tsx              # Homepage / Katalog Produk (Pulsa & Game)
│   │   ├── lacak/page.tsx        # Halaman Lacak Pesanan via Kode Invoice
│   │   └── invoice/
│   │       └── [code]/page.tsx   # Halaman Detail & Cetak Invoice (Tanpa Email)
│   ├── (admin)/                  # Area Admin (Dilindungi Middleware)
│   │   ├── login/page.tsx        # Login Admin
│   │   ├── dashboard/page.tsx    # Statistik Ringkas
│   │   ├── produk/page.tsx       # Sync Digiflazz & Visibilitas Produk
│   │   ├── pricing/page.tsx      # Atur Margin (Global/Kategori/SKU)
│   │   └── transaksi/page.tsx    # Riwayat Transaksi & Status Midtrans/Digiflazz
│   ├── api/                      # Route Handlers (Webhook Midtrans/Digiflazz)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # Komponen dasar (Button, Input, Table - shadcn)
│   ├── layout/                   # Navbar, Footer, Sidebar Admin
│   └── features/                 # Widget Midtrans Snap, Grid/List Toggle
├── lib/
│   ├── utils.ts                  # Helper (format Rupiah, date formatter)
│   └── db.ts                     # Inisialisasi koneksi MySQL (contoh: mysql2 atau Prisma)
└── actions/                      # Server Actions untuk form submission & query database

```

---

## 3. UI/UX & Fungsionalitas Area Publik (Guest)

### A. Homepage (Katalog & Checkout)

* **Hero/Header**: Pencarian instan untuk produk atau layanan.
* **Tab Kategori Utama**: Pemisahan jelas antara **Pulsa/Data** (Input No. HP) dan **Voucher Game** (Input User ID + Zone ID).
* **Katalog Toggle**: Tombol *switch* antara **Grid View** (logo produk) dan **List View** (tabel teks). Perubahan tampilan berjalan instan tanpa *reload*.
* **Alur Checkout (Frictionless)**:
1. Pengguna memilih produk.
2. Input ID Target (No HP / Game ID).
3. Pilih Metode Pembayaran.
4. Klik "Bayar" -> *Trigger* *popup/overlay* Midtrans Snap.
5. Sukses -> Langsung di-*redirect* ke `/invoice/[code]`.



### B. Halaman Lacak Pesanan (`/lacak`)

* **Input Form**: Satu kolom input teks untuk memasukkan Kode Invoice (contoh: `INV-20231101-ABCD`).
* **Live Status**: Menampilkan *timeline* atau status saat ini: *Pending Pembayaran*, *Diproses*, *Berhasil*, atau *Gagal*.

### C. Halaman Invoice (`/invoice/[code]`)

* **Tampilan Struk**: Desain menyerupai struk/kuitansi digital yang bersih.
* **Data Ditampilkan**: Nomor Invoice, Tanggal, Item, ID Tujuan, Harga Final, Status Pembayaran, dan SN (Serial Number) dari Digiflazz jika sukses.
* **Aksi**: Hanya terdapat tombol **"Cetak PDF / Print"** (menggunakan `@media print` CSS native, menyembunyikan elemen UI website saat dicetak). *Tidak ada form input email.*

---

## 4. UI/UX & Fungsionalitas Area Admin

### A. Dashboard (`/admin/dashboard`)

* **Metrik Utama**: Total Saldo Digiflazz, Jumlah Transaksi Hari Ini, Total Pendapatan Kotor.
* **Grafik Sederhana**: Bar chart transaksi 7 hari terakhir.

### B. Manajemen Produk (`/admin/produk`)

* **Tabel Produk**: Daftar seluruh SKU dari Digiflazz.
* **Fitur**: Tombol "Sync Digiflazz" (manual *pull* produk), *search bar*, dan *toggle switch* (Aktif/Nonaktif) untuk memunculkan/menyembunyikan produk di halaman depan.

### C. Master Pricing (`/admin/pricing`)

* **Engine Harga B2C**: Mengingat tidak ada reseller, harga akhir langsung ditentukan oleh Admin.
* `Harga Jual Final = Harga Modal Digiflazz + Margin Admin`


* **UI Tabel Pricing**: Memungkinkan Admin menetapkan margin (dalam Rupiah statis atau Persentase) secara **Massal per Kategori** atau **Spesifik per SKU**.

### D. Riwayat Transaksi (`/admin/transaksi`)

* **Tabel Orders**: Daftar komprehensif transaksi pelanggan.
* **Kolom**: ID, Tanggal, Kode Invoice, Item, Tujuan, Harga Modal, Harga Jual, Profit, Status Bayar (Midtrans), Status Fulfillment (Digiflazz).
* **Filter & Export**: Filter berdasarkan status dan rentang tanggal, beserta tombol ekspor ke CSV.

---

## 5. Integrasi Database (MySQL) & Komunikasi Klien-Server

Mengingat arsitektur difokuskan pada MySQL murni:

* **Server Actions**: Operasi mutasi data (membuat order, memperbarui margin admin, login admin) akan dilakukan melalui *Next.js Server Actions*.
* **Koneksi MySQL**: Menggunakan *connection pool* (seperti `mysql2/promise` atau ORM seperti `Prisma`/`Drizzle` yang terhubung ke MySQL) yang diinisialisasi di folder `src/lib/db.ts`. Kalkulasi harga (Base Price + Admin Margin) akan dikunci dan di-*snapshot* di dalam Server Actions sebelum order disimpan ke tabel MySQL.

---

## 6. Tahapan Eksekusi (Frontend Roadmap)

* **Fase 1: Setup & Layouting Dasar (Hari 1-2)**
* Inisialisasi Next.js, Tailwind, shadcn/ui.
* Pembuatan struktur *layout* utama (Navbar, Footer publik) dan *layout* dasbor Admin.


* **Fase 2: Katalog & Guest Flow (Hari 3-5)**
* Membuat UI *Homepage* (Input Pulsa/Game, *Grid/List toggle*).
* Membuat UI Halaman Invoice (*print-ready* CSS).
* Membuat UI Halaman Lacak.


* **Fase 3: Admin Dashboard UI (Hari 6-8)**
* Membuat halaman Login Admin.
* Membuat UI Tabel Produk, Tabel Pricing, dan Tabel Transaksi.


* **Fase 4: Integrasi API & State (Hari 9-12)**
* Penyambungan *frontend* dengan Server Actions (MySQL query).
* Integrasi *script* Midtrans Snap pada modal pembayaran.
* Uji coba fungsionalitas pencarian, filter, dan sinkronisasi harga.