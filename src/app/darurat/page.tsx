import { AlertTriangle, Flame, HeartPulse, PhoneCall, ShieldAlert } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function DaruratPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("profil_rw").select("ketua_nama, nomor_darurat").limit(1).single();
  const contacts = [
    { label: "Polisi", detail: "110", href: "tel:110", icon: ShieldAlert },
    { label: "Pemadam kebakaran", detail: "113", href: "tel:113", icon: Flame },
    { label: "Darurat medis", detail: "119", href: "tel:119", icon: HeartPulse },
    ...(data?.nomor_darurat ? [{ label: data.ketua_nama || "Pengurus RW", detail: data.nomor_darurat, href: `tel:${data.nomor_darurat.replace(/\D/g, "")}`, icon: AlertTriangle }] : []),
  ];
  return <div className="min-h-screen bg-background"><PublicPageHeader icon={PhoneCall} label="Kontak darurat" title="Kontak darurat" description="Gunakan nomor berikut hanya untuk keadaan mendesak. Jelaskan lokasi dan kondisi dengan singkat saat tersambung." /><section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14"><div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950"><strong>Jika keselamatan terancam,</strong> hubungi layanan resmi terlebih dahulu. Jangan hanya mengandalkan pesan singkat.</div><div className="grid gap-4 md:grid-cols-2">{contacts.map(({ label, detail, href, icon: Icon }) => <a key={label} href={href} className="group flex min-h-32 items-center justify-between rounded-xl border border-border bg-white p-5 hover:border-red-700"><div><span className="flex size-11 items-center justify-center rounded-lg bg-red-50 text-red-800"><Icon aria-hidden="true" className="size-5" /></span><h2 className="mt-3 text-xl font-bold">{label}</h2><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div><span className="flex size-11 items-center justify-center rounded-lg bg-red-800 text-white"><PhoneCall aria-hidden="true" className="size-5" /></span></a>)}</div></section></div>;
}
