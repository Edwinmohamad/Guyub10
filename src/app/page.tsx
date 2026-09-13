import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  FileCheck2,
  Landmark,
  MessageSquareText,
  ShieldAlert,
  ShoppingBag,
  WalletCards,
} from "lucide-react";

import { InfografisWarga } from "@/components/InfografisWarga";
import { fetchWargaStatisticsRows } from "@/lib/supabase/fetchAllWarga";
import { createClient } from "@/lib/supabase/server";

const WidgetBar = dynamic(() => import("@/components/WidgetBar"));

type WargaStatisticsRow = {
  rt?: string | number | null;
  jenis_kelamin?: string | null;
  tanggal_lahir?: string | null;
  no_kk?: string | null;
};

const services = [
  { href: "/layanan", label: "Ajukan surat", description: "Buat surat pengantar dan simpan nomor tiket.", icon: FileCheck2 },
  { href: "/layanan/cek", label: "Cek status surat", description: "Lihat progres pengajuan tanpa datang ke sekretariat.", icon: FileCheck2 },
  { href: "/kas", label: "Laporan kas", description: "Pantau pemasukan dan pengeluaran lingkungan.", icon: WalletCards },
  { href: "/aspirasi", label: "Sampaikan aspirasi", description: "Kirim usulan atau laporan kepada pengurus.", icon: MessageSquareText },
  { href: "/darurat", label: "Kontak darurat", description: "Temukan nomor yang bisa segera dihubungi.", icon: ShieldAlert },
];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();
  const [
    { data: articles },
    { data: profil },
    { data: ticker },
    { data: kegiatan },
    { data: umkm },
    wargaRows,
  ] = await Promise.all([
    supabase.from("pengumuman").select("id, judul, kategori, foto_url, created_at").order("created_at", { ascending: false }).limit(3),
    supabase.from("profil_rw").select("visi, hero_foto_url, jumlah_warga, jumlah_kk, jumlah_rt, ketua_nama, ketua_sambutan, ketua_foto_url").limit(1).single(),
    supabase.from("ticker").select("id, konten").eq("aktif", true).order("urutan").limit(3),
    supabase.from("kegiatan").select("id, judul, tanggal, lokasi, kategori").gte("tanggal", new Date().toISOString()).order("tanggal").limit(3),
    supabase.from("umkm").select("id, nama_usaha, kategori, foto_url, alamat").eq("is_approved", true).order("created_at", { ascending: false }).limit(3),
    fetchWargaStatisticsRows(),
  ]);

  const wargaData = wargaRows as WargaStatisticsRow[];
  const totalKK = new Set(wargaData.map((warga) => warga.no_kk).filter(Boolean)).size;
  const genderCounts = { L: 0, P: 0 };
  const rtCounts: Record<string, number> = {};
  const ageCounts = {
    "0-5 tahun": 0,
    "6-12 tahun": 0,
    "13-17 tahun": 0,
    "18-59 tahun": 0,
    "60+ tahun": 0,
  };

  for (const warga of wargaData) {
    if (warga.jenis_kelamin === "L" || warga.jenis_kelamin === "P") {
      genderCounts[warga.jenis_kelamin] += 1;
    }

    const rt = String(warga.rt ?? "-").replace(/^0+/, "") || "0";
    rtCounts[`RT ${rt}`] = (rtCounts[`RT ${rt}`] ?? 0) + 1;

    if (warga.tanggal_lahir) {
      const birthDate = new Date(warga.tanggal_lahir);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDelta = today.getMonth() - birthDate.getMonth();
      if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) age -= 1;

      if (age <= 5) ageCounts["0-5 tahun"] += 1;
      else if (age <= 12) ageCounts["6-12 tahun"] += 1;
      else if (age <= 17) ageCounts["13-17 tahun"] += 1;
      else if (age <= 59) ageCounts["18-59 tahun"] += 1;
      else ageCounts["60+ tahun"] += 1;
    }
  }

  const heroImage = profil?.hero_foto_url || "/desa-industri-bg.png";
  const statistics = {
    totalWarga: wargaData.length || profil?.jumlah_warga || 0,
    totalKK: totalKK || profil?.jumlah_kk || 0,
    genderData: [
      { name: "Laki-laki", value: genderCounts.L },
      { name: "Perempuan", value: genderCounts.P },
    ],
    rtData: Object.entries(rtCounts).map(([name, value]) => ({ name, value })),
    ageData: Object.entries(ageCounts).map(([name, value]) => ({ name, value })),
  };

  return (
    <div className="overflow-x-hidden bg-[#fbfcfa]">
      {ticker && ticker.length > 0 && (
        <aside className="border-b border-emerald-950/10 bg-[#e8f0e9]" aria-label="Informasi penting">
          <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            <span className="shrink-0 text-sm font-semibold text-emerald-950">Info warga</span>
            {ticker.map((item) => (
              <p key={item.id} className="min-w-[18rem] border-l border-emerald-950/15 pl-4 text-sm text-slate-700 first-of-type:min-w-0">
                {item.konten}
              </p>
            ))}
          </div>
        </aside>
      )}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8">
        <div className="max-w-3xl py-2 lg:py-8">
          <p className="mb-4 text-sm font-semibold text-emerald-800">Portal resmi RW 10 Desa Cicadas</p>
          <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.08] text-emerald-950 sm:text-5xl lg:text-6xl">
            Informasi dan layanan warga dalam satu tempat
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-slate-600 md:text-lg">
            Urus kebutuhan lingkungan, ikuti agenda, dan lihat kabar terbaru RW 10 dengan lebih mudah.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/layanan" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 active:translate-y-px">
              Buka layanan
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/informasi" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-emerald-950/20 bg-white px-5 py-3 font-semibold text-emerald-950 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 active:translate-y-px">
              Lihat informasi
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-xl bg-emerald-950/5 sm:min-h-[360px]">
          <Image src={heroImage} alt="Lingkungan RW 10 Desa Cicadas" fill priority quality={72} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-emerald-950/85 p-4 text-white sm:p-5">
            <p className="text-sm font-medium">Desa Cicadas, Gunung Putri, Bogor</p>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white py-14 md:py-20" aria-labelledby="layanan-warga">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="layanan-warga" className="text-balance text-3xl font-bold text-emerald-950 md:text-4xl">Keperluan warga yang paling sering dicari</h2>
            <p className="mt-3 text-pretty leading-7 text-slate-600">Pilih kebutuhan Anda. Setiap layanan dilengkapi petunjuk yang mudah diikuti.</p>
          </div>
          <div className="mt-9 grid overflow-hidden rounded-xl border border-emerald-950/10 md:grid-cols-2">
            {services.map((service, index) => (
              <Link key={service.href} href={service.href} className={`group flex min-h-32 gap-4 bg-white p-5 transition-colors hover:bg-[#f2f6f2] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-emerald-900 md:p-6 ${index === 0 ? "md:row-span-2 md:min-h-64 md:flex-col md:justify-between md:border-r" : "border-t md:first:border-t-0"}`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-white">
                  <service.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-semibold text-emerald-950">
                    {service.label}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                  <span className="mt-1 block max-w-md text-sm leading-6 text-slate-600">{service.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20" aria-labelledby="berita-terbaru">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="berita-terbaru" className="text-balance text-3xl font-bold text-emerald-950 md:text-4xl">Kabar terbaru dari lingkungan</h2>
              <p className="mt-3 text-pretty leading-7 text-slate-600">Pengumuman dan kegiatan yang perlu diketahui warga.</p>
            </div>
            <Link href="/informasi" className="inline-flex items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-900">
              Semua informasi <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-9 divide-y divide-emerald-950/10 border-y border-emerald-950/10">
            {articles?.length ? articles.map((article, index) => (
              <article key={article.id} className="grid gap-5 py-6 md:grid-cols-[8rem_1fr_auto] md:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e8f0e9]">
                  {article.foto_url ? (
                    <Image src={article.foto_url} alt={article.judul} fill sizes="(max-width: 768px) 100vw, 128px" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-2xl font-bold text-emerald-900/30">{index + 1}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">{article.kategori} <span className="mx-2 text-emerald-950/30">/</span> {formatDate(article.created_at)}</p>
                  <h3 className="mt-2 text-balance text-xl font-semibold leading-snug text-emerald-950 md:text-2xl">
                    <Link href={`/informasi/${article.id}`} className="hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-900">{article.judul}</Link>
                  </h3>
                </div>
                <Link href={`/informasi/${article.id}`} aria-label={`Baca ${article.judul}`} className="hidden size-10 items-center justify-center rounded-lg border border-emerald-950/15 text-emerald-900 transition-colors hover:bg-emerald-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 md:flex">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            )) : (
              <div className="py-10 text-slate-600">Belum ada informasi terbaru. Lihat kembali beberapa saat lagi.</div>
            )}
          </div>
        </div>
      </section>

      <InfografisWarga data={statistics} />

      <section className="py-14 md:py-20" aria-labelledby="agenda-terdekat">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <CalendarDays className="size-8 text-emerald-800" aria-hidden="true" />
            <h2 id="agenda-terdekat" className="mt-5 text-balance text-3xl font-bold text-emerald-950 md:text-4xl">Agenda terdekat</h2>
            <p className="mt-3 max-w-md text-pretty leading-7 text-slate-600">Catat kegiatan lingkungan dan hadir bersama warga lainnya.</p>
            <Link href="/kegiatan" className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-900">Lihat kalender <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="divide-y divide-emerald-950/10 border-y border-emerald-950/10">
            {kegiatan?.length ? kegiatan.map((item) => (
              <article key={item.id} className="grid gap-3 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <time dateTime={item.tanggal} className="tabular-nums text-sm font-semibold text-emerald-800">{formatDate(item.tanggal)}</time>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-950">{item.judul}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.lokasi || "Lokasi menyusul"}</p>
                </div>
              </article>
            )) : <p className="py-8 text-slate-600">Belum ada agenda yang dijadwalkan.</p>}
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white py-14 md:py-20" aria-labelledby="umkm-warga">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <ShoppingBag className="size-8 text-emerald-800" aria-hidden="true" />
              <h2 id="umkm-warga" className="mt-5 text-balance text-3xl font-bold text-emerald-950 md:text-4xl">Usaha milik warga</h2>
              <p className="mt-3 text-pretty leading-7 text-slate-600">Temukan produk dan layanan dari tetangga di sekitar kita.</p>
            </div>
            <Link href="/umkm" className="inline-flex items-center gap-2 font-semibold text-emerald-800 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-900">Direktori UMKM <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-9 grid gap-px overflow-hidden rounded-xl border border-emerald-950/10 bg-emerald-950/10 md:grid-cols-3">
            {umkm?.length ? umkm.map((item) => (
              <article key={item.id} className="bg-white">
                <div className="relative aspect-[4/3] bg-[#e8f0e9]">
                  {item.foto_url ? <Image src={item.foto_url} alt={item.nama_usaha} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <Building2 className="absolute left-5 top-5 size-7 text-emerald-900/35" aria-hidden="true" />}
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-emerald-800">{item.kategori}</p>
                  <h3 className="mt-1 text-xl font-semibold text-emerald-950">{item.nama_usaha}</h3>
                  {item.alamat && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.alamat}</p>}
                </div>
              </article>
            )) : <div className="col-span-full bg-white p-8 text-slate-600">Belum ada UMKM yang ditampilkan.</div>}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20" aria-labelledby="sambutan-ketua">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[14rem_1fr] md:items-center lg:px-8">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#e8f0e9]">
            {profil?.ketua_foto_url ? <Image src={profil.ketua_foto_url} alt={`Ketua RW 10, ${profil.ketua_nama}`} fill sizes="(max-width: 768px) 100vw, 224px" className="object-cover" /> : <Landmark className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-emerald-900/30" aria-hidden="true" />}
          </div>
          <div className="max-w-3xl">
            <h2 id="sambutan-ketua" className="text-balance text-3xl font-bold text-emerald-950 md:text-4xl">Sambutan Ketua RW</h2>
            <blockquote className="mt-5 text-pretty text-lg leading-8 text-slate-700">“{profil?.ketua_sambutan || "Portal ini membantu warga mendapatkan informasi dan layanan dengan lebih mudah."}”</blockquote>
            <p className="mt-5 font-semibold text-emerald-950">{profil?.ketua_nama || "Ketua RW 10"}</p>
            <p className="text-sm text-slate-600">Ketua RW 10 Desa Cicadas</p>
          </div>
        </div>
      </section>

      <div className="border-t border-emerald-950/10 bg-white">
        <WidgetBar />
      </div>
    </div>
  );
}
