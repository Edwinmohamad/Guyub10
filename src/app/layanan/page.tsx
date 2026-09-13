"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { submitSurat, getKetuaNames } from "./actions";

type FormDataState = {
  jenis: string;
  namaLengkap: string;
  nik: string;
  lampiran: File | null;
  domisiliRt: string;
  pilihanPengesahan: "rt_saja" | "rt_rw" | "";
  keperluan: string;
};

export default function LayananSuratPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormDataState>({
    jenis: "",
    namaLengkap: "",
    nik: "",
    lampiran: null,
    domisiliRt: "",
    pilihanPengesahan: "",
    keperluan: "",
  });

  // Fetch logo sebagai base64 agar bisa dipakai di PDF renderer
  const [logoBase64, setLogoBase64] = useState<string | undefined>(undefined);
  React.useEffect(() => {
    fetch('/logo-rw.jpg')
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => {/* logo optional */});
  }, []);

  const updateField = <K extends keyof FormDataState>(field: K, value: FormDataState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (step === 1 && !formData.jenis) {
      setErrorMessage("Pilih jenis surat terlebih dahulu.");
      return;
    }
    if (step === 2) {
      if (!formData.namaLengkap) {
        setErrorMessage("Nama lengkap wajib diisi.");
        return;
      }
      if (!formData.nik || formData.nik.length !== 16) {
        setErrorMessage("NIK harus 16 digit angka.");
        return;
      }
    }
    if (step === 3) {
      if (!formData.domisiliRt) {
        setErrorMessage("Pilih domisili RT.");
        return;
      }
      if (!formData.pilihanPengesahan) {
        setErrorMessage("Pilih jenis pengesahan.");
        return;
      }
      if (!formData.keperluan) {
        setErrorMessage("Isi keperluan surat.");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Submit
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Ambil nama ketua RT dan RW
      const names = await getKetuaNames(formData.domisiliRt);

      // 2. Buat PDF
      const [{ pdf }, { default: SuratPengantarPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/SuratPengantarPDF"),
      ]);
      const doc = <SuratPengantarPDF data={{
        nama: formData.namaLengkap,
        nik: formData.nik,
        rt: formData.domisiliRt.replace('RT ', ''),
        keperluan: formData.keperluan,
        jenisSurat: formData.jenis,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        namaKetuaRt: names.namaKetuaRt,
        namaKetuaRw: names.namaKetuaRw,
        jenisPengesahan: formData.pilihanPengesahan as 'rt_saja' | 'rt_rw',
        logoBase64,
      }} />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      
      // 3. Trigger download PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `Surat_Pengantar_${formData.namaLengkap.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 4. Simpan ke database
      const fd = new FormData();
      fd.append("jenis", formData.jenis);
      fd.append("nik", formData.nik);
      if (formData.lampiran) fd.append("lampiran", formData.lampiran);
      fd.append("tujuan", formData.pilihanPengesahan === 'rt_rw' ? 'RW 10' : formData.domisiliRt);
      fd.append("keperluan", formData.keperluan);

      const result = await submitSurat(fd);

      if (result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal membuat PDF. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  const jenisSurat = [
    "Pengantar KTP / KK",
    "Pengantar SKCK",
    "Surat Keterangan Domisili",
    "Surat Keterangan Usaha (SKU)",
    "Surat Keterangan Tidak Mampu (SKTM)",
    "Surat Pengantar Nikah (N1-N4)",
    "Surat Keterangan Kematian",
    "Surat Keterangan Kelahiran",
    "Surat Izin Keramaian",
    "Surat Keterangan Pindah",
    "Surat Keterangan Belum Menikah",
    "Surat Keterangan Ahli Waris",
  ];

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center p-4 bg-background">
        <div className="bg-white p-12 rounded-2xl border border-border max-w-lg w-full text-center shadow-lg">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ fontFamily: "var(--font-bitter)" }}>PDF Berhasil Diunduh!</h1>
          <p className="text-muted-foreground font-medium mb-8">
            Cetak file PDF tersebut, lalu bawa ke rumah Ketua RT untuk meminta <strong>tanda tangan dan stempel basah</strong>.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <button className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all w-full">
                Kembali ke Beranda
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicPageHeader icon={FileText} label="Layanan surat" title="Buat surat pengantar" description="Isi data dalam tiga langkah, unduh PDF, lalu bawa ke pengurus RT atau RW untuk pengesahan." action={{ href: "/layanan/cek", label: "Cek status surat" }} />

      <section className="mx-auto w-full max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <div className="rounded-xl border border-border bg-white p-5 md:p-8">
          
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between mb-2">
              <span className={`text-xs font-bold ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Jenis</span>
              <span className={`text-xs font-bold ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Identitas</span>
              <span className={`text-xs font-bold ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Tujuan</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 text-sm font-bold text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleNext} className="space-y-8">

            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-bitter)" }}>Pilih Jenis Surat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jenisSurat.map(j => (
                    <label key={j} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="jenis" 
                        value={j} 
                        className="peer sr-only" 
                        checked={formData.jenis === j}
                        onChange={() => updateField("jenis", j)}
                      />
                      <div className="bg-muted border-2 border-border p-3 rounded-xl peer-checked:border-primary peer-checked:bg-primary/10 transition-all text-center font-bold text-sm text-foreground">
                        {j}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-bitter)" }}>Verifikasi Identitas</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      value={formData.namaLengkap}
                      onChange={(e) => updateField("namaLengkap", e.target.value)}
                      placeholder="Nama Sesuai KTP"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Nomor Induk Kependudukan (NIK) *</label>
                    <input 
                      type="text" 
                      value={formData.nik}
                      onChange={(e) => updateField("nik", e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="16 Digit Angka NIK"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Unggah Dokumen (KTP/KK) (Opsional)</label>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        updateField("lampiran", file);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {formData.lampiran && (
                      <p className="text-xs text-green-600 mt-1 font-medium">✓ {formData.lampiran.name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-bitter)" }}>Tujuan & Keperluan</h3>
                
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Domisili RT *</label>
                  <select 
                    value={formData.domisiliRt}
                    onChange={(e) => updateField("domisiliRt", e.target.value)}
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                  >
                    <option value="">Pilih RT...</option>
                    <option value="RT 01">RT 01</option>
                    <option value="RT 02">RT 02</option>
                    <option value="RT 03">RT 03</option>
                    <option value="RT 04">RT 04</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Pilihan Pengesahan *</label>
                  <select 
                    value={formData.pilihanPengesahan}
                    onChange={(e) => updateField("pilihanPengesahan", e.target.value as "rt_saja" | "rt_rw" | "")}
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-foreground"
                  >
                    <option value="">Pilih Tujuan Pengesahan...</option>
                    <option value="rt_saja">Hanya Ke RT (Butuh 1 Tanda Tangan)</option>
                    <option value="rt_rw">Ke Kelurahan via RW (Butuh Tanda Tangan RT & RW)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Mengapa Anda membutuhkan surat ini? *</label>
                  <textarea 
                    value={formData.keperluan}
                    onChange={(e) => updateField("keperluan", e.target.value)}
                    rows={4}
                    placeholder="Jelaskan secara singkat keperluan Anda..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium resize-none text-foreground"
                  ></textarea>
                </div>

                {/* Ringkasan */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-xs font-bold text-primary uppercase mb-2">Ringkasan Pengajuan</p>
                  <div className="text-sm text-foreground space-y-1">
                    <p><span className="font-bold">Jenis:</span> {formData.jenis}</p>
                    <p><span className="font-bold">NIK:</span> {formData.nik}</p>
                    {formData.lampiran && <p><span className="font-bold">File:</span> {formData.lampiran.name}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-gray-200 flex justify-between">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center px-6 py-3 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
                </button>
              ) : (
                <div></div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                ) : null}
                {step === 3 ? "Kirim Pengajuan" : "Lanjut"}
                {step !== 3 && !isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  );
}
