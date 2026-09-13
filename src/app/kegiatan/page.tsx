import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, Info, List, MapPin } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";
import KalenderView from "./KalenderView";

export const revalidate = 60;

export default async function KegiatanPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "list" } = await searchParams;
  const supabase = await createClient();
  const [{ data: allItems }, { data: profile }] = await Promise.all([
    supabase.from("kegiatan").select("id, judul, deskripsi, tanggal, lokasi, kategori, penyelenggara, foto_url").order("tanggal", { ascending: true }).limit(200),
    supabase.from("profil_rw").select("info_penting_kegiatan").limit(1).single(),
  ]);
  const items = (allItems ?? []).filter((item) => new Date(item.tanggal).getTime() >= new Date().setHours(0, 0, 0, 0));

  return <div className="min-h-screen bg-background"><PublicPageHeader icon={CalendarDays} label="Kegiatan" title="Agenda kegiatan warga" description="Jadwal pertemuan, pelayanan, kerja bakti, dan kegiatan bersama di lingkungan RW 10." />
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10"><nav aria-label="Pilihan tampilan" className="mb-7 flex gap-2 border-b border-border pb-4"><Link href="/kegiatan?view=list" aria-current={view === "list" ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold ${view === "list" ? "bg-emerald-900 text-white" : "border border-input bg-white"}`}><List aria-hidden="true" className="size-4" />Daftar</Link><Link href="/kegiatan?view=calendar" aria-current={view === "calendar" ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold ${view === "calendar" ? "bg-emerald-900 text-white" : "border border-input bg-white"}`}><CalendarDays aria-hidden="true" className="size-4" />Kalender</Link></nav>
    {view === "calendar" ? <KalenderView data={allItems ?? []} /> : <div className="grid gap-8 lg:grid-cols-[1fr_300px]"><div className="divide-y divide-border border-y border-border">{items.length ? items.map((item) => <article key={item.id} className="grid gap-4 py-6 sm:grid-cols-[72px_1fr] md:grid-cols-[72px_128px_1fr]"><time dateTime={item.tanggal} className="flex h-16 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-950"><span className="text-xs font-bold uppercase">{new Date(item.tanggal).toLocaleDateString("id-ID", { month: "short" })}</span><span className="text-2xl font-extrabold leading-none">{new Date(item.tanggal).getDate()}</span></time>{item.foto_url ? <div className="relative hidden h-24 overflow-hidden rounded-lg bg-muted md:block"><Image src={item.foto_url} alt="" fill sizes="128px" className="object-cover" /></div> : <div className="hidden h-24 rounded-lg bg-muted md:block" />}<div><p className="text-xs font-bold text-emerald-800">{item.kategori}</p><h2 className="mt-1 text-xl font-bold">{item.judul}</h2>{item.deskripsi ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.deskripsi}</p> : null}<div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex gap-1.5"><Clock3 aria-hidden="true" className="size-4" />{new Date(item.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>{item.lokasi ? <span className="flex gap-1.5"><MapPin aria-hidden="true" className="size-4" />{item.lokasi}</span> : null}</div></div></article>) : <p className="p-8 text-center text-muted-foreground">Belum ada kegiatan mendatang.</p>}</div><aside className="h-fit rounded-xl border border-amber-200 bg-amber-50 p-5"><Info aria-hidden="true" className="size-5 text-amber-800" /><h2 className="mt-3 font-bold">Informasi kegiatan</h2><p className="mt-2 text-sm leading-6 text-amber-950/75">{profile?.info_penting_kegiatan || "Warga diharapkan ikut berpartisipasi dalam kegiatan lingkungan sesuai waktu yang diumumkan."}</p></aside></div>}
    </section></div>;
}
