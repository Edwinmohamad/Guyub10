import { WalletCards } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import KasClient from "./KasClient";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function KasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("kas").select("id, tanggal, keterangan, jenis, jumlah, kategori, entitas_type, entitas_id").order("tanggal", { ascending: false }).limit(500);
  return <div className="min-h-screen bg-background"><PublicPageHeader icon={WalletCards} label="Laporan kas" title="Transparansi kas" description="Ringkasan penerimaan dan pengeluaran kas RW 10 yang dapat diperiksa oleh seluruh warga." /><section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10"><KasClient initialData={data ?? []} /></section></div>;
}
