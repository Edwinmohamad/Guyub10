"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, CheckCircle2, ArrowRight } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { submitUmkm } from "../actions";

export default function UMKMRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const result = await submitUmkm(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center p-4 bg-background">
        <div className="bg-white p-12 rounded-2xl border border-border max-w-lg w-full text-center shadow-lg">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ fontFamily: "var(--font-bitter)" }}>Pendaftaran Berhasil!</h1>
          <p className="text-muted-foreground font-medium mb-8">
            Data usaha Anda telah berhasil dikirim dan sedang <strong>menunggu persetujuan (Review)</strong> oleh Admin RW. 
            <br/><br/>
            Usaha Anda akan tampil di halaman UMKM setelah disetujui.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/umkm">
              <button className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all w-full">
                Kembali ke Halaman UMKM
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicPageHeader icon={Store} label="Daftar UMKM" title="Daftarkan usaha warga" description="Isi data usaha, warung, atau jasa. Pengurus akan meninjau pendaftaran sebelum ditampilkan di direktori." action={{ href: "/umkm", label: "Lihat direktori" }} />

      {/* Registration Form */}
      <section className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <div className="rounded-xl border border-border bg-white p-5 md:p-8">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 text-sm font-bold text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Nama Pemilik *</label>
                <input 
                  type="text" 
                  name="nama_pemilik"
                  required
                  placeholder="Contoh: Bpk. Budi Santoso"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Nama Usaha / Toko *</label>
                <input 
                  type="text" 
                  name="nama_usaha"
                  required
                  placeholder="Contoh: Warung Nasi Uduk Mpok Ipeh"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Kategori Usaha *</label>
                <select 
                  name="kategori"
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="Kuliner (Makanan/Minuman)">Kuliner (Makanan/Minuman)</option>
                  <option value="Jasa & Perbaikan">Jasa & Perbaikan</option>
                  <option value="Toko Kelontong / Retail">Toko Kelontong / Retail</option>
                  <option value="Fashion & Kerajinan">Fashion & Kerajinan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Nomor WhatsApp *</label>
                <input 
                  type="text" 
                  name="nomor_wa"
                  required
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Alamat Lengkap / Patokan *</label>
                <input 
                  type="text" 
                  name="alamat"
                  required
                  placeholder="Contoh: Blok A No. 12 (Samping Masjid)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Jam Operasional (Opsional)</label>
                <input 
                  type="text" 
                  name="jam_buka"
                  placeholder="Contoh: Setiap Hari, 08:00 - 20:00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Upload Foto Usaha / Logo (Opsional)</label>
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setLogoFile(file);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {logoFile && (
                <p className="text-xs text-green-600 mt-1 font-medium">✓ {logoFile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-2">Deskripsi Lengkap & Daftar Menu *</label>
              <textarea 
                name="deskripsi"
                required
                rows={6}
                placeholder="Ceritakan tentang usaha Anda. Anda juga bisa menuliskan daftar menu, harga barang, atau layanan jasa yang ditawarkan..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium resize-y text-foreground"
              ></textarea>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-primary text-primary-foreground font-black text-lg px-8 py-4 rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                ) : null}
                Kirim Pendaftaran UMKM
                {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  );
}
