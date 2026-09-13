import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

const footerLinks = [
  { href: "/profil", label: "Profil RW" },
  { href: "/informasi", label: "Informasi" },
  { href: "/layanan", label: "Layanan surat" },
  { href: "/kas", label: "Laporan kas" },
  { href: "/umkm", label: "UMKM warga" },
  { href: "/darurat", label: "Kontak darurat" },
];

export default function Footer() {
  return (
    <footer className="border-t border-emerald-950 bg-emerald-950 text-emerald-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr] md:px-8 lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo-rw.jpg"
              alt="Logo RW 10"
              width={48}
              height={48}
              className="size-12 rounded-full border border-white/20 object-cover"
            />
            <span>
              <span className="block text-lg font-extrabold tracking-tight text-white">Guyub 10</span>
              <span className="block text-xs font-medium text-emerald-200">Portal resmi warga RW 10</span>
            </span>
          </Link>
          <p className="mt-5 max-w-xl text-sm leading-6 text-emerald-100/80">
            Pusat layanan, informasi lingkungan, transparansi kas, dan kegiatan warga RW 10 Desa Cicadas.
          </p>
          <div className="mt-5 flex items-start gap-2 text-sm text-emerald-100/80">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>RW 10, Desa Cicadas, Kecamatan Gunung Putri, Kabupaten Bogor</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-200">Akses cepat</h2>
          <nav aria-label="Tautan footer" className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="min-h-11 py-2 text-sm font-semibold text-white hover:text-emerald-200">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
          >
            Masuk sebagai pengurus
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-emerald-100/65">
        © {new Date().getFullYear()} RW 10 Desa Cicadas. Dikelola untuk kepentingan warga.
      </div>
    </footer>
  );
}
