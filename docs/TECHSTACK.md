# Tech Stack
## Aplikasi E-Commerce Online Store

---

## 1. Ringkasan

| Layer | Teknologi |
|---|---|
| Framework | **Next.js 15** (App Router, React Server Components) |
| Bahasa | **TypeScript** (strict mode) |
| Database | **MySQL 8** (diganti dari rencana awal PostgreSQL — lihat docs/MEMORY.md §8.14, disesuaikan ke Hostinger Business Web Hosting yang cuma sediakan MySQL) |
| ORM | **Prisma** |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix UI) |
| Auth | **Auth.js (NextAuth v5)** — credentials + Google OAuth |
| State (client) | **Zustand** (keranjang) + **TanStack Query** (server state/cache) |
| Form & Validasi | **React Hook Form** + **Zod** |
| Payment Gateway | **Xendit API** (Invoice, VA, QRIS, E-Wallet) |
| Shipping Aggregator | **Biteship API** |
| File/Image Storage | **Cloudinary** atau **AWS S3 / Supabase Storage** |
| Email | **Resend** (+ React Email untuk template) |
| Caching/Queue | **Redis** (rate limit, cache ongkir, session) + **BullMQ** (job webhook async, opsional) |
| Hosting | **Hostinger Business Web Hosting** (Node.js App via hPanel/Passenger) + **MySQL** bawaan Hostinger, domain **pratamajaya.id** |
| Monitoring | **Sentry** (error tracking), **Vercel Analytics/PostHog** (product analytics) |
| CI/CD | **GitHub Actions** |
| Testing | **Vitest** (unit) + **Playwright** (E2E) |
| PWA | **Serwist** (`@serwist/next`, penerus `next-pwa`, kompatibel App Router) + Web App Manifest |
| Realtime Notifikasi | **Pusher** / **Ably** atau **Server-Sent Events (SSE)** untuk notifikasi order masuk ke dashboard gudang |

---

## 2. Alasan Pemilihan

### Next.js + TypeScript
- Satu basis kode untuk storefront (SSR/SSG untuk SEO produk) dan admin dashboard (CSR-heavy).
- API Routes/Route Handlers built-in untuk backend + webhook endpoint tanpa server terpisah.
- Middleware untuk RBAC (proteksi `/admin`).
- Type-safety end-to-end dengan Prisma + Zod mengurangi bug integrasi payment/shipping yang kritikal.

### MySQL + Prisma
- Data e-commerce sangat relasional (produk-varian-order-payment-shipment) → cocok untuk RDBMS.
- Mendukung transaksi ACID — penting untuk konsistensi stok & pembayaran.
- Prisma memberi migrasi terversi & query type-safe.
- Dipilih MySQL (bukan PostgreSQL seperti rencana awal) karena paket hosting production (Hostinger Business Web Hosting) cuma menyediakan MySQL, bukan PostgreSQL. Field teks panjang (`description`, `comment`, `note`, `instructions`, `message`, `fullAddress`) wajib pakai `@db.Text` di schema Prisma — default MySQL `String` cuma `VARCHAR(191)`, beda dari Postgres yang defaultnya sudah `TEXT`.

### Xendit
- Menyediakan Invoice API (all-in-one: VA, QRIS, e-wallet, kartu kredit dalam satu link) maupun API granular per metode.
- Webhook signature verification bawaan (`x-callback-token`) untuk keamanan.

### Biteship
- Agregator kurir domestik Indonesia (JNE, J&T, SiCepat, AnterAja, Ninja Express, dll) dalam satu API.
- Menyediakan Rate/Pricing API, Order/Create Shipment API, dan Tracking Webhook.

---

## 3. Struktur Direktori (Usulan)

```
e-commerce/
├── docs/                        # Dokumen ini
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── products/[slug]/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   └── track/[id]/page.tsx      # Tracking realtime
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx               # RBAC guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── customers/page.tsx
│   │   │   └── vouchers/page.tsx
│   │   └── api/
│   │       ├── webhooks/
│   │       │   ├── xendit/route.ts
│   │       │   └── biteship/route.ts
│   │       ├── checkout/route.ts
│   │       ├── shipping/rates/route.ts
│   │       └── ...
│   ├── components/
│   │   ├── ui/                          # shadcn/ui primitives
│   │   ├── storefront/
│   │   └── admin/
│   ├── lib/
│   │   ├── db.ts                        # Prisma client singleton
│   │   ├── auth.ts                      # Auth.js config
│   │   ├── xendit.ts                    # Xendit SDK wrapper
│   │   ├── biteship.ts                  # Biteship API wrapper
│   │   └── validators/                  # Zod schemas
│   ├── server/
│   │   ├── services/                    # business logic (order, payment, shipment)
│   │   └── repositories/                # Prisma queries terisolasi
│   ├── store/                           # Zustand stores
│   └── types/
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 4. Environment Variables (Contoh)

```
DATABASE_URL=mysql://user:password@host:3306/ecommerce
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=

BITESHIP_API_KEY=
BITESHIP_WEBHOOK_SECRET=

RESEND_API_KEY=
CLOUDINARY_URL=
SENTRY_DSN=
REDIS_URL=
```

---

## 5. Dependensi Utama (package.json — inti)

```
next, react, react-dom, typescript
@prisma/client, prisma
next-auth (auth.js v5)
zod, react-hook-form, @hookform/resolvers
zustand, @tanstack/react-query
tailwindcss, class-variance-authority, clsx, lucide-react
xendit-node
resend, react-email
```

> Catatan: Biteship tidak punya SDK resmi Node — gunakan `fetch`/`axios` dengan wrapper di `lib/biteship.ts`.

---

## 6. Strategi Deployment

- **Production**: Hostinger Business Web Hosting (hPanel → Setup Node.js App, dijalankan via Passenger), domain **pratamajaya.id**.
- **Database**: MySQL bawaan Hostinger (satu server dengan aplikasi, tidak perlu managed DB terpisah).
- **CI/CD**: GitHub Actions — build & deploy otomatis ke Hostinger setiap push ke `main` (lihat `.github/workflows/`).
- **Webhook URL**: harus HTTPS publik → gunakan `https://pratamajaya.id` yang didaftarkan di dashboard Xendit & Biteship (begitu diaktifkan).
- **Secrets**: dikelola via GitHub Actions Secrets (bukan Vercel), tidak pernah commit ke repo.

---

## 7. PWA (Progressive Web App)

- **Library**: `@serwist/next` (fork aktif dari `next-pwa`, mendukung Next.js App Router & Turbopack).
- **File tambahan**:
  - `public/manifest.json` — nama app, `short_name`, `icons` (192x192, 512x512, maskable), `theme_color`, `background_color`, `display: "standalone"`, `start_url: "/"`.
  - `src/app/sw.ts` — service worker (precache app shell, runtime cache untuk gambar produk & API GET tertentu; **jangan** cache route checkout/pembayaran/admin).
  - `<meta name="theme-color">` & `<link rel="manifest">` didaftarkan di `app/layout.tsx`.
- **Strategi caching**: `NetworkFirst` untuk halaman dinamis (katalog, order), `CacheFirst` untuk aset statis/gambar, `NetworkOnly` untuk endpoint pembayaran & webhook.
- **Scope**: PWA hanya aktif untuk storefront (customer-facing); admin dashboard tidak perlu installable/offline.
- **Testing**: audit dengan Lighthouse (Chrome DevTools) — target skor PWA ≥ 90.

## 8. Notifikasi Real-time (Order → Dashboard Gudang)

- Saat order berstatus `paid`/siap diproses, sistem mengirim event real-time ke Dashboard Gudang yang login (per gudang tujuan).
- **Opsi implementasi**:
  1. **Pusher/Ably (managed)** — paling cepat diimplementasikan, cocok untuk MVP; publish event dari Route Handler saat webhook Xendit sukses/order di-assign ke gudang.
  2. **Server-Sent Events (SSE)** — tanpa dependency pihak ketiga, cukup untuk skala kecil-menengah (koneksi 1 arah server→client cocok untuk notifikasi).
- Notifikasi juga disimpan di tabel `NOTIFICATION` (lihat [ERD.md](./ERD.md)) agar tetap terlihat walau staff sedang offline saat event terjadi (notification center/bell icon).
- Opsional lanjutan: Web Push (browser push notification) memanfaatkan service worker PWA yang sudah ada di bagian 7, agar staff gudang tetap dapat notifikasi walau tab dashboard tidak sedang dibuka.
