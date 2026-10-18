# Hasil pengujian lokal — 18 Oktober 2026

Lingkungan: Node 24.19.0, npm 11.9.0, Next.js 16.2.9, Linux, Chromium lokal.

- Instalasi npm berhasil; lockfile diperbarui hanya untuk font lokal dan dependensi pengujian.
- `npm test`: 10 pengujian lulus. Mencakup RBAC semua kelompok peran, isolasi RT, pembatasan status akun, proyeksi data publik, privasi kamera, urutan surat, serta eksekusi ulang SQL dan RLS PostgreSQL lokal melalui PGlite.
- `npm run test:e2e`: 6 skenario lulus. Mencakup rute publik RW/empat RT/modul, peta interaktif, desktop/mobile, navigasi seluler, reduced motion, penolakan anonim, endpoint berbahaya 410, CSRF, isolasi RT/RW, surat sampai PDF, audit, registrasi pending, penolakan role injection/foto palsu, verifikasi RT, modal, formulir, filter dan empty state.
- `npm run lint:local`: lulus tanpa error atau warning pada kode lokal baru dan pengujiannya.
- `npm run build`: build lokal berhasil setelah font dibundel dan prerender rute lama dicegah. Tidak ada deployment.
- `npm run lint`: gagal pada kode lama; baseline sebelum perubahan adalah 85 error dan 68 warning. Pemeriksaan akhir tetap 85 error dan 68 warning, sama dengan baseline. Aturan tidak dinonaktifkan dan assertion tidak dilemahkan.

Screenshot lokal di `test-results/desktop.png` dan `test-results/mobile.png` adalah keluaran pengujian yang diabaikan Git. Browser menguji layout tanpa overflow pada lebar 390 dan desktop 1440. Fokus, label formulir, dialog native dan reduced motion diperiksa dalam implementasi dan alur browser; belum ada audit aksesibilitas WCAG menyeluruh. Loading/error boundary tersedia; kegagalan internal penyimpanan belum diuji melalui fault injection.

Suite browser juga dijalankan pada artefak `npm run build` melalui `npm start` yang terikat ke loopback: 6/6 lulus. Bug refresh setelah mutasi yang ditemukan pada build telah diperbaiki melalui invalidasi cache serta pembaruan record dari respons server; pengujian memastikan data bertahan setelah reload. Komponen di-reset saat identitas/peran/status/cakupan atau rute berubah untuk membuang state sesi sebelumnya.

Instalasi ulang `npm ci` berhasil (732 paket), diikuti build dan pemeriksaan akhir yang lulus. `install_script` dan `start_skill` tersimpan sebagai draf konfigurasi cloud; tidak dijalankan otomatis oleh penyimpanan draf, tidak diterapkan sebagai publikasi, dan tidak ada lingkungan yang dipublikasikan. Persyaratan variabel Supabase yang sempat ditambahkan sebelum spesifikasi lokal diterima sudah tidak diperlukan; biarkan tidak terisi atau hapus persyaratan tersebut dari pengaturan lingkungan.

Tidak ada pengujian, migrasi, atau modifikasi terhadap layanan produksi. Belum ada pengujian fresh cloud task/restorasi snapshot.

## Lanjutan pengelolaan keluarga — 18 Oktober 2026

- Audit tahap sebelumnya: branch pengembangan, pemblokiran API lama, RBAC dan isolasi Supabase tetap aktif.
- `npm test`: 17 tes domain/RLS lulus dan 1 tes penyimpanan serentak lulus (18 total). Tes terakhir menjalankan tiga proses Node independen dengan total 12 transaksi pada direktori sementara; semua perubahan dipertahankan.
- Tes keluarga mencakup penolakan warga/staf suspended/lintas RT, anggota pertama sebagai kepala, edit dengan ID tetap, penggantian kepala sebelum pemindahan, tujuan lintas RT untuk RW, identitas sintetis duplikat, tanggal lahir, boolean dan pembersihan kepala pada rumah tangga kosong. Penolakan validasi diperiksa agar tidak memutasi koleksi.
- `npm run lint:local`: lulus. `npm run lint`: tetap gagal pada baseline lama, 85 error dan 68 warning; tidak ada aturan yang dinonaktifkan.
- `npm run build`: lulus setelah regenerasi output tipe dev yang rusak; tidak ada perubahan sumber aplikasi untuk mengabaikan pemeriksaan tipe.
- `npm run test:e2e` pada hasil build lokal (`npm start` terikat loopback): 7/7 skenario lulus. Skenario keluarga memeriksa tambah rumah tangga, tambah/edit/pindah anggota, persistensi setelah reload, penolakan warga, dan pembatasan RT.
- Penyimpanan kini memakai proper-lockfile agar render/API dan proses lokal independen tidak saling menimpa perubahan JSON. Ini tidak mengubah batasan simulator menjadi layanan produksi.

Tidak diperlukan tindakan manual atau kredensial baru. Unggah lampiran dan item roadmap lain yang belum dicentang tetap belum dikerjakan pada tahap keluarga ini.
