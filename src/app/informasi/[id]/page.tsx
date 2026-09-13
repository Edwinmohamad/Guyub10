import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MessageSquare, User } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { incrementViews } from "../actions";
import { ShareButtons } from "./ShareButtons";
import { KomentarForm } from "./KomentarForm";

export const revalidate = 0;

export default async function InformasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: item }, { data: comments }] = await Promise.all([
    supabase.from("pengumuman").select("id, judul, konten, kategori, penyelenggara, foto_url, views, created_at").eq("id", id).single(),
    supabase.from("komentar_pengumuman").select("id, nama, isi, created_at").eq("pengumuman_id", id).eq("status", "disetujui").order("created_at").limit(100),
  ]);
  if (!item) notFound();
  void incrementViews(id);
  const formatDate = (value: string) => new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://guyub-10.vercel.app"}/informasi/${id}`;
  const paragraphs: string[] = String(item.konten).split("\n");

  return (
    <div className="min-h-screen bg-background">
      <article>
        <header className="border-b border-border bg-white">
          <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
            <Link href="/informasi" className="inline-flex min-h-11 items-center gap-2 py-2 text-sm font-bold text-emerald-900"><ArrowLeft aria-hidden="true" className="size-4" />Kembali ke informasi</Link>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground"><span className="text-emerald-800">{item.kategori}</span><span className="flex gap-1.5"><CalendarDays aria-hidden="true" className="size-4" />{formatDate(item.created_at)}</span></div>
            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">{item.judul}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><User aria-hidden="true" className="size-4" />{item.penyelenggara || "Pengurus RW 10"}</p>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12">
          {item.foto_url ? <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-muted"><Image src={item.foto_url} alt={item.judul} fill priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" /></div> : null}
          <div className="max-w-none text-base leading-8 text-foreground">{paragraphs.map((paragraph, index) => paragraph.trim() ? <p key={index} className="mb-5">{paragraph}</p> : null)}</div>
          <ShareButtons title={item.judul} url={pageUrl} />
          <section className="mt-10 border-t border-border pt-8"><h2 className="flex items-center gap-2 text-2xl font-bold"><MessageSquare aria-hidden="true" className="size-5 text-emerald-800" />Komentar</h2><div className="mt-5 space-y-3">{comments?.length ? comments.map((comment) => <article key={comment.id} className="rounded-lg border border-border bg-white p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">{comment.nama}</h3><time className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</time></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.isi}</p></article>) : <p className="rounded-lg bg-muted/60 p-5 text-sm text-muted-foreground">Belum ada komentar yang diterbitkan.</p>}</div></section>
          <KomentarForm pengumumanId={id} />
        </div>
      </article>
    </div>
  );
}
