# Deploy Manual ke Hostinger (via SSH/Termius)

Ganti dari CI/CD GitHub Actions ke deploy manual — lebih gampang di-debug pas awal-awal,
karena tiap error kelihatan langsung di terminal.

## Prasyarat (satu kali, lewat hPanel — TIDAK bisa lewat script)

1. **Node.js App sudah dibuat** di hPanel → Website → Node.js → `pratamajaya.id`, dengan
   Application root menunjuk ke folder yang sama dengan `APP_DIR` di script (default:
   `~/domains/pratamajaya.id/public_html`). Ini yang bikin domain "nyambung" ke app Node kita —
   gak bisa diakalin dari script/SSH doang.
2. **Database MySQL** sudah dibuat (hPanel → Databases → MySQL Databases).
3. SSH key kamu (Termius) sudah ditambahkan di hPanel → Advanced → SSH Access.

## Setup pertama kali

```bash
# di server, via Termius
cd ~
git clone git@github.com:Adi-Sumardi/e-commerce.git repo
cd repo
bash deploy/deploy.sh
```

Script ini akan **berhenti** kalau `.env` belum ada di `APP_DIR` (dibuatkan dari `.env.example`)
— edit dulu isinya (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL=https://pratamajaya.id`, dst),
baru jalankan `bash deploy/deploy.sh` lagi.

## Update (tiap ada perubahan kode)

```bash
cd ~/repo
bash deploy/update.sh
```

Ini `git pull` → build ulang → sinkronkan ke `APP_DIR` → migrate → restart Passenger.
**Tidak** menghapus `.env` atau `public/uploads` yang sudah ada di server.

## Kalau `node`/`npm` tidak ketemu

Berarti Node.js App di hPanel belum lengkap ke-setup. Cek path nodevenv manual:
```bash
find ~/nodevenv -maxdepth 5 -name activate
```
Kalau kosong, selesaikan dulu setup Node.js App di hPanel.
