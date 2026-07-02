#!/usr/bin/env bash
# Setup PERTAMA KALI aplikasi di server Hostinger. Jalankan sekali via SSH/Termius.
# Untuk update selanjutnya, pakai deploy/update.sh (lebih cepat, tidak clone ulang).
#
# Cara pakai (dari home directory server, mis. /home/u685190122):
#   git clone git@github.com:Adi-Sumardi/e-commerce.git repo
#   cd repo
#   bash deploy/deploy.sh
#
# Sebelum jalan, PASTIKAN Node.js App sudah dibuat di hPanel (Website > Node.js)
# supaya domain pratamajaya.id sudah "tahu" mau nunjuk ke folder mana. Isi
# APP_DIR di bawah sesuai "Application root" yang ditampilkan hPanel.

set -euo pipefail

# ==== KONFIGURASI — WAJIB DIISI SESUAI SERVER KAMU ====
APP_DIR="$HOME/domains/pratamajaya.id/public_html"
# Lokasi repo dideteksi otomatis dari posisi script ini (folder hasil git clone).
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION_DIR=""   # contoh: "20" — isi kalau nodevenv butuh path spesifik, lihat catatan di bawah
# ========================================================

echo "==> Mencoba mengaktifkan Node.js (nodevenv Hostinger)..."
NODEVENV_ACTIVATE=$(find "$HOME/nodevenv" -maxdepth 5 -name activate -path "*public_html*" 2>/dev/null | head -n1 || true)
if [ -n "$NODEVENV_ACTIVATE" ]; then
  echo "    Ketemu: $NODEVENV_ACTIVATE"
  # shellcheck disable=SC1090
  source "$NODEVENV_ACTIVATE"
else
  echo "    Tidak ketemu nodevenv otomatis. Pastikan 'node' sudah ada di PATH,"
  echo "    atau isi manual: source ~/nodevenv/domains/pratamajaya.id/public_html/<versi>/bin/activate"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "!! 'node' tidak ditemukan. Selesaikan dulu setup Node.js App di hPanel"
  echo "   (Website > Node.js > pratamajaya.id) sebelum lanjut."
  exit 1
fi

echo "==> Node $(node -v), npm $(npm -v)"

echo "==> Mengaktifkan pnpm via corepack..."
corepack enable
corepack prepare pnpm@10 --activate

echo "==> Install dependencies..."
cd "$REPO_DIR"
pnpm install --frozen-lockfile

echo "==> Generate Prisma Client..."
pnpm exec prisma generate

echo "==> Build (standalone output)..."
pnpm build

echo "==> Menyusun bundle standalone ke $APP_DIR ..."
mkdir -p "$APP_DIR"
cp -r .next/standalone/. "$APP_DIR/"
cp -r public "$APP_DIR/public"
mkdir -p "$APP_DIR/.next/static"
cp -r .next/static/. "$APP_DIR/.next/static/"
cp -r prisma "$APP_DIR/prisma"
mkdir -p "$APP_DIR/public/uploads"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "==> Belum ada .env di $APP_DIR — bikin dari contoh, ISI DULU sebelum lanjut!"
  cp "$REPO_DIR/.env.example" "$APP_DIR/.env"
  echo "!! STOP: edit $APP_DIR/.env (isi DATABASE_URL, AUTH_SECRET, dst), lalu jalankan ulang script ini."
  exit 1
fi

echo "==> Menjalankan migrasi database..."
cd "$APP_DIR"
set -a
source .env
set +a
npx --yes prisma@6.19.3 migrate deploy --schema=./prisma/schema.prisma

echo "==> Restart aplikasi (Passenger)..."
mkdir -p "$APP_DIR/tmp"
touch "$APP_DIR/tmp/restart.txt"

echo ""
echo "✅ Selesai! Cek https://pratamajaya.id — kalau belum muncul, tunggu ~10 detik"
echo "   (Passenger butuh waktu restart) lalu refresh."
