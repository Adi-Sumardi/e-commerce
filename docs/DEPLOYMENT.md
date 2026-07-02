# Panduan Deploy ke Hostinger (Business Web Hosting)

Dokumen ini menjelaskan **setup manual satu kali** yang wajib kamu lakukan sendiri di hPanel
Hostinger (Claude tidak punya akses ke akun hosting kamu), plus cara kerja CI/CD-nya setelah
setup ini selesai.

---

## 1. Prasyarat

- Paket **Hostinger Business Web Hosting** (atau lebih tinggi) — wajib yang punya fitur **"Setup
  Node.js App"**. Paket Premium/di bawahnya **tidak** support Node.js.
- Domain **pratamajaya.id** sudah terhubung ke akun Hostinger ini (nameserver/DNS sudah diarahkan).

---

## 2. Setup di hPanel (satu kali)

### 2.1 Buat Database MySQL
1. hPanel → **Databases → MySQL Databases**.
2. Buat database baru, misal nama `u123456_pratamajaya` (Hostinger otomatis prefix `u<id>_`).
3. Buat user database baru, atur password kuat, **assign user itu ke database** dengan privilege penuh (ALL PRIVILEGES).
4. Catat: nama database, username, password. **Host-nya biasanya `localhost`** (karena app & DB satu server).

### 2.2 Setup Node.js App
1. hPanel → **Advanced → Setup Node.js App** (kadang namanya "Node.js Selector").
2. Klik **Create Application**:
   - **Node.js version**: pilih 20.x (LTS).
   - **Application mode**: `Production`.
   - **Application root**: folder khusus untuk app ini, contoh `pratamajaya-app` (JANGAN pakai `public_html` langsung — nanti domain di-mapping terpisah, lihat langkah 2.4).
   - **Application URL**: pilih domain `pratamajaya.id`.
   - **Application startup file**: `server.js` — file ini **otomatis dihasilkan** oleh build Next.js (`output: "standalone"`), bukan file yang perlu kamu buat manual.
3. Setelah dibuat, hPanel akan menampilkan **absolute path** ke Application root, misal:
   `/home/u123456789/domains/pratamajaya.id/pratamajaya-app`
   → **Catat path ini persis**, ini yang akan jadi secret `APP_PATH`.

### 2.3 Aktifkan SSH Access
1. hPanel → **Advanced → SSH Access** → aktifkan kalau belum.
2. Catat **SSH Host** (biasanya seperti `srv123.hostinger.com` atau sebuah IP) dan **SSH Port** (Hostinger biasanya **bukan 22**, sering `65002` — cek di halaman SSH Access-nya).
3. Catat juga **SSH Username** yang ditampilkan di situ.

### 2.4 Generate SSH key khusus untuk deploy (jangan pakai key pribadi kamu)
Di komputer kamu (bukan di server), buat key pair baru khusus CI/CD:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./pratamajaya-deploy-key -N ""
```

Ini menghasilkan 2 file: `pratamajaya-deploy-key` (private) dan `pratamajaya-deploy-key.pub` (public).

1. Buka isi `pratamajaya-deploy-key.pub`, tempel ke hPanel → **Advanced → SSH Access → Manage SSH Keys** (atau append manual ke `~/.ssh/authorized_keys` di server via SSH/File Manager).
2. Simpan isi `pratamajaya-deploy-key` (private key, termasuk baris `-----BEGIN...-----` sampai `-----END...-----`) — ini nanti ditempel ke GitHub Secret `SSH_PRIVATE_KEY`.
3. **Hapus file private key dari komputer kamu setelah ditempel ke GitHub Secrets** (atau simpan di password manager, jangan commit ke repo manapun).

---

## 3. GitHub Secrets

Buka repo → **Settings → Secrets and variables → Actions → New repository secret**, tambahkan semua ini:

| Secret | Isi | Contoh |
|---|---|---|
| `SSH_HOST` | Host SSH dari hPanel (§2.3) | `srv123.hostinger.com` |
| `SSH_PORT` | Port SSH dari hPanel (§2.3) | `65002` |
| `SSH_USERNAME` | Username SSH dari hPanel (§2.3) | `u123456789` |
| `SSH_PRIVATE_KEY` | Isi lengkap private key dari §2.4 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `APP_PATH` | Application root dari §2.2 | `/home/u123456789/domains/pratamajaya.id/pratamajaya-app` |
| `DATABASE_URL` | Connection string MySQL dari §2.1 | `mysql://u123456_dbuser:PASSWORD@localhost:3306/u123456_pratamajaya` |
| `AUTH_SECRET` | Random string (generate baru, JANGAN pakai punya dev lokal) | hasil `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opsional, kosongkan kalau belum pakai login Google | |
| `XENDIT_SECRET_KEY` / `XENDIT_WEBHOOK_TOKEN` | Opsional, kosongkan kalau Xendit belum diaktifkan | |
| `BITESHIP_API_KEY` / `BITESHIP_WEBHOOK_SECRET` | Opsional, kosongkan kalau Biteship belum diaktifkan | |
| `RESEND_API_KEY` | Opsional, kosongkan kalau email transaksional belum dipakai | |

> Secret yang dikosongkan tetap boleh dibuat sebagai secret kosong (`""`) — workflow tidak akan error, cuma fitur terkait (mis. login Google) tidak aktif sampai diisi nanti.

---

## 4. Cara Kerja CI/CD

File: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

1. **Trigger**: setiap `git push` ke branch `main` (juga bisa dipicu manual lewat tab **Actions → Deploy to Hostinger → Run workflow**). Pull request ke `main` cuma menjalankan job build/lint/typecheck (gerbang kualitas), **tidak** deploy.
2. **Job `build`**: install dependencies, `tsc --noEmit`, `eslint`, `prisma generate`, lalu `next build` (menghasilkan `output: standalone` — bundel Node.js mandiri di `.next/standalone/`, sudah termasuk Prisma Client + engine binary Linux karena di-build di runner Ubuntu, sesuai environment Hostinger).
3. **Job `deploy`** (jalan hanya kalau `build` sukses & di branch `main`):
   - Salin (`rsync`) hasil build ke server via SSH ke `APP_PATH` — folder `public/uploads` di server **tidak pernah ditimpa/dihapus** (biar bukti transfer customer yang sudah ada tidak hilang tiap deploy).
   - Tulis file `.env` produksi di server dari GitHub Secrets.
   - Jalankan `prisma migrate deploy` **di server** (via SSH, terhubung ke MySQL lewat `localhost` — **tidak perlu** mengaktifkan "Remote MySQL access" di Hostinger sama sekali, lebih aman).
   - Restart aplikasi dengan cara standar Passenger: `touch tmp/restart.txt` di `APP_PATH` (Passenger otomatis reload app begitu file ini disentuh/berubah).

---

## 5. Deploy pertama kali — checklist

- [ ] Database MySQL dibuat & kredensialnya sudah bener (§2.1)
- [ ] Node.js App dibuat di hPanel, domain `pratamajaya.id` sudah di-assign ke app ini (§2.2)
- [ ] SSH aktif & key deploy sudah ditambahkan (§2.3–2.4)
- [ ] Semua GitHub Secrets di §3 sudah diisi
- [ ] Push ke `main` (atau jalankan manual via tab Actions) → cek tab **Actions** di GitHub, pastikan job `build` dan `deploy` hijau semua
- [ ] Buka `https://pratamajaya.id` — kalau belum muncul, cek di hPanel **Node.js App → Logs** buat lihat error startup, dan pastikan "Application startup file" persis `server.js`

## 6. Troubleshooting umum

- **Domain nampilin halaman default Hostinger, bukan app**: cek lagi domain sudah di-assign ke Node.js App yang benar di hPanel (§2.2), dan/atau document root domain memang menunjuk ke `APP_PATH`.
- **Error 500 / app tidak jalan setelah deploy**: cek **Node.js App → Logs** di hPanel. Penyebab umum: `.env` belum ke-generate (cek step "Write production .env" di GitHub Actions run log), atau `DATABASE_URL` salah format.
- **Migration gagal jalan**: cek user MySQL di §2.1 punya privilege `ALTER`/`CREATE` (bukan cuma SELECT/INSERT) — Prisma migrate butuh itu.
- **SSH connection refused dari GitHub Actions**: double-check `SSH_PORT` (sering BUKAN 22 di Hostinger) dan pastikan public key beneran ke-attach ke akun yang sesuai dengan `SSH_USERNAME`.
