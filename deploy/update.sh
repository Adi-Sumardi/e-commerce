#!/usr/bin/env bash
# Update deployment yang SUDAH pernah di-setup lewat deploy.sh.
# Jalankan ini tiap kali ada perubahan kode yang mau di-deploy.
#
# Cara pakai (dari home directory server):
#   cd ~/repo
#   bash deploy/update.sh

set -euo pipefail

APP_DIR="$HOME/domains/pratamajaya.id/public_html"
REPO_DIR="$HOME/repo"

echo "==> Mengaktifkan Node.js (nodevenv Hostinger)..."
NODEVENV_ACTIVATE=$(find "$HOME/nodevenv" -maxdepth 5 -name activate -path "*public_html*" 2>/dev/null | head -n1 || true)
if [ -n "$NODEVENV_ACTIVATE" ]; then
  # shellcheck disable=SC1090
  source "$NODEVENV_ACTIVATE"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "!! 'node' tidak ditemukan di PATH. Cek setup Node.js App di hPanel."
  exit 1
fi

corepack enable >/dev/null 2>&1 || true

echo "==> git pull terbaru..."
cd "$REPO_DIR"
git pull origin main

echo "==> Install dependencies..."
pnpm install --frozen-lockfile

echo "==> Generate Prisma Client..."
pnpm exec prisma generate

echo "==> Build (standalone output)..."
pnpm build

echo "==> Sinkronkan hasil build ke $APP_DIR (tanpa hapus .env & public/uploads)..."
rsync -a --delete \
  --exclude '.env' \
  --exclude 'public/uploads' \
  .next/standalone/ "$APP_DIR/"
mkdir -p "$APP_DIR/.next/static"
rsync -a --delete .next/static/ "$APP_DIR/.next/static/"
rsync -a --delete public/ "$APP_DIR/public/" --exclude 'uploads'
rsync -a --delete prisma/ "$APP_DIR/prisma/"

echo "==> Menjalankan migrasi database (kalau ada perubahan schema)..."
cd "$APP_DIR"
set -a
source .env
set +a
npx --yes prisma@6.19.3 migrate deploy --schema=./prisma/schema.prisma

echo "==> Restart aplikasi (Passenger)..."
mkdir -p "$APP_DIR/tmp"
touch "$APP_DIR/tmp/restart.txt"

echo ""
echo "✅ Update selesai! Cek https://pratamajaya.id (tunggu ~10 detik lalu refresh)."
