# Business Requirements Document (BRD)
## Aplikasi E-Commerce Online Store

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 2026-07-01 |
| **Status** | Draft |

---

## 1. Ringkasan Eksekutif

Membangun platform e-commerce end-to-end yang terdiri dari:
1. **Storefront (Customer App)** — toko online tempat pelanggan browsing produk, checkout, bayar, dan tracking pengiriman.
2. **Admin Dashboard** — panel internal untuk mengelola produk, pesanan, pelanggan, dan laporan.
3. **Payment Gateway** — integrasi **Xendit** (Virtual Account, QRIS, E-Wallet).
4. **Shipping Aggregator** — integrasi **Biteship** (JNE, J&T, SiCepat, AnterAja, dll) untuk ongkir & tracking real-time.

## 2. Latar Belakang & Tujuan Bisnis

### 2.1 Masalah yang Dipecahkan
- Proses jualan online masih manual (chat WhatsApp, transfer manual, cek ongkir manual).
- Tidak ada dashboard terpusat untuk memantau stok, order, dan pelanggan.
- Pelanggan tidak bisa melacak status pengiriman secara real-time.

### 2.2 Tujuan Bisnis
- Meningkatkan efisiensi operasional (otomasi pembayaran & pengiriman).
- Meningkatkan pengalaman belanja pelanggan (checkout cepat, banyak metode bayar).
- Menyediakan data & laporan penjualan yang akurat untuk pengambilan keputusan.
- Skalabel untuk menambah kanal penjualan baru di masa depan (marketplace, mobile app).

## 3. Ruang Lingkup (Scope)

### 3.1 In-Scope
- Storefront: katalog produk, keranjang, checkout, pembayaran, tracking.
- Storefront sebagai **Progressive Web App (PWA)** — dapat di-install di homescreen, dukungan offline dasar.
- Checkout mendukung pembelian **reguler** maupun **Pre-Order (PO)** untuk produk yang belum tersedia stoknya.
- Admin: manajemen produk, order, customer, kategori, diskon/voucher, laporan penjualan.
- Integrasi Xendit: VA (BCA, BNI, BRI, Mandiri, Permata), QRIS, E-Wallet (OVO, DANA, ShopeePay, LinkAja).
- Integrasi Biteship: cek ongkir multi-kurir, buat pengiriman (create order), tracking status (webhook).
- Notifikasi email/status order.
- Autentikasi customer & admin (role-based).

### 3.2 Out of Scope (Fase 1)
- Aplikasi mobile native (iOS/Android) — akan menyusul sebagai fase 2 (storefront sudah PWA di fase 1 sebagai jembatan pengalaman mobile-app-like).
- Multi-vendor / marketplace (banyak seller).
- Logika rebalancing stok otomatis antar-gudang (transfer stok antar gudang) — manajemen tetap manual oleh admin di fase 1.
- Program afiliasi/reseller.
- Integrasi marketplace pihak ketiga (Tokopedia, Shopee, dll).

## 4. Stakeholder

| Peran | Deskripsi |
|---|---|
| Owner/Pemilik Bisnis | Pengambil keputusan, pemilik produk & toko |
| Admin/Staff Toko | Mengelola produk, order, dan customer sehari-hari |
| Customer | Pengguna akhir yang berbelanja |
| Developer | Tim yang membangun & memelihara sistem |

## 5. Kebutuhan Bisnis (Business Requirements)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| BR-01 | Admin dapat mengelola katalog produk (CRUD, stok, varian, kategori) | Must |
| BR-02 | Admin dapat melihat & mengelola semua order (status, pembatalan, refund) | Must |
| BR-03 | Admin dapat melihat data & riwayat customer | Must |
| BR-04 | Customer dapat checkout dengan berbagai metode pembayaran otomatis | Must |
| BR-05 | Sistem otomatis menghitung ongkir berdasarkan berat/dimensi & tujuan | Must |
| BR-06 | Customer dapat melacak status pengiriman secara real-time | Must |
| BR-07 | Sistem mengirim notifikasi status order (email) | Should |
| BR-08 | Admin dapat membuat kupon/diskon | Should |
| BR-09 | Dashboard laporan penjualan (grafik, export) | Should |
| BR-10 | Sistem mendukung multi-role admin (Super Admin, Staff Gudang, CS) | Could |
| BR-11 | Aplikasi dapat diinstall sebagai PWA di homescreen (mobile & desktop) | Should |
| BR-12 | Customer dapat checkout produk dengan skema Pre-Order (bayar penuh/DP, estimasi tanggal kirim) | Must |
| BR-13 | Super Admin dapat mengelola banyak Data Gudang (multi-lokasi) sebagai titik asal pengiriman | Must |
| BR-14 | Staff Gudang menerima notifikasi real-time di dashboard saat ada order baru yang harus diproses/dikirim dari gudangnya | Must |

## 6. Model Bisnis Proses (High Level)

```
Customer browsing produk
   -> Tambah ke keranjang
   -> Checkout (isi alamat, pilih kurir)
   -> Bayar via Xendit (VA/QRIS/E-Wallet)
   -> Webhook Xendit konfirmasi pembayaran -> Order "Paid"
   -> Admin proses order -> Buat pengiriman via Biteship
   -> Webhook Biteship update status -> Order "Shipped" -> "Delivered"
   -> Customer melacak status real-time
```

## 7. Batasan (Constraints)
- Anggaran & waktu pengembangan terbatas (target MVP).
- Bergantung pada uptime & rate limit API Xendit dan Biteship.
- Wajib mematuhi regulasi transaksi elektronik & perlindungan data pelanggan di Indonesia.

## 8. Asumsi
- Toko beroperasi dalam 1 mata uang (IDR); jumlah gudang bisa lebih dari 1 (multi-lokasi), dikelola oleh Super Admin.
- Pembayaran hanya melalui Xendit (tidak ada COD di fase 1 — bisa ditambahkan kemudian).
- Bahasa aplikasi: Bahasa Indonesia (dengan struktur kode dalam Bahasa Inggris).

## 9. Kriteria Sukses (Success Metrics)
- Checkout berhasil end-to-end (produk → bayar → kirim → terima) tanpa intervensi manual.
- Waktu proses order oleh admin berkurang signifikan dibanding proses manual.
- Customer dapat melihat status pengiriman tanpa perlu hubungi CS.
