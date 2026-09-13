import { SearchCheck } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import CekStatusForm from "./CekStatusForm";

export const metadata = {
  title: "Cek Status Surat | Guyub 10",
  description: "Cek status pengajuan surat pengantar menggunakan nomor tiket.",
};

export default function CekStatusPage() {
  return <div className="min-h-screen bg-background"><PublicPageHeader icon={SearchCheck} label="Cek status" title="Cek status surat" description="Masukkan nomor tiket pengajuan untuk melihat perkembangan proses surat." action={{ href: "/layanan", label: "Buat surat" }} /><section className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8 md:py-14"><CekStatusForm /></section></div>;
}
