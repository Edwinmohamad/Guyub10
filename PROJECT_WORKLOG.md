# Project Worklog

## Current phase

Fase 13-17: security boundary, performance refactor, redesign, dan QA.

## Completed

- Safety snapshot: branch kerja `refactor/performance-redesign` dari commit `44e627d`.
- Audit repository satu kali, baseline build, dan audit homepage live.
- Taste Skill v2, gpt-taste, redesign protocol, Next.js 16, Supabase, dan baseline-ui dibaca.
- Keputusan arsitektur: Option A, tetap satu Next.js app dengan batas public/admin/data/auth/storage yang tegas.
- Semua mutation admin sekarang memakai guard terpusat dan service-role client server-only; upload memiliki validasi MIME/ukuran.
- Akses warga dipindahkan dari password query string ke HttpOnly cookie; halaman RT publik hanya menampilkan agregat.
- Public shell, halaman layanan, informasi, UMKM, kas, laporan, fasilitas, galeri, lembaga, agenda, profil, dan darurat diringkas menjadi civic editorial yang ringan.
- Navbar/footer/widget dijadikan server-first atau CSS-first; chart berat dan PDF/XLSX dipindahkan ke dynamic import/interaksi.
- `npx tsc --noEmit` dan `npm run lint` lulus tanpa error/warning.
- Smoke test dev server: seluruh route public utama merespons HTTP 200.

## Remaining / follow-up

- Migrasikan `middleware.ts` ke convention `proxy.ts` saat upgrade Next.js berikutnya.
- Optimalkan/kompres `public/desa-industri-bg.png` (sekitar 1,04 MB) jika aset tetap diperlukan.
- Pertimbangkan aggregate SQL/RPC untuk statistik warga bila volume data meningkat.

## Important decisions

- Supabase tetap untuk database, auth, dan storage; tidak ada migrasi/schema/data production.
- Visual: civic, hangat, terpercaya; variance 4, motion 2, density 5.
- Pertahankan route, label navigasi utama, field form, dan business logic existing.

## Files touched

- `PROJECT_WORKLOG.md`
- `PERFORMANCE_AUDIT.md`

## Known issues

- `next build` berhasil compile, tetapi Next 16 secara otomatis menambahkan `.next/dev/types` ke `tsconfig`; generated validator stale dapat menggagalkan typecheck build. Standalone `npx tsc --noEmit` lulus. Hapus generated `.next/dev` sebelum build CI atau pin konfigurasi Next saat pipeline.
- Build memberi warning convention `middleware` deprecated dan remote image quality `72`; tidak memblokir runtime.
