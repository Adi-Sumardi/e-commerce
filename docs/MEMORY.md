# Project Memory / Engineering Notes
## Aplikasi E-Commerce Online Store

Dokumen ini adalah catatan hidup (living document) untuk keputusan teknis, konvensi, dan konteks proyek yang tidak selalu tercermin di kode. Update dokumen ini setiap ada keputusan penting agar developer baru/berikutnya (termasuk AI assistant) cepat memahami konteks.

---

## 1. Keputusan Arsitektur (Architecture Decision Log)

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 2026-07-01 | Gunakan Next.js App Router (bukan Pages Router) | Mendukung React Server Components, layout bersarang untuk storefront vs admin, dan Route Handlers untuk webhook |
| 2026-07-01 | Satu monorepo/app untuk storefront + admin (bukan 2 app terpisah) | Lebih sederhana untuk tim kecil; RBAC via middleware sudah cukup memisahkan akses |
| 2026-07-01 | Prisma sebagai ORM tunggal | Type-safety & migration terversi untuk skema yang cukup kompleks (order/payment/shipment) |
| 2026-07-01 | Xendit untuk seluruh pembayaran, Biteship untuk seluruh pengiriman | Sesuai kebutuhan eksplisit user; keduanya API populer untuk pasar Indonesia |
| 2026-07-01 | Aplikasi dibuat sebagai **PWA** (Progressive Web App) | User meminta agar storefront bisa "diinstall" & punya pengalaman seperti app native tanpa perlu publish ke App Store/Play Store dulu |
| 2026-07-01 | Checkout mendukung **Pre-Order** (bayar penuh atau DP + pelunasan) | Permintaan eksplisit user; mengikuti pola umum e-commerce Indonesia (Shopee/Tokopedia PO) |
| 2026-07-01 | Sistem mendukung **multi-gudang** (Data Gudang, banyak lokasi) — merevisi asumsi awal "1 gudang" di BRD | User menegaskan alamat gudang bisa banyak; setiap order di-assign ke satu `warehouse_id` |
| 2026-07-01 | Order baru wajib memicu **notifikasi real-time** ke Dashboard Gudang terkait | Permintaan eksplisit user agar staff gudang tahu ada order masuk tanpa harus refresh manual |
| 2026-07-01 | Nama brand/toko: **Pratama Jaya** (bukan "TokoKita" — nama itu hanya placeholder di mockup awal) | Ditegaskan langsung oleh user |

---

## 2. Konvensi Kode
- Bahasa kode & nama variabel/fungsi: **Inggris**. UI copy/teks: **Bahasa Indonesia**.
- Semua akses database via layer `server/repositories`, business logic di `server/services` — komponen/route handler tidak query Prisma langsung.
- Validasi input selalu pakai Zod schema di `lib/validators`, dipakai bersama di client (React Hook Form) & server (Route Handler).
- Status order/payment/shipment adalah enum tetap — lihat [ERD.md](./ERD.md) untuk daftar nilai resmi. Jangan menambah nilai status baru tanpa update ERD & state machine di SRS.

## 3. Hal-Hal Kritikal yang Wajib Diingat

- **Webhook harus idempotent.** Xendit & Biteship bisa mengirim webhook yang sama lebih dari sekali — selalu cek status existing sebelum update (hindari double-processing, mis. kirim email 2x atau proses refund 2x).
- **Verifikasi signature/token webhook wajib** (`x-callback-token` untuk Xendit, secret header untuk Biteship) sebelum memproses payload apa pun.
- **Jangan pernah expose secret key** (`XENDIT_SECRET_KEY`, `BITESHIP_API_KEY`) ke client — semua pemanggilan API pihak ketiga terjadi di server (Route Handler/Server Action), tidak di client component.
- **Snapshot harga & nama produk** di `ORDER_ITEM` saat checkout — jangan join langsung ke tabel produk live untuk data historis order.
- **Stok dikurangi saat order `paid`** (bukan saat checkout dibuat) untuk menghindari stok "terkunci" oleh order yang tidak jadi dibayar — pertimbangkan reservasi stok sementara (mis. TTL 15-30 menit) jika terjadi race condition stok habis.

## 4. Istilah/Penamaan yang Disepakati
- "Bitship" pada permintaan awal user merujuk ke **Biteship** (nama resmi platform agregator pengiriman Indonesia) — seluruh dokumen menggunakan ejaan resmi "Biteship".
- Order number format: `INV-YYYYMMDD-XXX` (contoh: `INV-20260701-001`).

## 5. Progressive Web App (PWA)
- Storefront wajib installable (Add to Home Screen) di Android & desktop Chrome/Edge; iOS Safari didukung sebatas kemampuan PWA di iOS (tanpa push notification native).
- Detail teknis implementasi ada di [TECHSTACK.md](./TECHSTACK.md#7-pwa-progressive-web-app) dan kebutuhan fungsional di [SRS.md](./SRS.md).

## 6. Pertanyaan Terbuka / Perlu Keputusan Owner
- [ ] Apakah perlu dukungan COD (Cash on Delivery) di fase 1 atau menyusul?
- [ ] Apakah push notification (order update ke customer) diperlukan di fase 1 PWA, atau cukup email dulu?
- [ ] Target awal: berapa kurir yang diaktifkan di Biteship (semua vs subset JNE/J&T/SiCepat)?
- [ ] Untuk order Pre-Order dengan DP: apakah pelunasan wajib dibayar sebelum barang dikirim, atau boleh COD sisa pelunasan?
- [ ] Logika pemilihan gudang otomatis (stok terdekat) — apakah cukup "gudang manapun yang ada stok" di fase 1, atau perlu prioritas berdasarkan jarak/ongkir termurah?

## 7. Referensi Dokumen Terkait
- [BRD.md](./BRD.md) — kebutuhan bisnis
- [SRS.md](./SRS.md) — kebutuhan fungsional/non-fungsional detail
- [TECHSTACK.md](./TECHSTACK.md) — stack teknis
- [ERD.md](./ERD.md) — skema database
- [LAYOUT.md](./LAYOUT.md) — struktur layout & responsive
- [UIUX.md](./UIUX.md) — panduan desain & wireframe

---

## 8. Status Setup Project (per 2026-07-01)

Project sudah di-scaffold di root repo (bukan lagi kosong). Ringkasan agar sesi berikutnya tidak perlu re-explore dari nol:

### 8.1 Stack yang benar-benar terpasang
- Next.js **16.2.9** (App Router, `src/` dir), TypeScript, **Tailwind CSS v4** (bukan v3 — config warna via `@theme inline` di `src/app/globals.css`, tidak ada `tailwind.config.ts`).
- **Prisma pinned ke v6** (`prisma@^6`, `@prisma/client@^6`), **BUKAN v7**. Prisma 7 punya breaking change (datasource `url` harus pindah ke `prisma.config.ts` + wajib driver adapter) yang belum matang/terlalu ribet untuk MVP ini — jangan upgrade ke v7 tanpa alasan kuat & migrasi sadar.
- Package manager: **pnpm**. Ada `pnpm-workspace.yaml` dengan `onlyBuiltDependencies` utk `@prisma/client`, `@prisma/engines`, `prisma` (wajib, kalau tidak ada, install gagal minta approve manual interaktif).
- shadcn/ui sudah di-init (`components.json`), komponen terpasang: button, card, badge, input, table, dialog, tabs, dropdown-menu, sonner, breadcrumb, select, radio-group, skeleton, label, separator, avatar, textarea, checkbox, sheet, pagination.
- Auth.js (`next-auth@5.0.0-beta.31`) skeleton di `src/lib/auth.ts` (Credentials + Google provider) + route handler di `src/app/api/auth/[...nextauth]/route.ts` + RBAC guard di `src/middleware.ts` (proteksi `/admin/*` untuk role SUPER_ADMIN/STAFF_GUDANG/CS) — **belum di-test end-to-end**, belum ada halaman `/login` nyata.
- `src/lib/db.ts` (Prisma client singleton), `src/lib/xendit.ts`, `src/lib/biteship.ts` (wrapper fetch manual, Biteship tidak punya SDK resmi) — semua skeleton/stub, belum ada implementasi request nyata.
- Webhook routes stub di `src/app/api/webhooks/xendit/route.ts` dan `.../biteship/route.ts` — sudah ada verifikasi token & idempotency guard dasar, tapi mapping status payload → update Order/Shipment masih `// TODO`.
- `src/store/cart-store.ts` — Zustand + persist (localStorage) untuk keranjang, sudah fungsional secara struktur tapi belum dipakai di UI manapun.
- `prisma/schema.prisma` — schema lengkap 1:1 dengan [ERD.md](./ERD.md) (User, Address, Warehouse, WarehouseStaff, WarehouseStock, Category, Product+PO fields, ProductVariant, Cart, Voucher, Order+orderType, OrderItem, Payment+stage, Shipment, Notification, dll). **Sudah divalidasi** (`prisma validate`) tapi **belum pernah di-migrate** ke database asli (belum ada `DATABASE_URL` real, belum `prisma migrate dev`).
- `public/manifest.json` dibuat untuk PWA, tapi **icon PNG-nya belum ada** (`/icons/icon-192.png` dll direferensikan tapi filenya belum dibuat) — dan **service worker (Serwist) belum di-wire** ke `next.config.ts`. PWA baru "siap kerangka", belum installable beneran.

### 8.2 UI — hasil konversi 6 mockup (`ui-ux/*/code.html` → halaman Next.js nyata)
Semua di-convert pakai **mock data statis** (di file `_data.ts` di tiap folder route), **belum ada fetch ke Prisma/DB**, belum ada server actions:
- `/` (home) — `src/app/page.tsx`
- `/products/[slug]` — product detail (slug diabaikan, selalu render 1 produk mock)
- `/checkout` — termasuk UI skema Pre-Order (Full/DP) sesuai UIUX.md §4.7
- `/track/[id]` — order tracking timeline
- `/admin/dashboard` — pakai `src/app/admin/layout.tsx` (sidebar+topbar shell, **belum ada auth guard aktif** meski middleware sudah ada)
- `/admin/warehouses/dashboard` — dashboard gudang (notifikasi masih statis, belum realtime)

Komponen bersama: `src/components/storefront/{site-header,site-footer,product-gallery,product-purchase-panel}.tsx`, `src/components/admin/{admin-sidebar,admin-topbar}.tsx`, `src/components/shared/status-badge.tsx`.

Icon: semua `material-symbols-outlined` di mockup sudah dipetakan ke **lucide-react** (bukan Material Symbols font). Gambar produk/kurir/logo bank pakai placeholder `placehold.co` (di-whitelist di `next.config.ts` → `images.remotePatterns`), bukan aset asli — perlu diganti aset & foto produk sungguhan sebelum production.

Brand/nama toko: **"Pratama Jaya"** (bukan "TokoKita" — nama itu cuma placeholder yang kebawa dari file mockup asal, sudah dikoreksi di semua halaman + `layout.tsx` metadata + `manifest.json`).

Verifikasi saat setup: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` — semua **clean/berhasil** (9 route, 5 static + 2 dynamic).

### 8.3 Bug yang pernah muncul saat run lokal pertama kali (sudah diperbaiki)
- **CSS comment jangan pernah mengandung `*/` di tengah teks** — komentar di `globals.css` yang menuliskan path `ui-ux/*/DESIGN.md` membuat CSS comment tertutup prematur (`*/` di tengah kalimat) dan bikin seluruh `:root { ... }` di bawahnya jadi invalid syntax → semua halaman storefront 500 ("Invalid dangling combinator in selector"). Selalu hindari literal `*/` di dalam komentar CSS.
- **Auth.js butuh `AUTH_SECRET`/`NEXTAUTH_SECRET`** di env — tanpa itu, middleware yang memanggil `auth()` throw `MissingSecret`.
- **`middleware.ts` → `proxy.ts`**: Next.js 16 men-deprecate convention `src/middleware.ts`, sudah di-rename ke `src/proxy.ts` (isi/logic sama persis, RBAC guard untuk `/admin/*`).
- **Prisma Client & bcryptjs TIDAK edge-compatible** — awalnya `src/proxy.ts` (jalan di Edge runtime) mengimpor `auth` dari `src/lib/auth.ts` yang meng-import Prisma+bcryptjs, ini akan crash di edge runtime. **Fix**: split config Auth.js jadi 2 file mengikuti pola resmi Auth.js v5 —
  - `src/lib/auth.config.ts` — edge-safe, cuma `pages`/`session`/`callbacks`, `providers: []` (TIDAK boleh import Prisma/bcrypt di sini).
  - `src/lib/auth.ts` — full config (Node runtime), spread `authConfig` + tambah provider Credentials (pakai `db`+`bcrypt`) & Google. Dipakai oleh route handler `api/auth/[...nextauth]` dan server actions.
  - `src/proxy.ts` — bikin instance `NextAuth(authConfig)` sendiri (bukan import dari `lib/auth.ts`) khusus untuk cek session di middleware.
  Kalau nanti nambah provider/adapter baru yang butuh Node API, taruh di `auth.ts`, **jangan** di `auth.config.ts`.
- Port dev default 3000 kadang dipakai proses lain di mesin ini → Next otomatis pindah ke 3001; kalau curl manual, cek log `next dev` untuk port aktualnya.
- Diagnostik editor `OWL000 "Syntax error in expression"` yang muncul di banyak file `.ts`/`.tsx` baru adalah **false positive** dari linter/parser IDE yang salah konfigurasi (bukan TypeScript/ESLint beneran) — selalu cross-check dengan `pnpm exec tsc --noEmit` & `pnpm lint`, jangan panik duluan liat diagnostic itu.

### 8.4 Status Database & Auth lokal (per 2026-07-01, update kedua)
- **Postgres lokal**: pakai Postgres.app yang sudah jalan di mesin ini (bukan container baru), port 5432, host `localhost`. Kredensial: **user `postgres` / password `postgres`**. Database khusus project: **`ecommerce_pratama_jaya`** (dibuat manual via `CREATE DATABASE`, terpisah dari db-db project lain yang ada di server Postgres yang sama seperti `agent_ai`, `cvai`, dll — jangan sentuh yang lain).
- `.env` dan `.env.local` (gitignored, isi sama) sudah berisi `DATABASE_URL` ke db di atas + `NEXTAUTH_SECRET`/`AUTH_SECRET` random. Prisma CLI hanya baca `.env` (bukan `.env.local`) makanya keduanya perlu ada & sinkron.
- **Migrasi sudah jalan**: `prisma/migrations/20260701035244_init/` — schema live 1:1 dengan `prisma/schema.prisma`.
- **Seed sudah dibuat & dijalankan**: `prisma/seed.ts` (jalankan via `pnpm db:seed`), berisi 3 akun contoh:
  - Super Admin: `admin@pratamajaya.com` / `Admin12345!`
  - Staff Gudang (assigned ke "Gudang Utama Jakarta" / `WH-JKT-01`): `staff.gudang@pratamajaya.com` / `Staff12345!`
  - Customer: `customer@pratamajaya.com` / `Customer123!`
- **Halaman `/login` dan `/register` sudah dibuat & berfungsi** (`src/app/(auth)/login/`, `src/app/(auth)/register/`) — pakai Server Actions (`useActionState` + `<form action={...}>`), bukan client-side `next-auth/react`. Provider Google otomatis di-skip kalau `GOOGLE_CLIENT_ID`/`SECRET` kosong di env (lihat `googleProvider` guard di `auth.ts`), supaya tidak crash saat provider belum dikonfigurasi.
- **Sudah dites end-to-end pakai Playwright** (`pnpm add -D playwright`, sudah masuk `package.json` — sengaja dipertahankan karena `docs/TECHSTACK.md` memang merencanakan Playwright utk E2E): login admin sukses ke `/admin/dashboard`, login customer sukses autentikasi tapi correctly diblokir RBAC dari rute admin & dilempar balik ke `/login`, password salah menampilkan pesan error dan tidak redirect. Semua sesuai desain.

### 8.5 Yang BELUM dikerjakan (next steps jelas)
- Form CRUD produk (`/admin/products/new`, `/admin/products/[id]/edit`) — UI tambah/edit produk lengkap dengan upload gambar.
- Integrasi Xendit/Biteship live API (saat ini masih menggunakan mock/sandbox fallback ketika API key kosong di env).
- Repo **belum di-`git init`** — belum ada version control aktif untuk project ini.
- Icon PWA (`/icons/icon-192.png` dll) & service worker (Serwist) belum dibuat — manifest.json baru kerangka.
- Halaman `/account/addresses` (form tambah/edit alamat), `/account/profile` (edit nama), `/account/security` (ubah password) — UI stub belum ada.

### 8.6 Fitur yang Sukses Diintegrasikan (Update Terbaru: 2026-07-01 — Dashboard Lengkap)
- **Halaman Listing Produk (`/products`)**: Filter harga, rating, pencarian teks, sorting (*Terlaris*, *Terbaru*, *Harga*, *Rating*).
- **Halaman Keranjang (`/cart`)**: Zustand terintegrasi penuh, checkout flow dinamis Biteship & pembayaran simulasi.
- **Real-Time Notification & Antrean Gudang**: Auto-polling, `NotificationBanner`, WMS Server Actions.
- **Dashboard Super Admin** — Lengkap dengan halaman:
  - `/admin/dashboard` — KPI cards + tabel order terbaru
  - `/admin/products` — List produk dengan filter, status, badge varian
  - `/admin/orders` — List semua order + filter status + link tracking
  - `/admin/customers` — List customer + total belanja + status akun
  - `/admin/vouchers` — List + form tambah voucher, delete voucher
  - `/admin/reports` — KPI total, distribusi status order, top produk, penjualan 7 hari
  - `/admin/settings` — Info toko, akun admin, notifikasi, info sistem
  - `/admin/warehouses/dashboard` — Antrean order gudang (real-time)
- **Dashboard Staff Gudang** — Lengkap dengan:
  - `/admin/warehouses/dashboard` — Antrean order, proses & kirim order
  - `/admin/warehouses/stock` — Monitor stok per SKU, alert stok menipis/habis
  - `/admin/warehouses/shipments` — Riwayat pengiriman, status, waybill, tracking
  - Sidebar menampilkan menu berbeda berdasarkan role (Super Admin vs Staff Gudang)
- **Dashboard Customer** — Lengkap dengan:
  - `/account` — Profil, alamat tersimpan, pesanan terbaru
  - `/orders` — List semua pesanan dengan status, tombol bayar, lacak pesanan
- **Sidebar Admin**: Menampilkan nama & role dari session Auth.js (bukan hardcode), tombol logout via `signOut`.
- **Header Storefront**: Menampilkan avatar+nama jika sudah login, link ke akun/dashboard sesuai role. Tampil Masuk+Daftar jika guest.
- **SessionProvider**: Root layout wrap `StorefrontSessionProvider`, admin layout wrap `AdminSessionProvider` — `useSession` berfungsi di semua halaman.
- **TypeScript**: `pnpm exec tsc --noEmit` sukses tanpa error setelah semua perbaikan.

### 8.7 Fitur Ulasan, Rating Bintang, Pre-Order & Diskon (2026-07-01 — dilengkapi)
Sebelumnya `CatalogService` (getBestSellers & getProductDetail) memakai **data palsu hardcode** untuk diskon (`originalPrice = price * 1.15`, label selalu "15% OFF") dan fallback rating/review palsu (rating 4.8/5.0 & 2 review dummy) saat data DB kosong. Ini sudah dibereskan:
- **Skema**: tambah kolom `Product.compareAtPrice` (`Decimal?`, migration `20260701060635_add_product_compare_at_price`) — kalau diisi & lebih besar dari `basePrice`, dianggap sedang diskon; kalau `null`/lebih kecil, **tidak ada** badge/label diskon yang dirender (dulu selalu tampil 15% palsu).
- **`catalog-service.ts`**: diskon (`discount`/`discountLabel`/`originalPrice`) sekarang dihitung dari `compareAtPrice` asli; rating/reviewCount dihitung dari baris `Review` sungguhan — kalau 0 review, tampilkan **"Belum ada ulasan"** dan rating `0` (bukan angka fallback palsu).
- **`src/lib/format.ts`** (baru): `formatRelativeTime(date)` untuk label waktu ulasan ("2 hari yang lalu", dst) — dipakai menggantikan `timeAgo: "Baru saja"` yang dulu hardcode untuk semua review dari DB.
- **`src/components/shared/star-rating.tsx`** (baru): komponen `<StarRating rating max size />` reusable, dipakai di home page (card produk) & halaman detail produk (ringkasan rating + tiap baris ulasan) — menggantikan loop `<Star>` manual yang tidak reflect rating asli per review.
- **Form ulasan** (`src/components/storefront/review-form.tsx` + `src/app/products/actions.ts` — keduanya sudah ada sebelumnya tapi **belum dipasang**) sekarang **ditempel di tab "Review"** halaman `/products/[slug]` — customer yang login bisa kasih rating 1-5 bintang + komentar, submit via server action `addReviewAction`, langsung `router.refresh()` sehingga rating/list ulasan ter-update tanpa reload manual. User belum login melihat pesan "harus masuk dulu".
- **Panel info Pre-Order** ditambahkan di halaman detail produk (sebelumnya cuma ada badge kecil "Pre-Order" tanpa detail): menampilkan estimasi tanggal kirim (`preorderEstimatedDate`) dan skema pembayaran (Full vs DP + persentase `preorderDpPercentage`) dari data produk asli. Alur DP/pelunasan saat checkout **sudah lengkap sebelumnya** di `checkout-service.ts`/`checkout-form.tsx`, tidak diubah.
- **Seed data** (`prisma/seed.ts`) diperluas: 2 dari 6 produk contoh diberi `compareAtPrice` (diskon nyata ~22% & ~19%), ditambah 2 user "reviewer" (Andi Wijaya, Siska Putri) selain customer utama (Budi Santoso), dan tiap produk (kecuali produk PO yang baru) diberi 1-3 baris `Review` asli dengan `createdAt` mundur (`daysAgo`) supaya `formatRelativeTime` menghasilkan label yang variatif & realistis.
- **Bug seed penting yang diperbaiki**: `db.product.upsert` sebelumnya pakai `update: {}` (kosong) — artinya kalau product row sudah ada dari run seed sebelumnya, field baru seperti `compareAtPrice` **tidak pernah ter-apply** meski sudah ditambahkan ke `productsData`. Fix: `update` sekarang diisi field yang sama dengan `create`, supaya re-run `pnpm db:seed` selalu sinkron dengan `productsData` terbaru. **Kalau nambah field baru ke seed products lagi, jangan lupa re-check upsert ini.**
- Sudah dites end-to-end via Playwright: submit ulasan sebagai customer login berhasil & langsung muncul di halaman produk tanpa reload; `pnpm build` 25 route sukses.

### 8.8 Master Data & CRUD Dashboard Super Admin (2026-07-01 — "Fungsikan semuanya")
Sebelumnya diskon/preorder/rating/ulasan/banner sudah *dibaca* secara dinamis dari DB (§8.7), tapi **belum ada UI untuk mengubahnya** — field-field itu cuma bisa diisi lewat `prisma/seed.ts`. Sekarang semua sudah jadi master data lengkap dengan CRUD di dashboard Super Admin:

- **Kategori** — `/admin/categories` (`src/app/admin/categories/`): create (inline form) + edit (dialog, `category-edit-dialog.tsx`) + delete (`ConfirmDeleteButton`, ditolak kalau masih dipakai produk). Slug auto-generate dari nama.
- **Produk** — `/admin/products/new` & `/admin/products/[id]/edit` (`src/app/admin/products/product-form.tsx` dipakai bersama utk create & edit): field lengkap termasuk **`compareAtPrice` (diskon)**, **checkbox Pre-Order + skema pembayaran (Full/DP) + persentase DP + estimasi tanggal kirim**, berat/dimensi (utk ongkir), gambar (textarea 1 URL/baris), dan **varian dinamis** (SKU/nama/harga/stok, bisa tambah/hapus baris). Delete produk ditolak kalau sudah pernah dipesan (`OrderItem` ada) — sarankan arsipkan (`status: ARCHIVED`) saja.
  - **Bug yang sempat kejadian & sudah diperbaiki**: server action `createProductAction` awalnya memanggil `redirect()` di dalam try/catch client (`ProductForm`) — di Next.js, `redirect()` bekerja dengan cara `throw` error khusus (`NEXT_REDIRECT`), jadi kalau dipanggil dari server action yang di-invoke via `startTransition` + try/catch di client, redirect itu **ketangkep sebagai error palsu** ("Gagal menyimpan produk" padahal sukses). Fix: action mengembalikan `{ id }` alih-alih redirect, navigasi (`router.push`) dilakukan di client setelah sukses. **Kalau bikin server action baru yang dipanggil dari client component via try/catch, jangan panggil `redirect()` di dalamnya** — return data & redirect di client, atau pastikan tidak dibungkus try/catch.
- **Banner Homepage** — `/admin/banners` (model baru `Banner`, migration `20260701064947_add_banner`): create/edit (dialog, `banner-form-dialog.tsx`) + delete. Field: `badgeText`, `title`, `subtitle`, `imageUrl`, `ctaLabel`, `ctaLink`, `sortOrder` (index `0` = banner utama, sisanya banner samping), `isActive`. Home page (`src/app/page.tsx`) sekarang fetch `CatalogService.getActiveBanners()` — kalau tidak ada banner aktif, section hero disembunyikan total (bukan nampilin placeholder rusak).
  - **Spesifikasi ukuran gambar banner** (supaya Super Admin bisa desain manual di Canva lalu tinggal tempel link): Banner Utama **1200×545px** (rasio 2.2:1), Banner Samping **600×270px** (rasio sama, lebih kecil). Info ini ditampilkan langsung di form (`banner-form-dialog.tsx`) dan didokumentasikan di [UIUX.md](./UIUX.md) §8. Kalau upload ke hosting selain Unsplash/placehold.co/Google, hostname-nya wajib ditambah ke `next.config.ts` → `images.remotePatterns` (sudah ditambahkan `i.imgur.com` sebagai opsi hosting gratis yang disarankan).
- **Moderasi Ulasan** — `/admin/reviews`: list semua ulasan lintas produk (nama produk, customer, rating bintang, komentar, tanggal) + delete (tidak ada create — ulasan cuma bisa dibuat customer dari halaman produk).
- **Data Gudang & Akun Staff Gudang** — `/admin/warehouses`: 
  - CRUD lokasi gudang (`warehouse-form-dialog.tsx`): nama, kode (unik), telepon, provinsi/kota/kecamatan/kode pos/alamat lengkap, Biteship Area ID (opsional), status aktif. Delete ditolak kalau gudang masih punya order atau staff assigned.
  - **Generate akun Staff Gudang HANYA dari sini** (form "Generate Akun Staff Gudang Baru" di halaman yang sama): input nama/email/password + pilih gudang, langsung bikin `User` role `STAFF_GUDANG` (password di-hash bcrypt) + baris `WarehouseStaff`. Halaman `/register` publik **tetap cuma bisa bikin akun `CUSTOMER`** (hardcoded di `src/app/(auth)/register/actions.ts`, tidak diubah) — jadi baik sebelum maupun sesudah perubahan ini, **role SUPER_ADMIN dan STAFF_GUDANG tidak pernah bisa dibuat lewat halaman publik**, hanya lewat dashboard Super Admin (atau `prisma/seed.ts` untuk akun awal). Login (`/login`) tetap satu halaman untuk semua role — dibedakan lewat RBAC di `src/proxy.ts`.
- **Sidebar Admin** (`src/components/admin/admin-sidebar.tsx`) — ditambah menu: Kategori, Banner, Ulasan, Data Gudang (terpisah dari "Dashboard Gudang" yang sudah ada).
  - **Bug laten yang ditemukan & diperbaiki**: ada hack lama `if (item.href === "/admin/warehouses/dashboard" && idx > 0) return null` yang awalnya dipakai buat nyembunyiin 1 entri duplikat khusus di `WAREHOUSE_STAFF_NAV`. Begitu ditambah entri baru "Dashboard Gudang" ke `SUPER_ADMIN_NAV` yang hrefnya sama, hack itu ikut nyembunyiin menu barunya juga (karena cuma ngecek href, bukan nav-list mana yang lagi dipakai). **Fix**: hapus entri duplikat di `WAREHOUSE_STAFF_NAV` (memang dead code), ganti logic `isActive` jadi: kalau href diawali `/admin/warehouses` pakai **exact match**, selain itu baru `startsWith` — supaya "Data Gudang" (`/admin/warehouses`), "Dashboard Gudang" (`/admin/warehouses/dashboard`), "Stok Gudang", dan "Pengiriman" tidak saling menyalakan satu sama lain di sidebar.
- **Duplicate-slug handling**: `createCategoryAction`/`updateCategoryAction` sekarang cek slug bentrok dulu sebelum insert dan lempar pesan error yang jelas ("Sudah ada kategori dengan nama/slug yang sama"), bukan biarin raw Prisma unique-constraint error nyampe ke user.
- Semua CRUD di atas sudah dites end-to-end via Playwright (create kategori → create produk dgn diskon+preorder → verifikasi tampil di storefront → edit hapus diskon → verifikasi hilang → create banner → verifikasi tampil di homepage → create gudang → generate staff → login sebagai staff baru → staff **ditolak** akses `/admin/warehouses` karena bukan Super Admin). `pnpm build` sukses 30 route.

### 8.9 Bug: Login langsung dari `/login` tidak redirect ke dashboard sesuai role (2026-07-01 — diperbaiki)
User melaporkan: setelah login sukses, tidak diarahkan ke dashboard. Penyebab: `loginWithCredentials` (`src/app/(auth)/login/actions.ts`) selalu `redirectTo: callbackUrl`, dan `callbackUrl` cuma terisi benar (mis. `/admin/products`) kalau user awalnya **dilempar ke `/login` oleh middleware** (`src/proxy.ts`) karena mencoba akses halaman admin yang diblokir. Kalau user membuka `/login` **langsung** (link navbar, ketik URL manual, dll — skenario paling umum), `callbackUrl` default `"/"`, jadi Super Admin/Staff Gudang yang login pun cuma balik ke homepage storefront, bukan ke dashboard mereka.

**Fix**: `signIn` sekarang dipanggil dengan `redirect: false` (supaya tidak langsung throw redirect internal), lalu kalau `callbackUrl` masih default `"/"` (artinya user tidak datang dari halaman spesifik yang diblokir), sistem query `db.user.findUnique({ where: { email } })` untuk tahu role-nya dan `redirect()` manual: `STAFF_GUDANG` → `/admin/warehouses/dashboard`, `SUPER_ADMIN`/`CS` → `/admin/dashboard`, `CUSTOMER` → `/`. Kalau `callbackUrl` bukan default (user memang lagi diarahkan balik ke halaman tertentu), itu yang diprioritaskan.

**Kenapa tidak pakai `auth()` buat baca role setelah `signIn`**: sempat dipertimbangkan panggil `auth()` langsung setelah `signIn(..., {redirect:false})` buat baca session, tapi itu **tidak reliable** — cookie session baru yang di-set oleh `signIn` belum tentu langsung kebaca oleh `auth()` di request/server-action yang sama (cookie itu baru "efektif" di request browser berikutnya). Makanya dipakai lookup role langsung dari `email` yang sudah pasti valid (karena `signIn` tidak throw), bukan bergantung ke session yang mungkin belum ke-refresh.

Sudah dites ulang via Playwright: login langsung dari `/login` (tanpa `callbackUrl`) untuk ketiga role — Super Admin → `/admin/dashboard`, Staff Gudang → `/admin/warehouses/dashboard`, Customer → `/`. Semua sesuai ekspektasi.

### 8.10 UI Fixes: warna sidebar, layout settings, lokasi tombol Keluar, toast login/logout (2026-07-01)
- **Sidebar admin salah warna (gelap/hitam)**: waktu setup token warna pertama kali (§ awal), `--sidebar`/`--sidebar-foreground`/dst di `globals.css` `:root` (mode light) sempat di-set ke palet gelap (`#191b23`) — padahal mockup asli (`ui-ux/admin_dashboard/code.html`) pakai `bg-surface-container` yang terang (`#ededf9` per `DESIGN.md`). **Fix**: token sidebar light-mode dikembalikan ke `#ededf9` (bg) / `#191b23` (foreground/teks) / `#e7e7f3` (hover) / `#c3c6d7` (border), sesuai desain asli. Kalau nanti nambah dark-mode toggle beneran, token `.dark` sudah ada terpisah dan tidak kena isu ini.
- **Halaman `/admin/settings` tidak full-span**: container-nya punya class `max-w-3xl` yang bikin lebih sempit dari halaman admin lain. Dihapus, dan 4 section card (Info Toko, Akun, Notifikasi, Info Sistem) sekarang disusun dalam grid `xl:grid-cols-2` biar tetap enak dibaca di layar lebar (bukan 1 kolom penuh yang bikin form row jadi kepanjangan).
- **Tombol Keluar dipindah dari sidebar ke navbar/topbar**: `AdminTopbar` (`src/components/admin/admin-topbar.tsx`) sekarang punya dropdown akun fungsional (nama + role + "Pengaturan Akun" + "Keluar") menggantikan tombol "Account" yang sebelumnya cuma dekorasi. Sidebar (`admin-sidebar.tsx`) sekarang cuma nampilin info user (avatar inisial + nama + role), tombol Keluar-nya dihapus dari situ supaya tidak dobel.
  - **Bug Base UI yang sempat muncul & sudah diperbaiki**: `DropdownMenuLabel` (dari `@base-ui/react/menu`, dipakai shadcn/ui `dropdown-menu.tsx`) internally pakai `Menu.GroupLabel`, yang **wajib** dibungkus `<Menu.Group>` (`DropdownMenuGroup`) — kalau langsung dipasang di bawah `DropdownMenuContent` tanpa `DropdownMenuGroup`, throw runtime error `"MenuGroupContext is missing"`. Fix: bungkus `<DropdownMenuLabel>` dengan `<DropdownMenuGroup>`. `DropdownMenuItem` biasa (bukan label) **tidak** butuh dibungkus Group, jadi item-item lain di dropdown ini sengaja dibiarkan tanpa Group pembungkus.
- **Toast notifikasi saat login & logout berhasil**: komponen baru `src/components/shared/auth-toast.tsx` (client component, di-mount di `src/app/layout.tsx` dalam `<Suspense>` — wajib disuspense karena pakai `useSearchParams()`, kalau tidak Next.js build akan komplain/deopt halaman statis) baca query param `?login=success` / `?logout=success`, nampilin `toast.success(...)`, lalu langsung bersihin query param itu dari URL (`router.replace`) biar gak muncul lagi kalau di-refresh.
  - Redirect tujuan login (`src/app/(auth)/login/actions.ts`) semuanya ditambah `?login=success` (baik redirect berbasis role maupun redirect balik ke `callbackUrl` custom, via helper `appendQueryParam`). Google OAuth (`loginWithGoogle`) juga diarahkan ke `/?login=success`.
  - `signOut({ callbackUrl: "/login?logout=success" })` dipanggil dari dropdown akun di topbar (sebelumnya dari tombol di sidebar yang sudah dihapus).
- Semua sudah dites end-to-end via Playwright: warna sidebar (`rgb(237, 237, 249)` = `#ededf9`), settings full-span (0 elemen `max-w-3xl`), sidebar tanpa tombol Keluar, dropdown topbar bisa dibuka & berisi "Pengaturan Akun"+"Keluar", toast login & logout keduanya muncul, `pnpm build` tetap sukses 30 route.
- **Kartu "Insight Gudang" di `/admin/dashboard` diganti** — sebelumnya statis/palsu (teks "Kapasitas penyimpanan 82%" hardcode, tombol "Optimasi Stok" tidak ngapa-ngapain). Diganti kartu "Perlu Tindakan Gudang" berisi data asli: jumlah produk stok menipis (`ProductVariant.stock <= 5`) & jumlah order belum diproses (status `PAID`/`WAITING_STOCK`), daftar 3 produk paling menipis, dan tombol yang beneran link ke `/admin/warehouses/stock`.

### 8.11 Pembayaran Manual (Transfer Bank & QRIS Statis) — Xendit Dinonaktifkan Sementara (2026-07-01)
User memutuskan: **Xendit belum dipakai dulu** (disimpan untuk nanti kalau skala bisnis sudah lebih besar) — untuk sekarang checkout **hanya pakai transfer bank manual**, dikonfirmasi manual oleh admin. Soal QRIS: user ditanya dan **memilih skip QRIS dulu** (fokus transfer bank saja) — tapi arsitektur data & UI tetap dibuat generik/menerima 2 tipe (`BANK_TRANSFER` & `QRIS_STATIC`) supaya QRIS statis tinggal ditambah lewat admin tanpa ubah kode, kalau nanti dibutuhkan.

**Catatan penting soal QRIS** (sempat dijelaskan ke user, simpan untuk konteks masa depan): **QRIS dinamis (nominal auto ke-embed) SELALU butuh PJSP/payment gateway** (Xendit, Midtrans, Tripay, dll) — ini batasan regulasi settlement QRIS Indonesia, bukan sekadar soal kode, jadi tidak bisa "bikin sendiri" tanpa integrasi provider. Alternatif tanpa gateway: **QRIS statis** (1 gambar QR dari BCA mobile bisnis/GoBiz/DANA Bisnis/ShopeePay merchant, gratis) — customer input nominal manual sendiri saat scan, mirip alur transfer bank (perlu konfirmasi manual admin juga). Skema `PaymentChannelType.QRIS_STATIC` di bawah ini sudah siap dipakai untuk opsi ini kapan pun mau diaktifkan.

- **Schema baru**: 
  - `enum PaymentChannelType { BANK_TRANSFER, QRIS_STATIC }` + model `PaymentChannel` (`payment_channels`) — master data rekening/QRIS: `label`, `bankName`/`accountNumber`/`accountHolder` (utk transfer) ATAU `qrisImageUrl` (utk QRIS statis), `instructions`, `sortOrder`, `isActive`.
  - `enum PaymentMethod` (yang sudah ada, dulu cuma VA/QRIS/EWALLET/INVOICE) ditambah **`MANUAL_TRANSFER`**.
  - Model `Payment` ditambah `paymentChannelId` (FK ke `PaymentChannel`) dan `proofUrl` (link gambar bukti transfer, sama seperti pola gambar lain di app — cuma URL, belum ada file upload beneran).
  - Migration: `20260701074333_add_payment_channel`.
- **CRUD Rekening & QRIS** — section baru di `/admin/settings` (`payment-channel-actions.ts` + `payment-channel-form-dialog.tsx`), pola sama seperti CRUD Banner/Warehouse (dialog create/edit + `ConfirmDeleteButton`). Delete ditolak kalau rekening itu sudah pernah dipakai transaksi (`Payment.paymentChannelId` ada) — disarankan nonaktifkan (`isActive: false`) saja.
- **Checkout diubah total** (`checkout-form.tsx`): section "Metode Pembayaran (Xendit Gateway)" yang nampilin VA/QRIS/GoPay palsu **dihapus**, diganti daftar rekening/QRIS aktif asli dari `PaymentChannel` (radio card, tampil nomor rekening/gambar QRIS). `CheckoutService.placeOrder` sekarang punya 2 jalur:
  - `paymentMethod: "manual_transfer"` (satu-satunya yang dipakai UI sekarang) → **skip Xendit sepenuhnya**, `Payment.method = MANUAL_TRANSFER`, link ke `PaymentChannel` yang dipilih, redirect ke `/orders/{orderId}` (bukan URL invoice Xendit).
  - Jalur lama `"va"|"qris"|"gopay"` (kode Xendit) **dibiarkan dormant, tidak dihapus** — supaya gampang diaktifkan lagi nanti tinggal render ulang UI-nya & ganti `paymentMethod` yang dikirim, tanpa perlu nulis ulang integrasi Xendit dari nol.
- **Halaman baru `/orders/[id]`** (customer, perlu login & harus pemilik order): kalau order `PENDING_PAYMENT` + metode `MANUAL_TRANSFER` → tampilkan instruksi transfer (nomor rekening/QRIS + total + nomor order sbg referensi) dan form kirim bukti transfer (`proof-form.tsx`, submit URL gambar via server action `submitPaymentProofAction`). Kalau bukti sudah dikirim, tampilkan status "menunggu konfirmasi admin" (read-only, tidak bisa submit ulang).
- **Notifikasi push ke admin saat bukti transfer masuk**: `submitPaymentProofAction` bikin baris `Notification` (`type: PAYMENT_PROOF_SUBMITTED`, enum baru) untuk **setiap** user `role: SUPER_ADMIN` aktif. Topbar admin (`AdminTopbar`, cuma utk role `SUPER_ADMIN`) sekarang punya `<AdminNotificationBell />` (`src/components/admin/admin-notification-bell.tsx`) — polling `/api/admin/notifications` tiap 5 detik, badge counter, dropdown daftar notifikasi, toast kalau ada notifikasi baru masuk, klik notifikasi = tandai dibaca + redirect ke `/admin/orders`.
  - `/api/admin/notifications` (`route.ts`) diperluas: kalau ada query `?warehouseId=` → notifikasi antrean gudang (perilaku lama, dipakai dashboard staff gudang); kalau tidak ada → notifikasi personal `userId: session.user.id` (dipakai bell Super Admin di atas).
  - **Bug pre-existing yang ikut kefix**: `notification-banner.tsx` (dashboard staff gudang) manggil `fetch("/api/admin/notifications/read", ...)` buat mark-as-read — padahal route `/read` itu **tidak pernah ada** (404 diam-diam, notifikasi gudang gak pernah kebaca beneran). Fix: diarahkan ke `/api/admin/notifications` (POST) yang memang sudah punya logic mark-read dari awal.
- **Konfirmasi pembayaran manual oleh admin**: tombol "Konfirmasi Bayar" baru di baris tabel `/admin/orders` (`confirm-payment-button.tsx` + `admin/orders/actions.ts` → `confirmManualPaymentAction`), muncul kalau order `PENDING_PAYMENT` & payment method `MANUAL_TRANSFER`. Klik → `Payment.status = PAID`, `Order.status = PAID`, catat `OrderStatusHistory`, tandai notifikasi `PAYMENT_PROOF_SUBMITTED` terkait sebagai dibaca.
- **Push notifikasi ke gudang tujuan setelah payment di-approve** (diminta terpisah, ternyata sudah otomatis ke-cover oleh `confirmManualPaymentAction` di atas): begitu admin konfirmasi, kalau order punya `warehouseId`, langsung dibikinkan `Notification` baru (`type: NEW_ORDER`, judul "Order Siap Diproses") ke gudang tujuan — otomatis muncul di `NotificationBanner` yang sudah ada di `/admin/warehouses/dashboard` (tidak perlu komponen baru, infrastrukturnya sudah ada dari sebelumnya).
- **Seed**: `prisma/seed.ts` ditambah 2 `PaymentChannel` contoh (BCA & Mandiri, atas nama "PT Pratama Jaya Sejahtera") supaya `/admin/settings` & checkout tidak kosong dari awal.
- Sudah dites end-to-end via Playwright, skenario penuh: admin bikin rekening baru → customer checkout pilih rekening itu (opsi Xendit tidak lagi muncul) → redirect ke `/orders/{id}` menampilkan instruksi & nomor rekening yang benar → customer submit bukti transfer → notifikasi `PAYMENT_PROOF_SUBMITTED` muncul di admin (via API) → admin klik "Konfirmasi Bayar" di `/admin/orders` → order jadi `PAID` & tombol konfirmasi hilang → notifikasi `NEW_ORDER` otomatis dibuat untuk gudang tujuan → halaman order customer tidak lagi menampilkan instruksi pembayaran. `pnpm build` sukses 32 route (nambah `/orders/[id]`).

### 8.12 Biteship: biaya & upload file lokal (2026-07-01)
- **Biteship costing** (dicek langsung via web search ke halaman resmi `biteship.com/id/harga`, bukan dari ingatan training — nomor bisa berubah, selalu cross-check ulang kalau dipakai buat keputusan bisnis serius): Rates API Rp 5/request, Tracking API Rp 10/request, Map/Area API Rp 2/request, plugin WooCommerce/Shopify mulai Rp 99rb/bulan (opsional, tidak dipakai di project ini), fulfillment/gudang titip mulai Rp 2rb/pick&pack (opsional). Tidak ada biaya langganan wajib buat integrasi API dasar — model bisnisnya pay-per-request + saldo top-up buat generate resi. Modal awal kecil, bukan biaya besar di depan.
- **Upload file lokal (bukan cloud storage)**: user awalnya diberi pilihan provider cloud (Vercel Blob/Cloudinary/Supabase Storage) untuk ganti pola "tempel URL gambar", tapi user pilih **simpan di disk server lokal saja** (tanpa layanan pihak ketiga). Diimplementasikan:
  - `src/app/api/upload/route.ts` — route handler `POST` yang terima `multipart/form-data`, validasi tipe (JPG/PNG/WebP) & ukuran (maks 5MB), simpan ke `public/uploads/<uuid>.<ext>` pakai `fs/promises.writeFile`, return `{ url: "/uploads/<uuid>.<ext>" }`. Wajib login (`auth()`) buat upload.
  - `src/components/shared/file-upload-input.tsx` — komponen reusable `<FileUploadInput value onChange label />` dengan preview gambar + tombol upload; dipakai di `src/app/orders/[id]/proof-form.tsx` (ganti input URL manual bukti transfer jadi upload file beneran).
  - **Folder `public/uploads/` di-gitignore** (`.gitkeep` doang yang di-track) — file yang diupload user tidak boleh ke-commit ke repo.
  - **Batasan penting yang harus diingat**: pendekatan ini nyimpen file di filesystem lokal proses Next.js — **cocok untuk dev/VPS/self-hosted**, tapi **TIDAK akan jalan kalau nanti deploy ke platform serverless** (Vercel, dst) karena filesystem di sana ephemeral (hilang tiap deploy/cold start). Kalau nanti pindah ke serverless, wajib ganti ke object storage beneran (S3/Cloudinary/Vercel Blob/Supabase Storage) — cukup ganti isi `route.ts` upload-nya, komponen `FileUploadInput` & pemanggilnya tidak perlu berubah karena kontraknya cuma "kirim file, terima URL".
  - Pola yang sama (`FileUploadInput`) bisa dipakai juga nanti buat gambar produk/banner/QRIS kalau mau diganti dari "tempel URL" jadi upload — belum dikerjakan, baru bukti transfer yang sudah dipindah.
- Sudah dites end-to-end via Playwright pakai file PNG asli (bukan mock URL): upload → preview muncul → submit → file benar-benar tersimpan di `public/uploads/` & bisa diakses via HTTP 200 → `proofUrl` di DB kesimpen path yang benar.

### 8.13 Admin Orders: modal detail (bukan tab baru) + toast konfirmasi (2026-07-01)
User komplain 2 hal di `/admin/orders`: (1) tombol "Detail" buka tab baru kosong (`target="_blank"` ke `/track/{id}`) alih-alih modal, (2) tombol "Konfirmasi Bayar" pakai `confirm()` browser bawaan yang jelek.

- **Modal Detail Order** — `src/app/admin/orders/order-detail-dialog.tsx` (baru): dialog berisi info customer, alamat, item pesanan + subtotal/ongkir/diskon/total, dan info pembayaran (metode, status, thumbnail bukti transfer kalau ada). Data order yang sudah di-`include` di query list (`user`, `items`, `address`, `payments`) di-serialize jadi plain object (Decimal → `Number(...)`, Date → `.toISOString()`) sebelum dioper ke client component — **wajib**, karena Prisma `Decimal`/`Date` gak bisa lolos serialisasi React Server Component ke Client Component langsung. Tombol "Detail" di tabel diganti dari `<Link target="_blank">` jadi trigger dialog ini.
- **Toast konfirmasi pembayaran** — `confirm-payment-button.tsx` diubah dari `window.confirm()` jadi `toast(...)` (sonner) dengan `action`/`cancel` button bawaan sonner — pesan & tombol "Ya, Konfirmasi"/"Batal" muncul sebagai toast, bukan dialog native browser. (`ConfirmDeleteButton` yang dipakai di halaman CRUD lain — kategori/banner/gudang/ulasan/produk — **belum diubah**, masih pakai `confirm()` native; kalau user minta konsistensi nanti, tinggal terapkan pola sonner yang sama ke situ juga.)
- **Bug nyata yang ketemu user saat testing**: `next/image` (dipakai buat thumbnail bukti transfer di modal) crash — `Invalid src prop (https://test.id) ... hostname "test.id" is not configured`. Ternyata ada data order asli (bukan test data buatanku) dengan `proofUrl` dari domain sembarangan (peninggalan sebelum fitur upload file ada, waktu masih pola "tempel URL manual"). Karena bukti transfer bisa datang dari **URL apa saja** (upload lokal `/uploads/...` ATAU sisa data lama dari domain eksternal), gak realistis whitelist semua kemungkinan hostname di `next.config.ts`. **Fix**: thumbnail bukti transfer di `order-detail-dialog.tsx` pakai `<img>` biasa (bukan `next/image`), supaya render URL dari domain mana pun tanpa perlu whitelist — trade-off: kehilangan optimasi Next Image, tapi acceptable karena cuma thumbnail kecil (size-28) buat preview admin, bukan gambar utama yang perlu dioptimasi.
- Sudah dites end-to-end via Playwright: klik Detail tidak membuka tab baru (jumlah page/tab tetap sama) & modal nampilin data order yang benar; klik Konfirmasi Bayar nampilin toast (bukan native dialog — dicek eksplisit tidak ada `page.on("dialog")` yang triggered) dengan tombol "Ya, Konfirmasi"; setelah konfirmasi, toast sukses muncul & tombol Konfirmasi Bayar hilang dari baris order tsb; modal pada order dengan `proofUrl` domain eksternal (`https://test.id`) dibuka tanpa error runtime.
