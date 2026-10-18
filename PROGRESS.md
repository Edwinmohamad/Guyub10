# Progress Laporan Portal Guyub 10

- [x] **FASE 1: Database Migrations** (Tabel `profil_rw`, `lembaga`, `fasilitas`, dll. + RLS + Storage)
- [x] **FASE 2: Admin Dashboard Lengkap** (13 Menu CRUD: Ticker, Profil, Warga, Kas, Fasilitas, dll.)
- [x] **FASE 3: Update Halaman Publik** (Dinamis dari Supabase, UI/UX premium)
- [x] **FASE 4: Finalisasi & QA**
- [x] **FASE 5: Audit & Fitur Tambahan** (Perbaikan Keamanan, Fitur Baru, Admin Full Control)
- [x] **FASE 6: Upgrade Halaman Berita** (Fitur Komentar, Share Buttons, dan View Counter mirip portal desa profesional)

- [x] **FASE 7: Optimasi Performa** (Perbaikan error build TypeScript, penggunaan Turbopack, dan caching)
- [x] **FASE 8: Fitur Layanan Surat (Cetak Mandiri)** (Pengaturan template PDF, auto isi data form, dan auto generate PDF tanpa auth)
- [x] **FASE 9: Pendaftaran UMKM Publik** (Formulir UMKM tanpa login, WA, Logo, Deskripsi panjang, review Admin)

**Status Saat Ini:** ✅ **SEMUA FASE SELESAI.** Proses build produksi telah diperbaiki dari error tipe data, Layanan Surat, dan Pendaftaran UMKM Publik telah di-deploy. Proyek siap digunakan.

## Digital OS — fase simulator lokal (18 Oktober 2026)

Status bagian lama di atas adalah catatan historis, bukan klaim kesiapan branch ini.

- [x] Branch `develop/guyub10-digital-os`; tidak merge/deploy/publish.
- [x] Showcase navy/putih, branding bersama, mini portal RW/RT, motion dan reduced motion.
- [x] API dan penyimpanan sintetis lokal; isolasi dari Supabase/perangkat produksi.
- [x] Endpoint promosi admin dinonaktifkan; server RBAC, cakupan RT, cookie sesi, verifikasi pending, validasi dasar, dan audit lokal.
- [x] Registry operasional untuk surat, insiden, tugas, CCTV, WiFi, kas, fasilitas, peminjaman, UMKM, komunitas, proyek, arsip dan aset.
- [x] Alur surat RT/RW sampai PDF contoh, peta skematis, kartu warga dan dashboard.
- [x] Skema PostgreSQL lokal additive dan pengujian RLS; bukan migrasi produksi.
- [x] Panduan lokal, matriks izin, akun contoh, contoh variabel, hasil tes dan batasan di `docs/`.
- [x] Editor rumah tangga dan relasi anggota keluarga lokal: tambah/edit anggota, kepala keluarga, pemindahan, validasi identitas sintetis, cakupan RT/RW, audit dan penguncian transaksi antarproses.
- [ ] Unggah lampiran, editor media, integrasi konten profil, notifikasi read/unread, deteksi bentrok booking.
- [ ] Pembersihan masalah lint lama (85 error, 68 warning pada baseline).
- [ ] Adapter PostgreSQL/Supabase dan hardening produksi; di luar fase lokal dan belum diotorisasi untuk dijalankan terhadap produksi.

Lihat `docs/LOCAL-DEVELOPMENT.md` dan `docs/TEST-RESULTS.md`. Simulator ini tidak menyelesaikan seluruh visi produk produksi.

### Lanjutan: pengelolaan keluarga lokal

Rumah tangga sekarang menjadi koleksi tersendiri dalam database JSON dan diinisialisasi sekali dari profil sintetis yang sudah ada tanpa mengubah akun. Anggota keluarga tidak harus mempunyai akun login. Identitas anggota dipertahankan saat dipindahkan; pemindahan kepala keluarga memerlukan pengganti jika masih ada anggota. Admin RT dibatasi RT sendiri, pengurus RW dapat memindahkan antar-RT. Tidak ada perubahan atau migrasi pada Supabase produksi.

Pekerjaan berikutnya: unggah lampiran dengan validasi dan otorisasi unduhan.

### Ketentuan pengujian tanpa Supabase

- [x] Tidak membuat klien Supabase atau membaca kredensial pada runtime lokal.
- [x] Seluruh tes database menggunakan PGlite lokal; skema di `database/local/001_os_schema.sql`.
- [x] Fetch server dibatasi loopback, redirect fetch ditolak, dan gambar eksternal dinonaktifkan.
- [x] Tes khusus memverifikasi penolakan koneksi eksternal sebelum jaringan dipanggil.
