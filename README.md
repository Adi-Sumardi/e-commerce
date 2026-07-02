# Pratama Jaya — E-Commerce Platform

Aplikasi e-commerce full-stack: storefront customer, dashboard Super Admin, dashboard Staff Gudang,
pembayaran transfer manual, integrasi ongkir Biteship, dan PWA.

Dokumentasi lengkap ada di folder [`docs/`](./docs):

- [`docs/BRD.md`](./docs/BRD.md) — kebutuhan bisnis
- [`docs/SRS.md`](./docs/SRS.md) — kebutuhan fungsional/non-fungsional
- [`docs/TECHSTACK.md`](./docs/TECHSTACK.md) — stack teknis & strategi deployment
- [`docs/ERD.md`](./docs/ERD.md) — skema database
- [`docs/LAYOUT.md`](./docs/LAYOUT.md) & [`docs/UIUX.md`](./docs/UIUX.md) — desain & layout
- [`docs/MEMORY.md`](./docs/MEMORY.md) — catatan keputusan teknis & histori perubahan (baca ini dulu kalau lanjut development)

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma · **MySQL** · Auth.js v5 · Zustand

## Setup Lokal

```bash
pnpm install

# copy & isi environment variables
cp .env.example .env.local

# migrasi database (butuh MySQL lokal jalan, DATABASE_URL di .env)
pnpm prisma migrate dev

# isi data contoh (akun admin/staff/customer, produk, dll)
pnpm db:seed

pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun contoh setelah seed

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@pratamajaya.com` | `Admin12345!` |
| Staff Gudang | `staff.gudang@pratamajaya.com` | `Staff12345!` |
| Customer | `customer@pratamajaya.com` | `Customer123!` |

## Scripts

| Command | Keterangan |
|---|---|
| `pnpm dev` | Jalankan dev server |
| `pnpm build` | Build production |
| `pnpm start` | Jalankan hasil build |
| `pnpm lint` | ESLint |
| `pnpm db:seed` | Isi data contoh |

## Deployment

Production: **Hostinger Business Web Hosting** (Node.js App) + MySQL, domain **pratamajaya.id**.
Deploy **manual via SSH/Termius** pakai `deploy/deploy.sh` (setup pertama) dan `deploy/update.sh`
(update selanjutnya) — lihat [`deploy/README.md`](./deploy/README.md) dan
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) untuk panduan lengkap termasuk setup hPanel.
