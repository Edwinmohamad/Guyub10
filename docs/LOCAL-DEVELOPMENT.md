# Guyub10 Digital OS — pengujian lokal

Branch: `develop/guyub10-digital-os`. Jangan merge, deploy, atau publish. Tidak ada perubahan pada Proxmox, Cloudflare, DNS, atau Supabase produksi.

## Jalankan

Gunakan Node 24 (divalidasi dengan 24.19.0), npm 11, dan checkout yang sudah tersedia. Setiap tugas cloud terisolasi; tidak perlu membuat worktree.

```sh
cd /workspace/Guyub10
npm ci
npm run dev -- --hostname 127.0.0.1
```

Tidak perlu kredensial atau variabel Supabase. Font Plus Jakarta Sans dibundel melalui npm. `.env.example` hanya berisi opsi lokasi data sintetis. Server lokal di port 3000; lakukan pemeriksaan HTTP dari mesin yang sama, bukan memublikasikan preview.

```sh
npm test
npm run lint:local
npm run lint
npm run build
# Dengan server lokal masih berjalan dan Chromium tersedia:
npm run test:e2e
```

Build menghasilkan artefak lokal, tidak melakukan deployment. Untuk memeriksa artefak, hentikan dev server lalu jalankan `npm start -- --hostname 127.0.0.1`. Playwright memakai `/usr/bin/chromium` bila tersedia, atau browser yang diunduh melalui `npx playwright install chromium`. Override executable dapat diberikan melalui GUYUB_CHROMIUM_PATH. Tes browser menambahkan data sintetis dan audit ke penyimpanan lokal. Jangan arahkan pengujian ke produksi.

## Arsitektur dan data

- `src/middleware.ts` mengarahkan halaman lama ke `src/app/os/[[...path]]`. POST rute lama dan seluruh API lama diblokir. `/api/setup-akun` mengembalikan 410 secara permanen.
- `src/components/os/Portal.tsx` menyediakan showcase, mini portal, formulir, modal, workspace, peta, dan kartu warga. `Brand.tsx` membagikan merek/footer/placeholder partner. `os.css` memuat sistem navy/putih, responsivitas, animasi, dan reduced motion.
- `src/lib/local/model.ts` menjadi kebijakan RBAC dan transisi workflow. Kebijakan yang sama dipanggil API; menyembunyikan tombol bukan kontrol keamanan.
- `src/app/api/local/[...path]` menangani sesi, pendaftaran, data modul, verifikasi, pencarian terotorisasi, pratinjau kamera statis, audit, dan PDF contoh.
- Penyimpanan `.local-data/database.json` dibuat otomatis dengan identitas palsu, kata sandi scrypt + salt, token sesi yang di-hash, dan penulisan atomik berurutan dengan penguncian file antarproses (proper-lockfile). File/direktori diabaikan Git. Desain ini untuk satu proses Node lokal, bukan multi-instance atau produksi.
- Seluruh helper Supabase lama hanya melempar error; tidak memuat SDK saat runtime, membaca kredensial, atau membuat koneksi. Rute lama masih ada sebagai referensi, tetapi tidak menjadi backend simulator.
- `database/local/001_os_schema.sql` merupakan skema PostgreSQL lokal terpisah dengan organisasi, peran, profil privat, rumah tangga, anggota keluarga, registry modul, audit, dan RLS. Migrasi dapat dijalankan berulang dan diuji di PostgreSQL WASM (PGlite). Simulator berjalan dengan JSON; tidak ada klaim bahwa migrasi ini telah diterapkan di Supabase.
- Tabel lama `warga`, `surat`, `kas`, `fasilitas`, `umkm`, `pengumuman` tidak diubah. Dokumen SQL mencatat pemetaan untuk adapter integrasi di fase terpisah. Namespace lokal menghindari perubahan atau duplikasi dalam tabel produksi.

## Halaman

Publik: `/`, `/rw10`, `/rt/01`–`/rt/04`, `/informasi`, `/kegiatan`, `/organisasi`, `/fasilitas`, `/umkm`, `/galeri`, `/kas`, `/wifi`, `/cctv`, `/peta`, `/darurat`, `/pokja10`, `/inkamnet`, `/login`, `/daftar`.

Anggota: `/my-rt`, `/services`, `/card`, `/notifications`, `/search`, dan `/workspace/<modul>`. Pengurus: `/command`, `/today`, `/residents`. Nama modul ada di `model.ts`: news, activities, letters, incidents, tasks, cameras, wifi, students, finance, facilities, bookings, umkm, projects, pokja, documents, assets, organization, gallery, emergency.

Ruang modul mendukung tambah data, filter RT/status, dan perubahan status sesuai kewenangan. Surat memakai RT_REVIEW → RT_APPROVED → RW_REVIEW/APPROVED → PDF_READY → ARCHIVED. RT tidak dapat menyetujui final RW. PDF hanya tersedia bagi pemilik atau pengurus berwenang. Booking memiliki cabang penolakan; laporan melewati status secara berurutan. Rekap kas dapat difilter bulan dan entitas; arsip dapat difilter tahun, kategori pencarian, dan RT. Profil warga privat mendukung metadata keluarga serta status kependudukan.

## Matriks izin

| Peran | Cakupan | Kapabilitas |
|---|---|---|
| Publik | Informasi terbuka | Proyeksi berita/fasilitas/UMKM yang disetujui/statistik/kas; status CCTV/WiFi saja |
| SUPER_ADMIN, KETUA_RW, PENGURUS_RW | RW dan seluruh RT | Kelola modul, verifikasi warga, persetujuan final, audit, pratinjau statis |
| KETUA_RT, ADMIN_RT | RT sendiri | Kelola modul RT, verifikasi RESIDENT/STUDENT RT sendiri, review surat, tanpa final RW |
| SECURITY | RT sendiri | Kamera, insiden, tugas, aset; privasi CCTV tetap diperiksa |
| OPERATOR | RT sendiri | WiFi, akses pelajar, tugas, aset |
| POKJA10 | RT sendiri | Hub komunitas, kegiatan, tugas, proyek |
| RESIDENT | Diri sendiri dan RT sendiri | Ajukan surat/laporan/peminjaman/UMKM/WiFi, baca riwayat sendiri |
| STUDENT | Sama dengan RESIDENT | Akses pelajar dan pratinjau CCTV tingkat RESIDENT di RT sendiri |
| PENDING, SUSPENDED | Informasi publik | Tidak dapat menggunakan API anggota atau mengubah data |

Sesi disimpan dalam cookie HttpOnly, SameSite=Strict, berlaku 8 jam. Mutasi memeriksa Origin terhadap Host. Pemilik/RT/peran dari input tidak dipercaya. Registrasi selalu membuat RESIDENT/PENDING. API memvalidasi teks, nominal, tanggal, status, dan berkas foto PNG/JPEG (magic bytes, ukuran 500 KB); SVG/HTML tidak diterima. Body dibatasi 800 KB. Login dibatasi delapan percobaan gagal per email dalam 15 menit. Mekanisme ini tidak dimaksudkan sebagai hardening produksi.

## Akun pengujian

Semua akun contoh memakai password `Guyub10-Lokal!`. Ini bukan secret produksi.

| Akun | Peran |
|---|---|
| super@guyub.test | SUPER_ADMIN |
| rw@guyub.test | KETUA_RW |
| pengurus@guyub.test | PENGURUS_RW |
| rt01@guyub.test … rt04@guyub.test | KETUA_RT sesuai RT |
| admin01@guyub.test | ADMIN_RT 01 |
| warga01@guyub.test … warga04@guyub.test | RESIDENT sesuai RT |
| pelajar@guyub.test | STUDENT RT 01 |
| security@guyub.test | SECURITY RT 01 |
| operator@guyub.test | OPERATOR RT 01 |
| pokja@guyub.test | POKJA10 RT 01 |

Pendaftaran memakai foto dan identitas fiktif, kemudian admin RT menandai VERIFIED/ACTIVE. NIK/KK contoh dimulai `0` dan tidak ditampilkan publik. Kartu digital menampilkan ID internal, status, dan QR placeholder; tidak memuat NIK.

Untuk reset: hentikan server, jalankan `node scripts/reset-local.mjs --confirm-local-reset`, lalu mulai kembali. File lama dipindah ke `.local-data/backups/`, tidak dihapus. Jangan memasukkan data warga nyata.

## Batasan yang disengaja / pekerjaan lanjutan

- Ini simulator lokal yang dapat diuji, bukan keseluruhan produk siap produksi. Tidak ada koneksi CCTV, MikroTik, Supabase, email, WhatsApp, atau map API. Foto/stream/logo/QR adalah placeholder; tidak ada kredensial perangkat.
- Profil RT, struktur, ilustrasi, dan statistik showcase memakai konten contoh. Angka populasi tidak dihitung dari jumlah akun seed. Pengelolaan metadata organisasi tersedia di registry, tetapi konten hero/profil showcase belum terhubung ke editor.
- Pengelolaan rumah tangga tersedia pada `/residents`: rumah tangga terpisah, kepala keluarga, anggota tanpa akun login, edit identitas, dan pemindahan anggota. Data awal dibuat sekali dari profil sintetis yang ada. Koleksi ini tidak otomatis menyinkronkan metadata keluarga lama pada akun; tidak mengubah peran, RT akun, atau akses login. PostgreSQL keluarga belum dihubungkan ke simulator.
- Modul memakai registry dan formulir bersama. Belum ada editor kaya per domain, unggah lampiran surat/bukti transaksi/dokumen, pengelolaan gambar galeri/UMKM, pemesanan dengan deteksi bentrok waktu, atau histori perawatan terstruktur. Referensi lampiran adalah teks contoh dan tidak dapat membuka URL.
- Notifikasi dan Today diturunkan dari status record; belum ada read/unread, push, atau penjadwalan background. Audit mencatat mutasi/login/unduhan/pratinjau; bukan sistem audit append-only eksternal yang tahan manipulasi lokal.
- Tidak ada UI untuk menaikkan peran pengguna. Peran pengujian berasal dari seed, bukan email atau metadata pendaftaran. Tidak ada reset password atau MFA lokal.
- Pencarian hanya mencakup records yang diizinkan dan daftar profil yang sudah disaring server. Tidak mengindeks lampiran.
- Animasi menggunakan CSS, IntersectionObserver, dan requestAnimationFrame, tanpa GSAP. Reduced motion mematikan animasi dan tilt. Peta skematis bukan navigasi geografis.
- RLS SQL mengutamakan penolakan akses. Izin spesialis/penulisan warga ke PostgreSQL belum disambungkan; tidak boleh mengganti backend JSON secara langsung tanpa adapter dan pengujian tambahan. RLS lama di schema public belum diperbaiki atau diterapkan ke produksi; local branch tidak mengaksesnya.
- Lint seluruh repositori masih memiliki masalah kode lama. Hasil pemeriksaan terakhir dicatat di `TEST-RESULTS.md`; jangan menyatakan lint keseluruhan lulus.

## Pengelolaan keluarga lokal

Masuk sebagai pengurus RW atau RT, buka `/residents`, lalu pilih **Rumah tangga & keluarga**. Tambah rumah tangga dengan alamat fiktif dan KK sintetis opsional (16 digit diawali 0). Tambah anggota dengan nama, NIK sintetis, hubungan, jenis kelamin, tanggal lahir, pekerjaan, status perkawinan/kependudukan, serta penanda pelajar/lansia/anak. Anggota pertama menjadi kepala keluarga; pilihan kepala dapat diubah di profil rumah tangga.

Pemindahan mempertahankan ID anggota dan data pribadinya. Kepala keluarga yang meninggalkan anggota lain harus memiliki pengganti yang sah. Rumah tangga kosong tidak mempunyai kepala keluarga. Admin RT hanya dapat melihat dan mengubah RT sendiri; RW mencakup semua empat RT. Tidak ada penghapusan permanen anggota: gunakan status MOVED atau DECEASED sesuai data sintetis pengujian.

API privat `/api/local/households` memeriksa peran, status akun, RT asal/tujuan, keunikan NIK anggota, tanggal lahir dan penanda boolean. Setiap perubahan menambahkan audit. Dataset rumah tangga tidak masuk dalam API atau halaman publik. Endpoint memakai transaksi penyimpanan yang sama dengan sesi dan modul lain; penguncian file mencegah worker API/render saling menimpa data. Penyimpanan ini tetap untuk simulator lokal, bukan basis data produksi.

## Larangan Supabase pada seluruh pengujian

Semua pengujian memakai JSON lokal atau PostgreSQL WASM PGlite dalam proses lokal. Tidak ada Supabase Cloud, Supabase CLI, emulator Supabase, atau layanan Auth/Storage Supabase. Skema tes berada di `database/local`, bukan folder migrasi Supabase. Tipe SDK pada berkas kompatibilitas lama hanya dipakai saat pemeriksaan TypeScript dan dihapus dari JavaScript runtime.

`src/instrumentation.ts` membungkus fetch server: hanya HTTP(S) ke localhost/127.0.0.1/::1 yang diterima, dan redirect fetch ditolak agar tidak beralih ke backend eksternal. Optimisasi gambar jarak jauh dinonaktifkan. Tes guard memakai fetch mock sehingga URL Supabase dalam tes penolakan tidak pernah dihubungi. Tes browser memeriksa portal publik dan halaman keluarga tanpa permintaan ke origin eksternal. Instalasi paket npm/Chromium masih memerlukan unduhan dependensi awal; bukan koneksi ke layanan Supabase.
