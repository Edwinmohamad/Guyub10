"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogIn, Menu, ShieldAlert, X } from "lucide-react";

const mainNavLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil RW" },
  { href: "/informasi", label: "Berita Warga" },
  { href: "/kegiatan", label: "Agenda" },
  { href: "/layanan", label: "Layanan" },
  { href: "/umkm", label: "UMKM" },
];

const moreLinks = [
  { href: "/kas", label: "Laporan Kas" },
  { href: "/rt", label: "Wilayah RT" },
  { href: "/laporan", label: "Lapor Infrastruktur" },
  { href: "/fasilitas", label: "Fasilitas" },
  { href: "/galeri", label: "Galeri Warga" },
  { href: "/aspirasi", label: "Aspirasi" },
  { href: "/lembaga", label: "Lembaga RW" },
];

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function NavbarClient() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-[#fbfcfa]/95 backdrop-blur-sm">
      <a href="#konten-utama" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-emerald-950 focus:px-4 focus:py-2 focus:text-white">
        Lewati ke konten utama
      </a>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-900">
          <Image src="/logo-rw.jpg" alt="Logo RW 10" width={44} height={44} className="size-11 rounded-full object-contain" priority />
          <span>
            <span className="block text-lg font-bold leading-none text-emerald-950">Guyub 10</span>
            <span className="mt-1 hidden text-xs text-slate-600 sm:block">Portal RW 10 Desa Cicadas</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center lg:flex" aria-label="Navigasi utama">
          {mainNavLinks.map((link) => {
            const active = isCurrentPath(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`border-b-2 px-3 py-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald-900 ${active ? "border-emerald-800 text-emerald-950" : "border-transparent text-slate-700 hover:text-emerald-900"}`}>
                {link.label}
              </Link>
            );
          })}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 border-b-2 border-transparent px-3 py-6 text-sm font-medium text-slate-700 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald-900">
              Lainnya <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-full w-64 rounded-b-xl border border-t-0 border-emerald-950/10 bg-white p-2 shadow-lg">
              {moreLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#f2f6f2] hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-900">
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <Link href="/darurat" className="ml-auto hidden min-h-10 items-center gap-2 rounded-lg bg-red-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 active:translate-y-px sm:flex lg:ml-2">
          <ShieldAlert className="size-4" aria-hidden="true" /> Darurat
        </Link>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="ml-auto flex size-11 items-center justify-center rounded-lg border border-emerald-950/15 bg-white text-emerald-950 hover:bg-[#f2f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 lg:hidden" aria-label={mobileOpen ? "Tutup menu" : "Buka menu"} aria-expanded={mobileOpen} aria-controls="menu-mobile">
          {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="menu-mobile" className="border-t border-emerald-950/10 bg-white px-4 py-4 lg:hidden" aria-label="Navigasi mobile">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {[...mainNavLinks, ...moreLinks].map((link) => {
              const active = isCurrentPath(pathname, link.href);
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-emerald-900 ${active ? "bg-[#e8f0e9] text-emerald-950" : "text-slate-700 hover:bg-[#f2f6f2]"}`}>
                  {link.label}
                </Link>
              );
            })}
            <Link href="/darurat" onClick={() => setMobileOpen(false)} className="mt-2 flex min-h-11 items-center gap-2 rounded-lg bg-red-700 px-3 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 sm:hidden">
              <ShieldAlert className="size-4" aria-hidden="true" /> Kontak darurat
            </Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-2 flex min-h-11 items-center gap-2 rounded-lg border border-emerald-950/15 px-3 py-2.5 text-sm font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-900">
              <LogIn className="size-4" aria-hidden="true" /> Pengurus
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
