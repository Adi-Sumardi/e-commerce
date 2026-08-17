Dokumen ini menjelaskan **setup manual satu kali** di hPanel Hostinger serta konfigurasi **CI/CD Otomatis via GitHub Actions** pada `.github/workflows/ci.yml`.

> **Mekanisme Auto-Deploy**: Setiap kali ada `git push` ke branch `main`, GitHub Actions akan menjalankan build/typecheck/lint, lalu otomatis mengeksekusi script update via SSH di server Hostinger.


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

### 2.4 Generate SSH key buat Termius (jangan pakai key pribadi kamu)
Di komputer kamu (bukan di server), buat key pair baru khusus akses server ini:

```bash
ssh-keygen -t ed25519 -C "termius-hostinger" -f ~/.ssh/pratamajaya_hostinger -N ""
```

1. Lihat isi public key: `cat ~/.ssh/pratamajaya_hostinger.pub`, tempel ke hPanel → **Advanced → SSH Access → Manage SSH Keys**.
2. Di Termius: **Keychain → "+ New Key" → Import Existing Key**, pilih file `~/.ssh/pratamajaya_hostinger` (yang tanpa `.pub`).
3. Bikin Host baru di Termius pakai Host/Port/Username dari §2.3, pilih key ini buat authentication.

---

## 3. Deploy

Setelah §2 selesai (Node.js App + database + SSH access semua siap), connect ke server via
Termius lalu ikuti [`deploy/README.md`](../deploy/README.md) — intinya:

```bash
# setup pertama kali
cd ~ && git clone git@github.com:Adi-Sumardi/e-commerce.git repo
cd repo && bash deploy/deploy.sh

# update selanjutnya
cd ~/repo && bash deploy/update.sh
```

## 4. Troubleshooting umum

- **`node`/`npm` tidak ketemu di Termius**: Node.js App di hPanel belum lengkap ke-setup —
  balik ke §2.2, pastikan Application root & startup file (`server.js`) sudah benar.
- **Domain nampilin halaman default Hostinger, bukan app**: cek lagi domain sudah di-assign
  ke Node.js App yang benar di hPanel (§2.2), dan `APP_DIR` di `deploy.sh`/`update.sh` sama
  persis dengan Application root yang ditampilkan hPanel.
- **Error 500 / app tidak jalan setelah deploy**: cek hPanel **Node.js App → Logs**. Penyebab
  umum: `.env` di `APP_DIR` belum diisi lengkap, atau `DATABASE_URL` salah format.
- **Migration gagal jalan**: cek user MySQL (§2.1) punya privilege `ALTER`/`CREATE` (bukan
  cuma SELECT/INSERT) — Prisma migrate butuh itu.
