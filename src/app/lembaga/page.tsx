import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Users } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function LembagaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("lembaga").select("slug, nama, deskripsi, ketua_nama, ketua_foto_url").order("slug");
  const items = data?.filter((item) => !item.slug.startsWith("rt")) ?? [];
  return <div className="min-h-screen bg-background"><PublicPageHeader icon={Building2} label="Lembaga" title="Lembaga dan organisasi" description="Kenali pengurus serta kelompok warga yang menjalankan pelayanan dan kegiatan di RW 10." /><section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.length ? items.map((item) => <Link key={item.slug} href={`/lembaga/${item.slug}`} className="group rounded-xl border border-border bg-white p-5 hover:border-emerald-700"><div className="flex items-center gap-4">{item.ketua_foto_url ? <Image src={item.ketua_foto_url} alt={item.ketua_nama || item.nama} width={56} height={56} className="size-14 rounded-lg object-cover" /> : <span className="flex size-14 items-center justify-center rounded-lg bg-emerald-50"><Users aria-hidden="true" className="size-6 text-emerald-800" /></span>}<div><h2 className="text-lg font-bold">{item.nama}</h2>{item.ketua_nama ? <p className="mt-1 text-sm text-muted-foreground">Ketua: {item.ketua_nama}</p> : null}</div></div>{item.deskripsi ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.deskripsi}</p> : null}<span className="mt-5 inline-flex min-h-11 items-center gap-2 py-2 text-sm font-bold text-emerald-900">Lihat profil <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>) : <p className="md:col-span-2 lg:col-span-3 rounded-xl border border-border bg-white p-8 text-center text-muted-foreground">Data lembaga belum tersedia.</p>}</div></section></div>;
}
