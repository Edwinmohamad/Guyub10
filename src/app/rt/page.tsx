import Link from "next/link";
import { ArrowRight, Home, Map, Users } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";
import { fetchWargaStatisticsRows } from "@/lib/supabase/fetchAllWarga";

export const revalidate = 300;

export default async function RtIndexPage() {
  const supabase = await createClient();
  const [{ data: profiles }, residents] = await Promise.all([
    supabase.from("profil_rt").select("no_rt, ketua_nama").order("no_rt"),
    fetchWargaStatisticsRows(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader icon={Map} label="Wilayah RT" title="Wilayah RT" description="Pilih wilayah untuk melihat profil pengurus, kegiatan, laporan kas, dan ringkasan warganya." />
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["01", "02", "03", "04"].map((rt) => {
            const profile = profiles?.find((item) => item.no_rt === rt);
            const rtResidents = residents.filter((item) => String(item.rt).padStart(3, "0") === rt.padStart(3, "0"));
            const families = new Set(rtResidents.map((item) => item.no_kk).filter(Boolean)).size;
            return (
              <Link key={rt} href={`/rt/${rt}`} className="group rounded-xl border border-border bg-white p-5 hover:border-emerald-700">
                <div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-lg bg-emerald-900 text-lg font-extrabold text-white">{rt}</span><ArrowRight aria-hidden="true" className="size-5 text-emerald-800 transition-transform group-hover:translate-x-1" /></div>
                <h2 className="mt-5 text-2xl font-bold">RT {rt}</h2>
                <p className="mt-1 min-h-6 text-sm text-muted-foreground">{profile?.ketua_nama ? `Ketua: ${profile.ketua_nama}` : "Data ketua belum tersedia"}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <div><dt className="flex items-center gap-1.5 text-muted-foreground"><Users aria-hidden="true" className="size-4" />Warga</dt><dd className="mt-1 font-bold">{rtResidents.length}</dd></div>
                  <div><dt className="flex items-center gap-1.5 text-muted-foreground"><Home aria-hidden="true" className="size-4" />Keluarga</dt><dd className="mt-1 font-bold">{families} KK</dd></div>
                </dl>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
