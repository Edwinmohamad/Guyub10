# Guyub10 — Pengujian lokal

Branch develop/guyub10-digital-os. Hanya untuk pengujian lokal.
Jangan deploy, publish, atau hubungkan ke Supabase/CCTV/MikroTik produksi.

## Jalankan

1. Pasang Node.js **24** dari https://nodejs.org/ (npm ikut terpasang).
2. Ekstrak ZIP. Buka terminal di folder `Guyub10-local-test` yang berisi `package.json`.
3. Jalankan:

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

Buka **http://127.0.0.1:3000** di browser komputer Anda. Biarkan terminal terbuka; hentikan dengan Ctrl+C.
Pada Windows, bila PowerShell memblokir npm.ps1, gunakan `npm.cmd` sebagai pengganti `npm`.
Internet diperlukan untuk mengunduh dependensi saat instalasi. Aplikasi kemudian menggunakan data sintetis lokal dan font yang dibundel.
**Tidak perlu API key, Supabase, atau file .env.local. Jangan memasukkan data warga nyata.**

## Akun contoh

Password semua akun contoh: **Guyub10-Lokal!**

- `rw@guyub.test` — Ketua RW
- `rt01@guyub.test` — Ketua RT 01 (juga rt02, rt03, rt04)
- `admin01@guyub.test` — Admin RT 01
- `warga01@guyub.test` — Warga RT 01 (juga warga02, warga03, warga04)
- `pelajar@guyub.test` — Pelajar
- `super@guyub.test` — Super Admin

Buka `/login`, pilih akun contoh, isi password. Dashboard pengurus: `/command`. Pengelolaan keluarga: `/residents`. Portal warga: `/my-rt`.

## Pemeriksaan opsional

```sh
npm test
npm run lint:local
npm run build
```

Untuk tes browser, biarkan server berjalan, lalu buka terminal kedua:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright memakai Chromium sistem bila `/usr/bin/chromium` tersedia; jika tidak, memakai Chromium bawaan Playwright. `GUYUB_CHROMIUM_PATH` dapat digunakan bila ingin executable lain. Linux minimal mungkin memerlukan dependensi sistem browser sesuai petunjuk resmi Playwright.

Build hanya menghasilkan artefak lokal. Untuk mencobanya, hentikan dev server lalu jalankan `npm start -- --hostname 127.0.0.1`.
Lint seluruh repositori (`npm run lint`) masih memiliki baseline lama 85 error dan 68 warning; lint kode lokal baru lulus.

## Data dan reset

Data contoh dibuat otomatis di `.local-data/database.json`. Data/sesi dari cloud tidak disertakan.
Untuk reset, hentikan server lalu jalankan:

```sh
node scripts/reset-local.mjs --confirm-local-reset
```

Data sebelumnya dicadangkan ke `.local-data/backups`; seed baru dibuat saat permintaan berikutnya.

## Isi dan batasan

Ini simulator lokal, bukan seluruh produk produksi. Baca `docs/LOCAL-DEVELOPMENT.md`, `docs/TEST-RESULTS.md`, dan `PROGRESS.md` untuk arsitektur, matriks izin, akun, hasil tes, dan fitur yang belum selesai.
ZIP GitHub tidak membawa node_modules, hasil build, Git history, data/sesi lokal, atau hasil tes yang diabaikan Git. Berkas historis repositori tidak digunakan untuk menjalankan simulator.
Paket berdasarkan kode yang diuji di Linux/Node 24. Pengujian Windows/macOS belum dilakukan.

## Tanpa Supabase
Semua pengujian memakai JSON lokal atau PostgreSQL WASM PGlite di mesin sendiri. Tidak memakai layanan Supabase, tidak memerlukan API key, dan fetch server ke backend eksternal diblokir. Skema tes berada di database/local.
