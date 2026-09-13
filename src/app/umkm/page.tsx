import { Store } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import ClientUmkmList from "./ClientUmkmList";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function UmkmPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("umkm").select("id, nama_usaha, kategori, deskripsi, nomor_wa, alamat, jam_buka, foto_url, profiles(rt)").eq("is_approved", true).order("created_at", { ascending: false }).limit(100);
  const items = (data ?? []).map((item) => ({ ...item, profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles }));
  return <div className="min-h-screen bg-background"><PublicPageHeader icon={Store} label="UMKM" title="UMKM dan jasa warga" description="Temukan produk, makanan, jasa, dan keahlian warga RW 10. Belanja dekat, manfaatnya kembali ke lingkungan." action={{ href: "/umkm/daftar", label: "Daftarkan usaha" }} /><ClientUmkmList initialData={items} /></div>;
}
