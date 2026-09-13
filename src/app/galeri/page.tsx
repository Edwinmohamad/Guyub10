import { Camera } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import GalleryClient from "./GalleryClient";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function GaleriPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("galeri").select("id, foto_url, judul, album").order("created_at", { ascending: false }).limit(60);
  const items = (data ?? []).map((item) => ({ id: item.id, url: item.foto_url, title: item.judul, category: item.album || "Umum" }));

  return <div className="min-h-screen bg-background"><PublicPageHeader icon={Camera} label="Galeri" title="Galeri warga" description="Dokumentasi kegiatan, kebersamaan, dan perkembangan lingkungan RW 10." /><section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">{items.length ? <GalleryClient items={items} /> : <p className="rounded-lg border border-border bg-white p-8 text-center text-muted-foreground">Belum ada foto di galeri.</p>}</section></div>;
}
