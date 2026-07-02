# Software Requirements Specification (SRS)
## Aplikasi E-Commerce Online Store

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 2026-07-01 |
| **Referensi** | Lihat [BRD.md](./BRD.md), [ERD.md](./ERD.md), [TECHSTACK.md](./TECHSTACK.md) |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Menjabarkan kebutuhan fungsional dan non-fungsional secara teknis untuk pengembangan aplikasi e-commerce dengan dua sisi aplikasi (Storefront & Admin Dashboard) yang dibangun di atas Next.js + TypeScript + PostgreSQL.

### 1.2 Definisi & Singkatan

| Istilah | Keterangan |
|---|---|
| VA | Virtual Account |
| QRIS | Quick Response Code Indonesian Standard |
| SKU | Stock Keeping Unit (kode unik produk/varian) |
| Webhook | Callback HTTP dari pihak ketiga (Xendit/Biteship) ke server kita |
| RBAC | Role-Based Access Control |
| PG | Payment Gateway |

### 1.3 Ruang Lingkup Produk
Sistem terdiri dari:
- **Web Storefront** (`/`) — publik, untuk customer.
- **Admin Dashboard** (`/admin`) — private, RBAC, untuk internal.
- **API Layer** — Next.js Route Handlers/API Routes yang menjadi backend bagi keduanya, serta menerima webhook eksternal.

---

## 2. Deskripsi Umum Sistem

### 2.1 Perspektif Produk
Aplikasi monolith Next.js (App Router) dengan satu basis kode, satu database PostgreSQL, dipisahkan secara logis antara customer-facing dan admin-facing melalui routing & middleware RBAC.

### 2.2 Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| Guest | Pengunjung belum login, bisa browsing & tambah ke keranjang (session/local) |
| Customer | User terdaftar, checkout, tracking order, riwayat pembelian |
| Admin (Super Admin) | Akses penuh ke seluruh modul admin, termasuk kelola Data Gudang |
| Staff Gudang | Terikat ke satu/lebih gudang tertentu; kelola stok gudangnya & proses pengiriman order yang masuk ke gudang tersebut, menerima notifikasi order baru real-time |
| Customer Service (CS) | Kelola order & data customer, tidak bisa ubah produk/harga |
| Xendit (System) | Mengirim webhook status pembayaran |
| Biteship (System) | Mengirim webhook status pengiriman |

### 2.3 Batasan Umum
- Harus responsive (mobile-first) untuk storefront.
- Semua transaksi uang harus melalui Xendit — tidak ada input manual status "paid" oleh admin (kecuali override dengan log audit).
- Wajib memakai HTTPS untuk seluruh endpoint, khususnya webhook.

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Modul Autentikasi & User
- **FR-1.1**: Customer dapat mendaftar via email/password atau OAuth (Google).
- **FR-1.2**: Customer dapat login/logout, reset password via email.
- **FR-1.3**: Admin login terpisah dengan RBAC (Super Admin, Staff Gudang, CS).
- **FR-1.4**: Session management menggunakan JWT/secure cookie (NextAuth/Auth.js).

### 3.2 Modul Katalog Produk (Customer)
- **FR-2.1**: Customer dapat melihat daftar produk dengan filter (kategori, harga, rating) & search.
- **FR-2.2**: Customer dapat melihat detail produk (gambar, deskripsi, varian, stok, ulasan).
- **FR-2.3**: Sistem menampilkan status stok (habis/tersedia) secara real-time.
- **FR-2.4**: Produk dapat ditandai sebagai **Pre-Order (PO)** dengan atribut tambahan: estimasi tanggal kirim/ketersediaan, dan skema pembayaran (bayar penuh di muka atau DP/uang muka).
- **FR-2.5**: Produk PO menampilkan badge "Pre-Order" beserta estimasi tanggal kirim di halaman katalog & detail produk.

### 3.3 Modul Keranjang & Checkout
- **FR-3.1**: Customer dapat menambah/mengurangi/menghapus item di keranjang.
- **FR-3.2**: Sistem menghitung subtotal, ongkir, diskon, dan total otomatis.
- **FR-3.3**: Customer memilih/menambah alamat pengiriman (dengan validasi wilayah untuk Biteship: provinsi/kota/kecamatan).
- **FR-3.4**: Sistem memanggil API Biteship untuk menampilkan pilihan kurir & estimasi ongkir (JNE, J&T, SiCepat, AnterAja, dll) berdasarkan berat & tujuan.
- **FR-3.5**: Customer memilih metode pembayaran Xendit: VA Bank, QRIS, atau E-Wallet.
- **FR-3.6**: Sistem membuat invoice/charge Xendit dan menampilkan instruksi pembayaran.
- **FR-3.7**: Customer dapat menerapkan kode voucher/diskon saat checkout.
- **FR-3.8**: Jika keranjang berisi produk **Pre-Order**, sistem menampilkan pilihan tipe checkout: **Reguler** atau **Pre-Order**, dengan informasi estimasi tanggal kirim dan skema pembayaran (Full Payment / DP).
- **FR-3.9**: Order campuran (produk reguler + PO dalam satu keranjang) dipisah otomatis menjadi order/invoice terpisah, karena jadwal kirim & skema bayar berbeda (mengikuti pola umum e-commerce seperti Shopee/Tokopedia PO).
- **FR-3.10**: Jika skema DP dipilih, sistem membuat 2 tagihan Xendit: (1) DP saat checkout, (2) pelunasan saat produk siap dikirim (invoice pelunasan dikirim otomatis via email/notifikasi ke customer).

### 3.4 Modul Pembayaran (Xendit)
- **FR-4.1**: Sistem membuat transaksi pembayaran melalui Xendit API (Invoice API / VA API / QRIS API / E-Wallet API) sesuai metode pilihan.
- **FR-4.2**: Sistem menerima & memvalidasi webhook callback Xendit (validasi `x-callback-token`).
- **FR-4.3**: Sistem memperbarui status order otomatis: `pending_payment` → `paid` / `expired` / `failed`.
- **FR-4.4**: Sistem mencatat log seluruh transaksi pembayaran (audit trail).
- **FR-4.5**: Mendukung retry/pembuatan ulang invoice jika kadaluarsa.

### 3.5 Modul Pengiriman (Biteship)
- **FR-5.1**: Sistem memanggil Biteship Rate/Courier Pricing API untuk mendapatkan opsi kurir & tarif.
- **FR-5.2**: Setelah order `paid`, admin (atau otomatis) membuat pengiriman (create order) ke Biteship dan mendapatkan nomor resi (airway bill).
- **FR-5.3**: Sistem menerima webhook update status Biteship (`confirmed`, `picked_up`, `on_process`, `delivered`, `cancelled`, `return`).
- **FR-5.4**: Customer dapat melihat riwayat status pengiriman (timeline) secara real-time di halaman "Lacak Pesanan".
- **FR-5.5**: Sistem menyimpan nomor resi & link tracking publik kurir.

### 3.6 Modul Order (Customer)
- **FR-6.1**: Customer dapat melihat riwayat order & detail status.
- **FR-6.2**: Customer dapat membatalkan order sebelum dibayar/diproses.
- **FR-6.3**: Customer menerima notifikasi email pada setiap perubahan status penting (order dibuat, dibayar, dikirim, selesai).

### 3.7 Modul Admin — Produk
- **FR-7.1**: Admin dapat CRUD produk (nama, deskripsi, harga, gambar, kategori, berat, dimensi untuk kalkulasi ongkir).
- **FR-7.2**: Admin dapat mengelola varian produk (ukuran, warna) & SKU serta stok per varian.
- **FR-7.3**: Admin dapat mengatur kategori & subkategori.
- **FR-7.4**: Admin dapat mengatur status produk (draft/published/archived).
- **FR-7.5**: Admin dapat menandai produk sebagai **Pre-Order**, mengatur estimasi tanggal kirim, skema pembayaran (full/DP), dan persentase/nominal DP jika berlaku.
- **FR-7.6**: Admin dapat mengubah status produk dari Pre-Order menjadi stok reguler setelah barang tersedia (memicu proses pelunasan & pengiriman untuk order PO terkait).

### 3.8 Modul Admin — Order
- **FR-8.1**: Admin dapat melihat daftar order dengan filter status & pencarian.
- **FR-8.2**: Admin dapat memproses order: konfirmasi, buat pengiriman (Biteship), update manual bila perlu.
- **FR-8.3**: Admin dapat melakukan refund (via Xendit Refund API) & mencatat alasan.
- **FR-8.4**: Admin dapat melihat detail invoice/pembayaran & status pengiriman per order.

### 3.9 Modul Admin — Customer
- **FR-9.1**: Admin dapat melihat daftar & detail customer (data diri, riwayat order, total belanja).
- **FR-9.2**: Admin dapat menonaktifkan/memblokir akun customer bermasalah.

### 3.10 Modul Admin — Laporan & Dashboard
- **FR-10.1**: Dashboard ringkasan: total penjualan, jumlah order, produk terlaris, grafik tren penjualan.
- **FR-10.2**: Export laporan penjualan (CSV/Excel) per periode.
- **FR-10.3**: Laporan stok & produk hampir habis (low stock alert).

### 3.11 Modul Voucher/Diskon
- **FR-11.1**: Admin dapat membuat kupon (persentase/nominal, minimum belanja, masa berlaku, kuota).
- **FR-11.2**: Sistem validasi kupon saat checkout (kadaluarsa, kuota habis, syarat minimum).

### 3.12 Modul Admin — Data Gudang & Notifikasi Gudang
- **FR-13.1**: Super Admin dapat membuat, mengubah, menonaktifkan, dan menghapus **Data Gudang** (nama, kode gudang, alamat lengkap, PIC, telepon, area asal Biteship untuk kalkulasi ongkir). Jumlah gudang tidak dibatasi (multi-lokasi).
- **FR-13.2**: Super Admin dapat menetapkan staff (role `STAFF_GUDANG`) ke satu atau lebih gudang tertentu.
- **FR-13.3**: Admin dapat mengatur stok produk/varian per gudang (`WAREHOUSE_STOCK`), bukan stok global tunggal.
- **FR-13.4**: Saat checkout, sistem menentukan gudang asal pengiriman (`ORDER.warehouse_id`) berdasarkan ketersediaan stok varian & kedekatan dengan alamat tujuan; jika hanya ada satu gudang, otomatis dipakai sebagai default.
- **FR-13.5**: Setiap kali order baru berstatus `paid` (siap diproses), sistem **wajib mengirim notifikasi real-time** ke Dashboard Gudang terkait (staff yang ter-assign ke `warehouse_id` order tersebut), berisi ringkasan order (nomor order, item, alamat tujuan, kurir pilihan).
- **FR-13.6**: Dashboard Gudang menampilkan daftar/antrian order yang perlu diproses gudang tersebut, dengan badge counter notifikasi belum dibaca (unread), dan memungkinkan staff langsung memproses pengiriman (create shipment ke Biteship) dari halaman tersebut.
- **FR-13.7**: Notifikasi tetap tersimpan (`NOTIFICATION` table) dan dapat dilihat kembali walau staff sedang offline saat event terjadi (tidak hilang, tidak hanya "toast" sesaat).

### 3.13 Modul PWA (Progressive Web App)
- **FR-12.1**: Storefront menyediakan `manifest.json` (nama app, ikon, warna tema, `display: standalone`) sehingga dapat di-"Add to Home Screen" di Android/desktop Chrome/Edge, dan ditambahkan ke homescreen via Safari di iOS.
- **FR-12.2**: Storefront memiliki service worker untuk caching aset statis (app shell, gambar produk yang sering diakses) sehingga navigasi ulang lebih cepat & halaman tertentu (mis. riwayat order yang sudah dibuka) tetap dapat diakses saat offline/koneksi buruk.
- **FR-12.3**: Sistem menampilkan halaman fallback offline yang informatif ketika tidak ada koneksi internet, bukan error browser default.
- **FR-12.4**: (Opsional/Fase berikutnya) Push notification untuk update status order (paid/shipped/delivered) via Web Push, khusus platform yang mendukung (Android/desktop; iOS terbatas).

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-1 | Performa | Halaman katalog & produk load < 2.5s (LCP) pada koneksi 4G |
| NFR-2 | Keamanan | Semua endpoint webhook diverifikasi signature/token; password di-hash (bcrypt/argon2) |
| NFR-3 | Keamanan | Data sensitif (API key Xendit/Biteship) hanya di environment variables server-side, tidak pernah di client |
| NFR-4 | Skalabilitas | Arsitektur mendukung horizontal scaling (stateless app server, session di DB/JWT) |
| NFR-5 | Ketersediaan | Uptime target 99.5%; webhook harus idempotent (aman jika dikirim ulang) |
| NFR-6 | Usability | Storefront mobile-first, admin dashboard desktop-first namun tetap responsive |
| NFR-7 | Maintainability | Kode TypeScript strict mode, linting (ESLint/Prettier), struktur modular |
| NFR-8 | Observability | Logging terstruktur untuk semua transaksi pembayaran & pengiriman; error tracking (mis. Sentry) |
| NFR-9 | Compliance | Sesuai UU PDP (Perlindungan Data Pribadi) & regulasi transaksi elektronik Indonesia |
| NFR-10 | Localization | Format mata uang IDR, bahasa Indonesia sebagai bahasa utama UI |
| NFR-11 | PWA | Lighthouse PWA score ≥ 90; app installable, punya app icon & splash screen, berjalan `standalone` (tanpa browser chrome) |
| NFR-12 | PWA | Service worker tidak boleh meng-cache data sensitif (halaman checkout/pembayaran) — hanya app shell & aset statis/publik |

---

## 5. Kebutuhan Antarmuka Eksternal

### 5.1 Xendit
- Invoice API / Virtual Account API / QRIS API / E-Wallet API
- Webhook: `invoice.paid`, `invoice.expired`, `qr.payment`, `ewallet.capture`
- Refund API

### 5.2 Biteship
- Maps/Area API (pencarian area tujuan)
- Rates/Pricing API (cek ongkir)
- Order API (buat pengiriman, dapat resi)
- Tracking API & Webhook status pengiriman

### 5.3 Lainnya
- Email provider (Resend/SendGrid) untuk notifikasi transaksional.
- Object storage (S3-compatible/Cloudinary) untuk gambar produk.

---

## 6. Alur Sistem Kunci (Sequence Ringkas)

### 6.1 Checkout & Pembayaran
```
Customer -> [Next.js API] Buat Order (status: pending_payment)
[Next.js API] -> [Xendit API] Create Invoice/VA/QRIS
Xendit -> Customer (halaman/instruksi pembayaran)
Customer -> Bayar
Xendit -> [Webhook] -> [Next.js API /api/webhooks/xendit]
[Next.js API] verifikasi token -> update Order status: paid
[Next.js API] -> kirim email konfirmasi ke customer
```

### 6.2 Pengiriman
```
Admin -> [Admin Dashboard] Proses Order (paid) -> Buat Pengiriman
[Next.js API] -> [Biteship API] Create Order -> dapat tracking_id + waybill
Biteship -> [Webhook] -> [Next.js API /api/webhooks/biteship]
[Next.js API] update status pengiriman & timeline
Customer -> lihat status realtime di "Lacak Pesanan"
```

---

## 7. Matriks Ketertelusuran (Traceability ke BRD)

| BRD | SRS Terkait |
|---|---|
| BR-01 | FR-7.x |
| BR-02 | FR-8.x |
| BR-03 | FR-9.x |
| BR-04 | FR-3.x, FR-4.x |
| BR-05 | FR-3.4, FR-5.1 |
| BR-06 | FR-5.4, FR-6.3 |
| BR-07 | FR-6.3 |
| BR-08 | FR-11.x |
| BR-09 | FR-10.x |
| BR-10 | FR-1.3 |
| BR-11 | FR-12.x |
| BR-12 | FR-2.4, FR-2.5, FR-3.8, FR-3.9, FR-3.10, FR-7.5, FR-7.6 |
| BR-13 | FR-13.1, FR-13.2, FR-13.3 |
| BR-14 | FR-13.4, FR-13.5, FR-13.6, FR-13.7 |
