import { cookies } from "next/headers";
import { Database, LockKeyhole, ShieldCheck } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";
import { fetchAllWarga, fetchWargaStatisticsRows } from "@/lib/supabase/fetchAllWarga";
import { isValidWargaAccessToken, WARGA_ACCESS_COOKIE } from "@/lib/auth/warga";
import ClientWargaTable from "./ClientWargaTable";
import { lockWarga, unlockWarga } from "./actions";

export const revalidate = 0;

type WargaRow = { id: string; nama_lengkap: string; rt: string; jenis_kelamin: string };

export default async function WargaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [params, cookieStore, supabase, residents] = await Promise.all([searchParams, cookies(), createClient(), fetchWargaStatisticsRows()]);
  const { data: profile } = await supabase.from("profil_rw").select("password_warga").limit(1).single();
  const password = profile?.password_warga || process.env.WARGA_ACCESS_PASSWORD || "RW10PINTAR";
  const authenticated = isValidWargaAccessToken(cookieStore.get(WARGA_ACCESS_COOKIE)?.value, password);
  const families = new Set(residents.map((item) => item.no_kk).filter(Boolean)).size;
  const men = residents.filter((item) => item.jenis_kelamin === "L").length;
  const women = residents.filter((item) => item.jenis_kelamin === "P").length;
  const safeResidents = authenticated ? await fetchAllWarga("id,nama_lengkap,rt,jenis_kelamin") as WargaRow[] : [];

  return <div className="min-h-screen bg-background">
    <PublicPageHeader icon={Database} label="Data warga" title="Ringkasan data warga" description="Statistik kependudukan RW 10. Daftar nama dibatasi untuk warga yang memiliki kata sandi dari pengurus." />
    <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">{[["Total warga", residents.length], ["Keluarga", families], ["Laki-laki", men], ["Perempuan", women]].map(([label, value]) => <div key={label} className="bg-white p-5"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-extrabold">{value}</dd></div>)}</dl>
      {!authenticated ? <div className="mx-auto mt-8 max-w-xl rounded-xl border border-border bg-white p-6 md:p-8"><LockKeyhole aria-hidden="true" className="size-7 text-emerald-800" /><h2 className="mt-4 text-2xl font-bold">Akses daftar warga</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Masukkan kata sandi khusus yang diberikan pengurus. Kata sandi tidak lagi ditempatkan di URL atau riwayat browser.</p>{params.error ? <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">Kata sandi tidak sesuai.</p> : null}<form action={unlockWarga} className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="flex-1"><span className="sr-only">Kata sandi warga</span><input type="password" name="password" required autoComplete="current-password" placeholder="Kata sandi warga" className="min-h-11 w-full rounded-lg border border-input px-3 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" /></label><button className="min-h-11 rounded-lg bg-emerald-900 px-5 text-sm font-bold text-white">Buka daftar</button></form><p className="mt-5 flex gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Halaman hanya menampilkan nama, jenis kelamin, dan RT. NIK serta nomor KK tidak ditampilkan.</p></div> : <div className="mt-8"><div className="mb-4 flex justify-end"><form action={lockWarga}><button className="min-h-11 rounded-lg border border-input bg-white px-4 text-sm font-bold">Kunci kembali</button></form></div><ClientWargaTable wargaList={safeResidents} /></div>}
    </section>
  </div>;
}
