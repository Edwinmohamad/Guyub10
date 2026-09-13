import {
  FileText,
  Megaphone,
  MessageSquare,
  Store,
  Users,
  Wrench,
} from "lucide-react";

import { createAuthorizedAdminClient } from "@/lib/auth/admin";
import AdminTabs from "./AdminTabs";
import { AspirasiManager } from "./AspirasiManager";
import { FasilitasManager } from "./FasilitasManager";
import { GaleriManager } from "./GaleriManager";
import KegiatanManager from "./KegiatanManager";
import { KasManager } from "./KasManager";
import { KomentarManager } from "./KomentarManager";
import { LaporanManager } from "./LaporanManager";
import { LembagaEditor } from "./LembagaEditor";
import { PengumumanManager } from "./PengumumanManager";
import { ProfilRtManager } from "./ProfilRtManager";
import { ProfilRwEditor } from "./ProfilRwEditor";
import { SuratTable } from "./SuratTable";
import { TickerManager } from "./TickerManager";
import { UmkmManager } from "./UmkmManager";
import { WargaManager } from "./WargaManager";

export const revalidate = 0;

const MENU_ITEMS = [
  { key: "overview", label: "Overview", icon: "BarChart3" },
  { key: "profil", label: "Profil RW", icon: "Landmark" },
  { key: "profil_rt", label: "Profil RT", icon: "Users" },
  { key: "ticker", label: "Ticker", icon: "Type" },
  { key: "pengumuman", label: "Berita Warga", icon: "Megaphone" },
  { key: "kegiatan", label: "Kegiatan", icon: "Calendar" },
  { key: "lembaga", label: "Lembaga & RT", icon: "Building" },
  { key: "fasilitas", label: "Fasilitas", icon: "Building" },
  { key: "surat", label: "Layanan Surat", icon: "FileText" },
  { key: "umkm", label: "UMKM", icon: "Store" },
  { key: "galeri", label: "Galeri", icon: "Image" },
  { key: "kas", label: "Laporan Kas", icon: "DollarSign" },
  { key: "laporan", label: "Infrastruktur", icon: "Wrench" },
  { key: "aspirasi", label: "Aspirasi", icon: "MessageSquare" },
  { key: "warga", label: "Database Warga", icon: "Database" },
  { key: "komentar", label: "Komentar Berita", icon: "MessageSquare" },
] as const;

async function Overview() {
  const supabase = await createAuthorizedAdminClient();
  const [
    { count: countSurat },
    { count: countUmkm },
    { count: countPengumuman },
    { count: countAspirasi },
    { count: countWarga },
    { count: countLaporan },
  ] = await Promise.all([
    supabase.from("surat").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("umkm").select("id", { count: "exact", head: true }),
    supabase.from("pengumuman").select("id", { count: "exact", head: true }),
    supabase.from("aspirasi").select("id", { count: "exact", head: true }).eq("status", "masuk"),
    supabase.from("warga").select("id", { count: "exact", head: true }),
    supabase.from("laporan_infrastruktur").select("id", { count: "exact", head: true }).eq("status", "masuk"),
  ]);

  const stats = [
    { icon: Users, label: "Total Warga", value: countWarga ?? 0, unit: "jiwa", tone: "bg-emerald-50 text-emerald-800" },
    { icon: FileText, label: "Surat Pending", value: countSurat ?? 0, unit: "menunggu", tone: "bg-amber-50 text-amber-800" },
    { icon: Store, label: "UMKM", value: countUmkm ?? 0, unit: "usaha", tone: "bg-teal-50 text-teal-800" },
    { icon: Megaphone, label: "Berita Warga", value: countPengumuman ?? 0, unit: "postingan", tone: "bg-sky-50 text-sky-800" },
    { icon: MessageSquare, label: "Aspirasi Baru", value: countAspirasi ?? 0, unit: "pesan", tone: "bg-rose-50 text-rose-800" },
    { icon: Wrench, label: "Laporan Masuk", value: countLaporan ?? 0, unit: "laporan", tone: "bg-orange-50 text-orange-800" },
  ];

  return (
    <section aria-labelledby="ringkasan-admin" className="space-y-5">
      <h3 id="ringkasan-admin" className="sr-only">Ringkasan operasional</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-600">{stat.label}</p>
              <span className={`flex size-9 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="tabular-nums text-3xl font-bold text-zinc-950">
              {stat.value}
              <span className="ml-2 text-sm font-medium text-zinc-500">{stat.unit}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

async function AdminContent({ activeTab }: { activeTab: string }) {
  const supabase = await createAuthorizedAdminClient();

  switch (activeTab) {
    case "profil": {
      const { data } = await supabase.from("profil_rw").select("*").limit(1).single();
      return <ProfilRwEditor data={data} />;
    }
    case "profil_rt": {
      const { data } = await supabase.from("profil_rt").select("*").order("no_rt");
      return <ProfilRtManager data={data ?? []} />;
    }
    case "ticker": {
      const { data } = await supabase.from("ticker").select("*").order("urutan");
      return <TickerManager tickerList={data ?? []} />;
    }
    case "pengumuman": {
      const { data } = await supabase.from("pengumuman").select("id, judul, konten, kategori, foto_url, created_at").order("created_at", { ascending: false }).limit(100);
      return <PengumumanManager pengumumanList={data ?? []} />;
    }
    case "kegiatan": {
      const { data } = await supabase.from("kegiatan").select("*").order("tanggal", { ascending: true }).limit(100);
      return <KegiatanManager data={data ?? []} />;
    }
    case "lembaga": {
      const { data } = await supabase.from("lembaga").select("*").order("slug");
      return <LembagaEditor lembagaList={data ?? []} />;
    }
    case "fasilitas": {
      const { data } = await supabase.from("fasilitas").select("*").order("created_at", { ascending: false }).limit(100);
      return <FasilitasManager fasilitasList={data ?? []} />;
    }
    case "surat": {
      const [{ data: suratList }, { data: profilRw }] = await Promise.all([
        supabase.from("surat").select("id, jenis_surat, keperluan, status, catatan_admin, lampiran_url, tujuan, nomor_tiket, pdf_url, created_at, profiles(nama_lengkap, rt)").order("created_at", { ascending: false }).limit(50),
        supabase.from("profil_rw").select("ketua_nama").limit(1).single(),
      ]);
      return (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
          <h3 className="mb-5 text-xl font-bold text-zinc-900">Manajemen pengajuan surat</h3>
          <SuratTable suratList={suratList ?? []} ketuaNama={profilRw?.ketua_nama ?? "Ketua RW"} />
        </section>
      );
    }
    case "umkm": {
      const { data } = await supabase.from("umkm").select("id, nama_usaha, kategori, deskripsi, nomor_wa, is_approved, foto_url, alamat, jam_buka, created_at, profiles(nama_lengkap, rt)").order("created_at", { ascending: false }).limit(100);
      return <UmkmManager umkmList={data ?? []} />;
    }
    case "galeri": {
      const { data } = await supabase.from("galeri").select("*").order("created_at", { ascending: false }).limit(100);
      return <GaleriManager galeriList={data ?? []} />;
    }
    case "kas": {
      const { data } = await supabase.from("kas").select("*").order("tanggal", { ascending: false }).limit(100);
      return <KasManager kasList={data ?? []} />;
    }
    case "laporan": {
      const { data } = await supabase.from("laporan_infrastruktur").select("*").order("created_at", { ascending: false }).limit(100);
      return <LaporanManager laporanList={data ?? []} />;
    }
    case "aspirasi": {
      const { data } = await supabase.from("aspirasi").select("*").order("created_at", { ascending: false }).limit(100);
      return <AspirasiManager aspirasiList={data ?? []} />;
    }
    case "warga": {
      const { data } = await supabase.from("warga").select("*").order("nama_lengkap").limit(5000);
      return <WargaManager wargaList={data ?? []} />;
    }
    case "komentar": {
      const { data } = await supabase.from("komentar_pengumuman").select("id, nama, email, isi, status, created_at, pengumuman_id, pengumuman(judul)").order("created_at", { ascending: false }).limit(200);
      return <KomentarManager komentarList={data ?? []} />;
    }
    default:
      return <Overview />;
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const validTabs = new Set<string>(MENU_ITEMS.map((item) => item.key));
  const activeTab = tab && validTabs.has(tab) ? tab : "overview";

  return (
    <div className="space-y-6 text-zinc-900">
      <header>
        <h2 className="text-balance text-2xl font-bold text-zinc-950 md:text-3xl">Dashboard pengurus RW</h2>
        <p className="mt-1 max-w-2xl text-pretty text-sm text-zinc-600 md:text-base">
          Kelola layanan warga dan lihat pekerjaan yang perlu ditindaklanjuti.
        </p>
      </header>
      <AdminTabs menuItems={[...MENU_ITEMS]} activeTab={activeTab} />
      <AdminContent activeTab={activeTab} />
    </div>
  );
}
