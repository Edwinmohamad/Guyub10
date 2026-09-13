import Image from "next/image";
import Link from "next/link";
import { Box, Clock3, MapPin } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function FasilitasPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("fasilitas").select("id, nama, deskripsi, lokasi, jam_operasional, cara_peminjaman, bisa_dipinjam, foto_url").order("created_at", { ascending: false }).limit(50);

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader icon={Box} label="Fasilitas" title="Fasilitas warga" description="Informasi tempat dan inventaris bersama yang tersedia di lingkungan RW 10." />
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items?.length ? items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="relative aspect-[16/9] bg-muted">
                {item.foto_url ? <Image src={item.foto_url} alt={item.nama} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <Box aria-hidden="true" className="absolute left-5 top-5 size-8 text-emerald-900/30" />}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold">{item.nama}</h2>{item.bisa_dipinjam ? <span className="text-xs font-bold text-emerald-800">Dapat dipinjam</span> : null}</div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {item.lokasi ? <p className="flex gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{item.lokasi}</p> : null}
                  {item.jam_operasional ? <p className="flex gap-2"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{item.jam_operasional}</p> : null}
                </div>
                {item.deskripsi ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.deskripsi}</p> : null}
                {item.cara_peminjaman ? <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-900">Cara menggunakan</p><p className="mt-1 text-sm leading-6">{item.cara_peminjaman}</p></div> : null}
                {item.bisa_dipinjam ? <Link href="/layanan" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-900 px-4 py-2 text-sm font-bold text-white">Ajukan peminjaman</Link> : null}
              </div>
            </article>
          )) : <p className="md:col-span-2 lg:col-span-3 rounded-lg border border-border bg-white p-8 text-center text-muted-foreground">Belum ada data fasilitas.</p>}
        </div>
      </section>
    </div>
  );
}
