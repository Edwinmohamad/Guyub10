import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export const metadata: Metadata = {
  title: "Guyub 10 | Layanan dan Informasi Warga",
  description:
    "Portal resmi RW 10 Desa Cicadas. Akses layanan surat pengantar online, direktori UMKM warga, papan informasi publik, dan laporan keuangan transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main id="konten-utama" className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
