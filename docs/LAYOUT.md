# Layout Specification
## Aplikasi E-Commerce Online Store

Dokumen ini menjelaskan struktur layout teknis (grid, breakpoint, komponen shell) yang menjadi acuan implementasi di Next.js. Untuk wireframe halaman, lihat [UIUX.md](./UIUX.md).

---

## 1. Breakpoints (Tailwind default)

| Breakpoint | Lebar | Target Device |
|---|---|---|
| `base` | < 640px | Mobile |
| `sm` | ≥ 640px | Mobile besar/phablet |
| `md` | ≥ 768px | Tablet |
| `lg` | ≥ 1024px | Laptop |
| `xl` | ≥ 1280px | Desktop |
| `2xl` | ≥ 1536px | Desktop besar |

Storefront: didesain mobile-first (`base` → `lg`), sekaligus sebagai **PWA installable** (lihat catatan di §7).
Admin Dashboard: didesain desktop-first, tetap fungsional di `md` (tablet), sidebar collapse di `< md`.

---

## 2. Root Layout Structure (Next.js App Router)

```
src/app/
├── layout.tsx                  # <html>, <body>, global providers (ThemeProvider, QueryClientProvider, Toaster)
├── (storefront)/
│   └── layout.tsx               # Header + Footer shell untuk semua halaman publik
└── admin/
    └── layout.tsx                # Sidebar + Topbar shell + RBAC guard (redirect jika bukan admin)
```

### 2.1 Storefront Shell
```
┌───────────────────────────────────────────────┐
│ Header (sticky top)                            │
│  [Logo] [Nav kategori] [Search] [Cart][Account] │
├───────────────────────────────────────────────┤
│                                                  │
│               <page content>                    │
│                                                  │
├───────────────────────────────────────────────┤
│ Footer                                          │
│  [Tentang][Bantuan][Kebijakan][Sosial media]    │
└───────────────────────────────────────────────┘
```
- Header: `sticky top-0 z-50`, height 64px desktop / 56px mobile.
- Mobile: search & nav kategori dipindah ke bottom sheet / hamburger menu; bottom nav bar opsional (Home, Kategori, Keranjang, Akun).
- Max content width: `max-w-7xl mx-auto px-4`.

### 2.2 Admin Shell
```
┌──────────┬──────────────────────────────────────┐
│          │ Topbar: Breadcrumb ... [Notif][Admin▾]│
│ Sidebar  ├──────────────────────────────────────┤
│ (240px)  │                                        │
│ fixed    │           <page content>               │
│          │           max-w-screen-2xl              │
│          │                                        │
└──────────┴──────────────────────────────────────┘
```
- Sidebar: `w-60` fixed di desktop (`lg+`), collapsible ke icon-only (`w-16`) atau off-canvas drawer di `< lg`.
- Topbar height: 56px, berisi breadcrumb halaman aktif + notifikasi + dropdown akun admin.
- Content area: padding `p-6`, grid responsif untuk cards (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`).

---

## 3. Grid System per Halaman

| Halaman | Grid |
|---|---|
| Katalog produk (`/products`) | `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` |
| Detail produk | `grid-cols-1 lg:grid-cols-2 gap-8` (galeri kiri, info kanan) |
| Checkout | 1 kolom di mobile; `lg:grid-cols-3` (form 2 kolom + ringkasan order 1 kolom sticky) |
| Dashboard admin (KPI cards) | `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4` |
| Tabel admin (produk/order/customer) | Full width, dengan `DataTable` (shadcn) + pagination di bawah |

---

## 4. Komponen Layout Reusable

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `<SiteHeader />` | `components/storefront/site-header.tsx` | Header storefront + cart drawer trigger |
| `<SiteFooter />` | `components/storefront/site-footer.tsx` | Footer statis |
| `<CartDrawer />` | `components/storefront/cart-drawer.tsx` | Sheet/drawer keranjang cepat (tanpa pindah halaman) |
| `<AdminSidebar />` | `components/admin/sidebar.tsx` | Navigasi menu admin dengan active state |
| `<AdminTopbar />` | `components/admin/topbar.tsx` | Breadcrumb + user menu |
| `<PageHeader />` | `components/shared/page-header.tsx` | Judul halaman + action button (mis. "+ Tambah Produk") |
| `<StatusBadge />` | `components/shared/status-badge.tsx` | Badge warna sesuai status order/payment/shipment |
| `<EmptyState />` | `components/shared/empty-state.tsx` | Tampilan saat data kosong |

---

## 5. Responsive Behavior Checklist

- [ ] Header storefront collapse jadi hamburger menu di `< md`.
- [ ] Cart drawer full-screen di mobile, sidebar (400px) di desktop.
- [ ] Sidebar admin jadi off-canvas (overlay) di `< lg`.
- [ ] Tabel admin (produk/order) scroll horizontal di mobile, atau beralih ke card list.
- [ ] Checkout: ringkasan order pindah ke bawah form di mobile (bukan sticky sidebar).
- [ ] Gambar produk pakai `next/image` dengan `sizes` responsif untuk optimasi.

---

## 6. Navigasi Utama

### Storefront Nav
`Beranda | Kategori (mega menu) | Promo | Tentang Kami` — kanan: `Cari | Keranjang | Akun`

### Admin Sidebar Menu
```
Dashboard
Produk
  ├─ Semua Produk
  ├─ Kategori
  └─ Tambah Produk
Order
Customer
Voucher
Laporan
Gudang (khusus Super Admin & Staff Gudang)
  ├─ Data Gudang        # CRUD lokasi/alamat gudang
  └─ Dashboard Gudang    # antrian order masuk per gudang + notifikasi realtime
Pengaturan
```

> Menu **Gudang** hanya tampil untuk role `SUPER_ADMIN` (kelola Data Gudang) dan `STAFF_GUDANG` (lihat Dashboard Gudang miliknya). Lihat detail alur di [SRS.md](./SRS.md) §3.12 dan skema di [ERD.md](./ERD.md).

---

## 7. PWA — Ikon & Splash Screen

| Aset | Ukuran | Catatan |
|---|---|---|
| `icon-192.png` | 192x192 | Home screen icon (Android/desktop) |
| `icon-512.png` | 512x512 | Splash screen & PWA install prompt |
| `icon-maskable.png` | 512x512 | Safe zone untuk adaptive icon Android |
| `apple-touch-icon.png` | 180x180 | iOS Add to Home Screen |
| `favicon.ico` | 32x32/16x16 | Tab browser |

- Splash screen otomatis di-generate browser dari `background_color` + `icon-512` di `manifest.json` (tidak perlu asset custom per device, cukup untuk MVP).
- Warna `theme_color` di manifest harus sama dengan warna header storefront agar transisi status bar mobile terasa native.
