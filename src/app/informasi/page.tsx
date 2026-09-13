import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function InformasiPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("pengumuman")
    .select("id, judul, konten, kategori, foto_url, created_at")
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader icon={Newspaper} label="Informasi" title="Informasi warga" description="Pengumuman, berita lingkungan, dan kabar kegiatan terbaru dari pengurus RW 10." />
      <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {items?.length ? (
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <article key={item.id} className="grid gap-5 py-7 sm:grid-cols-[160px_1fr]">
                {item.foto_url ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:h-32">
                    <Image src={item.foto_url} alt="" fill sizes="(max-width: 640px) 100vw, 160px" className="object-cover" />
                  </div>
                ) : (
                  <div className="hidden h-32 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 sm:flex"><Newspaper aria-hidden="true" className="size-7" /></div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <span className="text-emerald-800">{item.kategori}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-3.5" />{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold leading-snug text-foreground md:text-2xl">{item.judul}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.konten}</p>
                  <Link href={`/informasi/${item.id}`} className="mt-3 inline-flex min-h-11 items-center gap-2 py-2 text-sm font-bold text-emerald-900 hover:underline">Baca informasi <ArrowRight aria-hidden="true" className="size-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : <p className="rounded-lg border border-border bg-white p-8 text-center text-muted-foreground">Belum ada informasi yang diterbitkan.</p>}
      </section>
    </div>
  );
}
