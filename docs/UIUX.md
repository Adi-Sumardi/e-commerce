# UI/UX Design Guidelines
## Aplikasi E-Commerce Online Store

---

## 1. Prinsip Desain

1. **Mobile-first** untuk storefront — mayoritas traffic e-commerce Indonesia dari mobile.
2. **Clarity over cleverness** — informasi harga, stok, status order harus jelas tanpa ambiguitas.
3. **Kepercayaan (trust) tinggi** — tampilkan badge keamanan pembayaran, metode kurir resmi, dan status order yang transparan.
4. **Konsistensi** — 1 design system (shadcn/ui + Tailwind tokens) dipakai di storefront & admin.
5. **Kecepatan** — minimalkan langkah checkout (idealnya ≤ 3 langkah: alamat → kurir & bayar → konfirmasi).

## 2. Design System

| Aspek | Ketentuan |
|---|---|
| Warna Primer | 1 warna brand (mis. `--primary`) + neutral grays untuk teks/border — detail lihat §2.1 |
| Warna Semantik | Success (hijau) = paid/delivered, Warning (kuning) = pending, Danger (merah) = cancelled/failed, Info (biru) = processing |
| Tipografi | Font sans-serif (Inter/Geist), skala: 12/14/16/20/24/32/40px |
| Spacing | Skala 4px (Tailwind default: 4,8,12,16,24,32,48) |
| Komponen | shadcn/ui: Button, Card, Dialog, Table, Badge, Toast, Tabs, DropdownMenu, DataTable |
| Border Radius | Konsisten `rounded-lg` (8px) untuk card, `rounded-md` untuk button/input |
| Ikon | lucide-react |

### 2.1 Palet Warna

**Brand & Neutral**

| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#2563EB` (biru) | Tombol utama, link aktif, harga, elemen brand |
| `primary-foreground` | `#FFFFFF` | Teks di atas warna primary |
| `secondary` | `#F97316` (oranye) | Aksen promo/badge diskon, CTA sekunder |
| `background` | `#FFFFFF` | Latar halaman (light mode) |
| `foreground` | `#0F172A` (slate-900) | Teks utama |
| `muted` | `#F1F5F9` (slate-100) | Latar section sekunder, skeleton loading |
| `muted-foreground` | `#64748B` (slate-500) | Teks sekunder/caption |
| `border` | `#E2E8F0` (slate-200) | Garis pembatas card/table/input |

**Warna Semantik Status** (dipakai konsisten di `<StatusBadge />`, lihat [LAYOUT.md](./LAYOUT.md))

| Status | Token | Hex | Contoh Pemakaian |
|---|---|---|---|
| Sukses | `success` | `#16A34A` (green-600) | `PAID`, `DELIVERED`, "Aktif" |
| Peringatan | `warning` | `#D97706` (amber-600) | `PENDING_PAYMENT`, `WAITING_STOCK`, "Menunggu" |
| Bahaya | `danger` | `#DC2626` (red-600) | `CANCELLED`, `FAILED`, `EXPIRED` |
| Info | `info` | `#0284C7` (sky-600) | `PROCESSING`, `SHIPPED` |
| Pre-Order | `preorder` | `#7C3AED` (violet-600) | Badge "Pre-Order" di katalog & checkout |

**Dark Mode** (opsional, untuk Admin Dashboard)

| Token | Hex |
|---|---|
| `background` (dark) | `#0F172A` (slate-900) |
| `foreground` (dark) | `#F1F5F9` (slate-100) |
| `muted` (dark) | `#1E293B` (slate-800) |
| `border` (dark) | `#334155` (slate-700) |

> Implementasi: definisikan sebagai CSS variables di `globals.css` (`--primary`, `--success`, dst.) lalu dipetakan ke `tailwind.config.ts` — sesuai konvensi shadcn/ui `cn()` + `class-variance-authority`, agar warna konsisten dipakai ulang di seluruh komponen tanpa hex hardcoded.

## 3. Peta Halaman (Sitemap)

### 3.1 Storefront (Customer)
```
/                       Home (hero, kategori unggulan, produk terlaris)
/products               Katalog + filter (kategori, harga, rating) + search
/products/[slug]        Detail produk (galeri, varian, deskripsi, ulasan, tombol beli)
/cart                   Keranjang belanja
/checkout               Checkout (alamat -> kurir -> pembayaran -> ringkasan)
/checkout/payment/[id]  Instruksi pembayaran (VA number/QRIS code/e-wallet deeplink) + countdown expired
/orders                 Riwayat order (list)
/orders/[id]            Detail order
/track/[id]             Tracking pengiriman real-time (timeline)
/account                Profil, alamat tersimpan, ganti password
/login, /register       Autentikasi
```

### 3.2 Admin Dashboard
```
/admin                      Dashboard ringkasan (KPI cards + chart penjualan)
/admin/products             Tabel produk (search, filter, bulk action)
/admin/products/new         Form tambah produk
/admin/products/[id]/edit   Form edit produk + varian + stok
/admin/orders               Tabel order (filter status, search order number/customer)
/admin/orders/[id]          Detail order: item, pembayaran, pengiriman, timeline, aksi (proses/kirim/refund)
/admin/customers            Tabel customer
/admin/customers/[id]       Detail customer + riwayat order
/admin/vouchers             Kelola kupon diskon
/admin/reports              Laporan penjualan & export
/admin/warehouses            Data Gudang (list, tambah/edit lokasi gudang, assign staff)
/admin/warehouses/dashboard  Dashboard Gudang: antrian order masuk + notifikasi realtime per gudang
/admin/settings             Pengaturan toko, integrasi (Xendit/Biteship keys — read-only status)
```

## 4. Wireframe Kunci (ASCII Layout)

### 4.1 Halaman Detail Produk
```
┌─────────────────────────────────────────────┐
│ Header: Logo | Search | Cart(2) | Account    │
├─────────────────────────────────────────────┤
│ ┌───────────────┐  Nama Produk               │
│ │               │  ⭐4.8 (120 ulasan)         │
│ │  Galeri Foto  │  Rp 250.000                 │
│ │               │  Varian: [S][M][L][XL]      │
│ │  ● ○ ○ ○      │  Warna: [Hitam][Putih]      │
│ └───────────────┘  Stok: Tersedia             │
│                     Qty: [ - 1 + ]            │
│                     [ Tambah ke Keranjang ]   │
│                     [   Beli Sekarang    ]    │
├─────────────────────────────────────────────┤
│ Deskripsi Produk                              │
│ Spesifikasi (berat, dimensi)                  │
│ Ulasan Pembeli                                │
└─────────────────────────────────────────────┘
```

### 4.2 Checkout — Step Pengiriman
```
┌─────────────────────────────────────────────┐
│ ① Alamat  —  ② Kurir & Bayar  —  ③ Konfirmasi │
├─────────────────────────────────────────────┤
│ Alamat Pengiriman                             │
│ ┌───────────────────────────────────────────┐│
│ │ ● Rumah — Jl. Merdeka No.1, Jakarta Pusat  ││
│ │ ○ Kantor — ...                    [Ubah]   ││
│ └───────────────────────────────────────────┘│
│                                                │
│ Pilih Kurir                                   │
│ ○ JNE Reguler       Rp 15.000   (2-3 hari)   │
│ ○ J&T Express       Rp 12.000   (2-3 hari)   │
│ ○ SiCepat Best      Rp 10.000   (1-2 hari)   │
│                                                │
│ Metode Pembayaran                             │
│ ○ Virtual Account  [BCA][BNI][BRI][Mandiri]   │
│ ○ QRIS                                        │
│ ○ E-Wallet  [OVO][DANA][ShopeePay]            │
│                                                │
│              [ Lanjut Bayar Rp 265.000 ]      │
└─────────────────────────────────────────────┘
```

### 4.3 Halaman Tracking Real-time
```
┌─────────────────────────────────────────────┐
│ Order #INV-20260701-001                       │
│ Kurir: JNE Reguler — No. Resi: JNE12345678    │
├─────────────────────────────────────────────┤
│ ●──────●──────●──────○──────○                │
│ Dibuat  Dibayar Dikirim Proses Diterima       │
│                                                │
│ Timeline:                                     │
│ ✔ 01 Jul 09:00 - Pesanan dibuat               │
│ ✔ 01 Jul 09:05 - Pembayaran diterima          │
│ ✔ 01 Jul 14:00 - Paket diambil kurir          │
│ ● 02 Jul 08:00 - Dalam perjalanan ke Jakarta   │
│ ○ Menunggu - Paket diterima                   │
└─────────────────────────────────────────────┘
```

### 4.4 Admin — Dashboard
```
┌─────────────────────────────────────────────┐
│ Sidebar        │ Topbar: Admin ▾             │
│ ▸ Dashboard     ├─────────────────────────────┤
│ ▸ Produk        │ [Total Penjualan][Order Baru]│
│ ▸ Order         │ [Customer Baru][Stok Rendah]│
│ ▸ Customer      │                              │
│ ▸ Voucher       │  Grafik Penjualan (7/30 hari)│
│ ▸ Laporan       │                              │
│ ▸ Gudang        │  Tabel Order Terbaru         │
│ ▸ Pengaturan    │                              │
└─────────────────────────────────────────────┘
```

### 4.5 Admin — Data Gudang (Super Admin)
```
┌─────────────────────────────────────────────┐
│ Data Gudang                    [+ Tambah Gudang]│
├─────────────────────────────────────────────┤
│ Nama Gudang   Kode      Kota       Status  Aksi │
│ Gudang Utama  WH-JKT-01 Jakarta    Aktif  [Edit]│
│ Gudang Bandung WH-BDG-01 Bandung   Aktif  [Edit]│
│ Gudang Surabaya WH-SBY-01 Surabaya Nonaktif[Edit]│
└─────────────────────────────────────────────┘

Form Tambah/Edit Gudang:
  Nama Gudang     [______________]
  Kode Gudang     [______________]
  PIC & Telepon   [______________]
  Provinsi/Kota/Kecamatan (Biteship area picker)
  Alamat Lengkap  [______________]
  Staff Ditugaskan [multi-select staff gudang]
  Status          ( ) Aktif  ( ) Nonaktif
                  [ Simpan ]
```

### 4.6 Admin — Dashboard Gudang (Staff Gudang)
```
┌─────────────────────────────────────────────┐
│ Dashboard Gudang: Gudang Utama (WH-JKT-01)    │
│ 🔔 3 notifikasi order baru belum diproses     │
├─────────────────────────────────────────────┤
│ ● Order Baru  #INV-20260701-004               │
│   2 item · Tujuan: Bandung · JNE Reguler      │
│   [ Proses & Buat Pengiriman ]                │
├─────────────────────────────────────────────┤
│ ● Order Baru  #INV-20260701-003               │
│   1 item · Tujuan: Surabaya · SiCepat Best    │
│   [ Proses & Buat Pengiriman ]                │
├─────────────────────────────────────────────┤
│ ○ Order Diproses  #INV-20260630-098 (selesai) │
└─────────────────────────────────────────────┘
```
- Notifikasi baru masuk real-time (via Pusher/SSE) tanpa perlu reload — muncul toast + badge counter bertambah otomatis.

### 4.7 Checkout — Pre-Order (varian dari §4.2)
```
┌─────────────────────────────────────────────┐
│ 🕓 Item Pre-Order terdeteksi di keranjang      │
│ Estimasi kirim: 15 Agustus 2026               │
├─────────────────────────────────────────────┤
│ Skema Pembayaran                              │
│ ○ Bayar Penuh Sekarang     Rp 500.000         │
│ ○ DP 30% Sekarang          Rp 150.000          │
│    (Pelunasan Rp 350.000 saat barang siap)    │
├─────────────────────────────────────────────┤
│ ⚠ Order Pre-Order & Reguler diproses terpisah │
│   (invoice & jadwal kirim berbeda)            │
│              [ Lanjut Bayar ]                 │
└─────────────────────────────────────────────┘
```

## 5. UX Checkout — Prinsip Khusus

- Tampilkan **estimasi ongkir & waktu tiba** sebelum customer memilih kurir (transparansi biaya).
- **Countdown timer** jelas di halaman pembayaran (VA/QRIS expired dalam waktu tertentu, umumnya 24 jam).
- Salin nomor VA / QR code dengan 1 klik (`copy to clipboard` + toast konfirmasi).
- Auto-refresh atau polling status pembayaran di halaman instruksi bayar (tanpa perlu reload manual).
- State kosong (empty state) yang jelas: keranjang kosong, belum ada order, belum ada alamat.

## 6. Aksesibilitas (a11y)
- Kontras warna minimal WCAG AA.
- Semua form elements punya `label` yang terasosiasi.
- Status berbasis warna juga disertai teks/ikon (tidak hanya warna) untuk color-blind users.
- Navigasi keyboard penuh untuk admin dashboard (tabel, modal, dropdown).

## 7. Referensi Komponen (shadcn/ui)
`Button`, `Input`, `Select`, `RadioGroup`, `Card`, `Badge`, `Table`/`DataTable`, `Dialog`, `Sheet` (cart drawer), `Tabs`, `Toast`, `Skeleton` (loading state), `Pagination`, `Breadcrumb`.

## 8. Spesifikasi Banner Homepage (Master Data — CRUD di `/admin/banners`)

Banner dikelola Super Admin sebagai master data (bukan hardcode), didesain manual (mis. di Canva) lalu URL gambarnya ditempel ke form. Spesifikasi ukuran:

| Slot (berdasarkan urutan/`sortOrder`) | Ukuran Rekomendasi | Rasio | Catatan |
|---|---|---|---|
| Banner Utama (urutan `0`) | 1200 × 545 px | 2.2:1 | Tampil besar di kiri (2/3 lebar hero), teks penting di kiri/tengah — sisi kanan tertutup gradasi gelap |
| Banner Samping (urutan `1` & `2`) | 600 × 270 px | 2.2:1 | Tampil kecil bersisian di kanan (1/3 lebar hero, 2 baris) |

- Format: JPG/PNG/WebP, target ukuran file ≲ 500KB agar loading cepat.
- Field lain per banner: `badgeText` (label kecil, opsional), `title`, `subtitle` (opsional, hanya dipakai banner utama), `ctaLabel` + `ctaLink` (tombol aksi, opsional), `isActive` (tampil/tidak), `sortOrder` (urutan tampil — index `0` otomatis jadi banner utama).
- Kalau tidak ada banner `isActive = true`, seluruh section hero disembunyikan (bukan menampilkan banner kosong/placeholder rusak).
- Sumber gambar harus dari domain yang sudah di-whitelist di `next.config.ts` → `images.remotePatterns` (saat ini: `images.unsplash.com`, `placehold.co`, `lh3.googleusercontent.com`) — kalau pakai hosting lain (imgur, Cloudinary, dst), tambahkan hostname-nya dulu ke situ.
