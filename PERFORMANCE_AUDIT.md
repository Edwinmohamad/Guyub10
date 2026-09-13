# Performance Audit

## Repo map

- `src/app`: App Router public routes, admin, API, dan server actions.
- `src/components`: shared layout, charts/widget, UI primitives, dan PDF template.
- `src/lib/supabase`: browser, server, middleware, service-role, dan warga fetch helper.
- `supabase/migrations`: schema, RLS, storage, dan feature migrations. Tidak diubah pada pekerjaan ini.
- `public`: logo dan hero fallback; `desa-industri-bg.png` berukuran sekitar 1,04 MB.

## Critical

- Problem: `GET /api/setup-akun` memakai service-role dan menjadikan semua akun admin tanpa auth. Location: `src/app/api/setup-akun/route.ts`. Why: privilege escalation publik. Fix: wajibkan admin server-side dan batasi target ke allowlist.
- Problem: seluruh admin server actions membuat service-role client tanpa verifikasi caller. Location: `src/app/admin/actions.ts`. Why: action endpoint dapat dipanggil langsung di luar UI. Fix: centralized `requireAdmin` sebelum setiap mutation.

Status: fixed. Admin actions sekarang melewati `createAuthorizedAdminClient`; route setup akun juga memerlukan admin dan allowlist email.

## High

- Problem: halaman admin selalu menjalankan 23 query dan mengambil semua dataset untuk semua tab. Location: `src/app/admin/page.tsx`. Why: latency, payload RSC, memory, dan render cost tinggi. Fix: fetch overview atau dataset tab aktif saja, pilih kolom, dan beri limit/pagination.
- Problem: homepage mengambil seluruh data warga lalu menghitung statistik di server setiap request/revalidation. Location: `src/app/page.tsx`, `src/lib/supabase/fetchAllWarga.ts`. Why: transfer dan CPU tumbuh linear dengan jumlah warga. Fix: aggregate terpisah/cached; sementara batasi kolom dan dedupe.
- Problem: XLSX, PDF renderer, pdf-lib, dan Recharts diimpor langsung pada client surfaces. Location: warga manager, surat table, layanan, dan chart components. Why: parsing JavaScript berat sebelum fitur digunakan. Fix: dynamic import saat interaksi atau lazy client island.
- Problem: kartu homepage menerima isi artikel penuh dan halaman live mencapai sekitar 6.824 px pada viewport 624 px. Location: `src/app/page.tsx`. Why: payload HTML/RSC dan DOM berlebihan. Fix: select ringkasan, batasi konten visual, dan ringkas hierarchy.

Status: fixed. Homepage dan public routes memakai explicit columns, limits, compact editorial cards, dan `next/image`.

## Medium

- Problem: banyak `select("*")` pada public dan admin routes. Why: over-fetch dan coupling ke schema. Fix: explicit columns per view.
- Problem: beberapa gambar kecil meminta varian sampai 3.840 px dan banyak `<img>` native. Why: bandwidth dan CLS lebih tinggi. Fix: `next/image`, explicit `sizes`, dan remote host restriction.
- Problem: navbar memakai beberapa scroll listeners/state serta seluruh shell client. Location: `NavbarClient.tsx`. Why: hydration dan work saat scroll. Fix: CSS sticky shell, client island hanya untuk menu.
- Problem: hero fallback 1,04 MB, animasi ticker/fade/bounce, dan banyak hover scale. Why: decode/paint cost pada HP low-end. Fix: optimalkan aset dan turunkan motion ke feedback-only.

Status: fixed. Navbar/footer/widget server-first; motion dibatasi dan `prefers-reduced-motion` ditangani.

## Low

- Problem: tiga font family dan banyak weight dimuat. Location: `src/app/layout.tsx`. Why: request/font parse tambahan dan hierarchy tidak konsisten. Fix: satu sans variable family, tabular numbers untuk data.
- Problem: `middleware.ts` deprecated di Next.js 16 dan baseline build membaca `.next/dev/types` stale. Fix: pindah ke `proxy.ts` setelah verifikasi dan hapus include dev types dari `tsconfig`.

## Verification

- `npx tsc --noEmit`: pass.
- `npm run lint`: pass, zero errors/warnings.
- Local dev smoke test: `/`, `/informasi`, `/fasilitas`, `/galeri`, `/aspirasi`, `/rt`, `/umkm`, `/kas`, `/laporan`, `/lembaga`, `/kegiatan`, `/profil`, `/darurat`, `/layanan`, `/layanan/cek`, `/login`: HTTP 200.
- `next build` compiled successfully; final typecheck can be affected by Next 16 auto-generated `.next/dev/types` validator state (see worklog known issues).
