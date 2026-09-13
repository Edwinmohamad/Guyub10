"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Clock3, MapPin, Search, Store } from "lucide-react";

interface Umkm {
  id: string;
  nama_usaha: string;
  kategori: string;
  deskripsi: string;
  nomor_wa: string;
  foto_url?: string;
  alamat?: string;
  jam_buka?: string;
  profiles?: { rt: string };
}

const categories = ["Semua", "Makanan & Minuman", "Jasa & Perbaikan", "Toko Kelontong"];

export default function ClientUmkmList({ initialData }: { initialData: Umkm[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const items = useMemo(() => initialData.filter((item) => {
    const normalized = `${item.nama_usaha} ${item.deskripsi} ${item.kategori}`.toLowerCase();
    const matchesQuery = normalized.includes(query.trim().toLowerCase());
    if (category === "Semua") return matchesQuery;
    const value = item.kategori.toLowerCase();
    const matchesCategory = category === "Makanan & Minuman" ? /makanan|minuman/.test(value) : category === "Jasa & Perbaikan" ? /jasa|perbaikan/.test(value) : /toko|kelontong|warung/.test(value);
    return matchesQuery && matchesCategory;
  }), [category, initialData, query]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
      <div className="grid gap-4 border-b border-border pb-7 md:grid-cols-[1fr_auto] md:items-end">
        <label className="max-w-xl"><span className="mb-2 block text-sm font-bold">Cari usaha atau jasa</span><span className="relative block"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Contoh: makanan, servis AC" className="min-h-11 w-full rounded-lg border border-input bg-white py-2 pl-11 pr-3 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" /></span></label>
        <label><span className="mb-2 block text-sm font-bold">Kategori</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 w-full rounded-lg border border-input bg-white px-3 md:w-56">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <p aria-live="polite" className="py-5 text-sm text-muted-foreground">Menampilkan {items.length} usaha</p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="relative aspect-[16/9] bg-emerald-50">{item.foto_url ? <Image src={item.foto_url} alt={item.nama_usaha} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <Store aria-hidden="true" className="absolute left-5 top-5 size-8 text-emerald-900/30" />}</div>
            <div className="p-5"><p className="text-xs font-bold text-emerald-800">{item.kategori}</p><h2 className="mt-1 text-xl font-bold">{item.nama_usaha}</h2><div className="mt-3 space-y-2 text-sm text-muted-foreground">{item.alamat || item.profiles?.rt ? <p className="flex gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{item.alamat ? `${item.alamat}${item.profiles?.rt ? `, RT ${item.profiles.rt}` : ""}` : `RT ${item.profiles?.rt}`}</p> : null}{item.jam_buka ? <p className="flex gap-2"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{item.jam_buka}</p> : null}</div><p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.deskripsi}</p><a href={`https://wa.me/${item.nomor_wa.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-900 px-4 py-2 text-sm font-bold text-white">Hubungi lewat WhatsApp</a></div>
          </article>
        ))}
      </div>
      {!items.length ? <p className="rounded-lg border border-border bg-white p-8 text-center text-muted-foreground">Tidak ada usaha yang cocok dengan pencarian.</p> : null}
    </section>
  );
}
