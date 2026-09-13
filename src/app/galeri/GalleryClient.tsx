"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface GalleryItem { id: number; url: string; title: string; category: string }

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  return <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item)} className="overflow-hidden rounded-xl border border-border bg-white text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"><span className="relative block aspect-[4/3] bg-muted"><Image src={item.url} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></span><span className="block p-4"><span className="block text-xs font-bold text-emerald-800">{item.category}</span><span className="mt-1 block font-bold">{item.title}</span></span></button>)}</div>{selected ? <div role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"><button type="button" aria-label="Tutup foto" onClick={() => setSelected(null)} className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-lg bg-white text-black"><X aria-hidden="true" className="size-5" /></button><div onClick={(event) => event.stopPropagation()} className="w-full max-w-5xl"><div className="relative aspect-video max-h-[78vh]"><Image src={selected.url} alt={selected.title} fill sizes="100vw" className="object-contain" /></div><p className="mt-3 text-center font-bold text-white">{selected.title}</p></div></div> : null}</>;
}
