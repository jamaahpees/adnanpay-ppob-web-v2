# Backend Development Plan — Adnanpay PPOB Web v2

## 1. Overview & Architecture
Dokumen ini menjelaskan spesifikasi backend untuk **Adnanpay v2**. Sistem backend ini menggunakan **Next.js 14+ Route Handlers** dan **Server Actions** yang terintegrasi langsung dengan database **MySQL murni**. 

Arsitektur backend dirancang untuk memproses transaksi PPOB (Fokus pada Pulsa & Voucher Game) secara langsung dari konsumen umum (**Guest**) tanpa membutuhkan registrasi akun. Hak akses khusus (*Role-Based Access*) hanya disediakan untuk satu entitas, yaitu **Admin (Developer)**.

### Komponen Utama Backend
* **Framework**: Next.js 14+ (App Router) menggunakan Server Actions untuk mutasi data dan Route Handlers untuk Webhook API.
* **Database Engine**: MySQL (diakses menggunakan *connection pool* via `mysql2/promise` atau ORM seperti Prisma/Drizzle).
* **Payment Gateway**: Midtrans Snap API (Core & Webhook API).
* **PPOB Provider**: Digiflazz Buyer API (Webhook API) & **Manual CSV Upload** untuk manajemen produk.

---

## 2. Skema Database (MySQL)

### A. Tabel `demo_admins`
Menyimpan data otentikasi tunggal untuk pengelolaan sistem oleh Admin.
```sql
CREATE TABLE `demo_admins` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### B. Tabel `demo_products`
Menyimpan data katalog produk pulsa dan voucher game yang diimpor dari file CSV template Digiflazz.
```sql
CREATE TABLE `demo_products` (
  `id` VARCHAR(36) NOT NULL,
  `sku_digiflazz` VARCHAR(100) NOT NULL UNIQUE, -- Dari kolom 'Kode Produk'
  `name` VARCHAR(255) NOT NULL, -- Dari kolom 'Produk' (ex: Go Pay 30.000)
  `category` ENUM('pulsa', 'data', 'game', 'ewallet', 'other') NOT NULL, -- Hasil Parsing
  `brand` VARCHAR(100) NOT NULL, -- Hasil Parsing (ex: Axis, Go Pay, Indosat)
  `base_price` DECIMAL(15, 2) NOT NULL, -- Dari kolom 'Harga'
  `stock_status` BOOLEAN DEFAULT TRUE, -- Dari kolom 'Stok' (Unlimited = true)
  `is_active` BOOLEAN DEFAULT TRUE, -- Dari kolom 'Status' (Aktif = true)
  `description` TEXT NULL, -- Dari kolom 'Deskripsi'
  `last_synced` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category_brand` (`category`, `brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### C. Tabel `demo_pricing_rules`
Menyimpan aturan margin yang ditetapkan oleh Admin untuk menentukan harga jual akhir ke pelanggan.
```sql
CREATE TABLE `demo_pricing_rules` (
  `id` VARCHAR(36) NOT NULL,
  `scope` ENUM('global', 'category', 'sku') NOT NULL,
  `target_id` VARCHAR(100) NULL, 
  `fixed_margin` DECIMAL(10, 2) DEFAULT 0.00, 
  `percent_margin` DECIMAL(5, 2) DEFAULT 0.00, 
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_scope_target` (`scope`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### D. Tabel `demo_orders`
Menyimpan snapshot data transaksi saat checkout dilakukan. Bersifat *immutable* setelah status menjadi `PAID`.
```sql
CREATE TABLE `demo_orders` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_code` VARCHAR(50) NOT NULL UNIQUE,
  `product_id` VARCHAR(36) NOT NULL,
  `target_id` VARCHAR(100) NOT NULL, 
  `zone_id` VARCHAR(50) NULL, 
  `base_price_snapshot` DECIMAL(15, 2) NOT NULL, 
  `admin_margin_snapshot` DECIMAL(10, 2) NOT NULL, 
  `final_price_snapshot` DECIMAL(15, 2) NOT NULL, 
  `status` ENUM('pending', 'paid', 'processing', 'completed', 'failed') DEFAULT 'pending',
  `midtrans_snap_token` VARCHAR(255) NULL,
  `sn_provider` VARCHAR(255) NULL, 
  `fulfilled_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `demo_products`(`id`),
  INDEX `idx_invoice_code` (`invoice_code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### E. Tabel `demo_webhook_logs`
Menyimpan riwayat payload mentah dari pihak ketiga.
```sql
CREATE TABLE `demo_webhook_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `source` ENUM('midtrans', 'digiflazz') NOT NULL,
  `payload` JSON NOT NULL,
  `status` ENUM('received', 'processed', 'failed') DEFAULT 'received',
  `processed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Logika Parsing Data Produk (CSV Upload Template Digiflazz)

Karena sumber data produk berasal dari file `daftar-produk-buyer.xlsx` (atau format CSV-nya), sistem membutuhkan *parser* pintar di sisi server untuk mengekstrak dan mengelompokkan data (karena tidak ada kolom Kategori bawaan).

### A. Format Input (Kolom CSV)
`Kode Produk`, `Produk`, `Seller`, `Harga`, `Harga Max`, `Stok`, `Status`, `Perubahan Terakhir`, `Deskripsi`

### B. Algoritma Parsing & Pengelompokan (Auto-Categorization)
Ketika Admin mengunggah CSV, Server Action `uploadProdukCSV` akan menggunakan *library* seperti `papaparse` atau `csv-parser` dan menjalankan fungsi reguler ekspresi (Regex) atau pencocokan kata kunci pada kolom **`Produk`**:

1.  **Ekstraksi Nama Kolom ke Database**:
    * `Kode Produk` -> Disimpan ke `sku_digiflazz`.
    * `Produk` -> Disimpan ke `name`.
    * `Harga` -> Disimpan ke `base_price`.
    * `Status` -> Jika "Aktif" bernilai `true`, jika "Tidak Aktif" bernilai `false` (masuk ke `is_active`).
    * `Deskripsi` -> Disimpan ke `description`.
2.  **Deteksi Brand & Kategori Berdasarkan Nama Produk (`Produk`)**:
    Sistem mengecek string nama produk. Contoh:
    * Jika mengandung `Go Pay`, `Dana`, `OVO`, `ShopeePay` -> **Category:** `ewallet`, **Brand:** (kata kunci yang cocok, misal `Go Pay`).
    * Jika mengandung `Indosat`, `Axis`, `Telkomsel`, `XL`, `Tri`, `Smartfren` -> **Category:** `pulsa` / `data`, **Brand:** (kata kunci provider).
    * Jika mengandung `Mobile Legends`, `Free Fire`, `PUBG` -> **Category:** `game`, **Brand:** (nama game).
3.  **Logika Upsert**:
    Saat mengunggah data, sistem akan melakukan *UPSERT* (Update jika `sku_digiflazz` sudah ada, Insert jika baru). Ini mencegah duplikasi saat Admin mengunggah file yang diperbarui dari Digiflazz.

---

## 4. Core Logic & Pricing Engine
Kalkulasi harga wajib dikelola sepenuhnya oleh server.

* `Harga Jual Final = Harga Modal (Digiflazz) + Margin Admin (Fixed / Persentase)`
* Mekanisme **Order Snapshot**: Saat pelanggan klik "Bayar", sistem menyimpan *snapshot* `base_price`, `admin_margin`, dan `final_price` secara permanen ke `demo_orders`.

---

## 5. Alur Integrasi API & Webhook (Route Handlers)
* **/api/webhook/midtrans**: Menerima update status bayar (mengubah status order menjadi `paid` dan men-trigger pemesanan ke API Digiflazz secara otomatis).
* **/api/webhook/digiflazz**: Menerima update status dari Digiflazz (mengubah status order ke `completed` dan menyimpan SN, atau ke `failed` jika gagal dari provider).

---

## 6. Spesifikasi Server Actions (Fungsi Backend Terbuka)

### A. Server Actions Admin (Manajemen Produk & Data)
* **`uploadProdukCSV(formData)`**:
    * Menerima input file CSV/Excel dari frontend.
    * Membaca dan mem-parsing baris per baris.
    * Mengeksekusi "Algoritma Parsing & Pengelompokan" di atas.
    * Melakukan operasi *bulk upsert* ke tabel `demo_products` di MySQL.
* `loginAdmin(username, password)`: Verifikasi sesi aman.
* `updatePricingRules(scope, targetId, fixedMargin, percentMargin)`: Mengatur markup harga.

### B. Server Actions Publik (Guest)
* `getKatalogProduk(filters)`: Mengambil produk berdasarkan `category` dan `brand` yang di-parsing, dilengkapi harga final (setelah dikenakan margin).
* `createGuestOrder(productId, targetId, zoneId)`: Melakukan validasi, menyimpan ke `demo_orders`, dan *generate* token Midtrans Snap.
* `lacakInvoice(invoiceCode)`: Mengambil data order untuk halaman pelacakan.
