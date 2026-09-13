"use client";

import { useState } from "react";
import { Search, FileText, CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { cekStatusSurat } from "./actions";

type SuratStatus = {
  status: string;
  jenis_surat: string;
  catatan_admin?: string;
  pdf_url?: string;
  created_at: string;
  profiles?: { nama_lengkap: string } | { nama_lengkap: string }[];
};

export default function CekStatusForm() {
  const [nomorTiket, setNomorTiket] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SuratStatus | null>(null);

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorTiket.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    const res = await cekStatusSurat(nomorTiket);

    if (res.error || !res.data) {
      setError(res.error || "Data surat tidak ditemukan.");
    } else {
      setResult(res.data);
    }

    setIsLoading(false);
  };

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <form onSubmit={handleCek} className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            value={nomorTiket}
            onChange={(e) => setNomorTiket(e.target.value)}
            placeholder="Masukkan Nomor Tiket (Contoh: TKT-12345)" 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-muted focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold uppercase tracking-wider"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading || !nomorTiket.trim()}
          className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          {isLoading ? "Mencari..." : "Cek Status"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-3xl text-center font-medium shadow-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3 opacity-50" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          {/* Background Glow based on status */}
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] -z-10 rounded-full opacity-30 ${
            result.status === 'selesai' ? 'bg-green-500' :
            result.status === 'diproses' ? 'bg-amber-500' :
            result.status === 'ditolak' ? 'bg-red-500' : 'bg-blue-500'
          }`}></div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Pemohon</p>
                <h3 className="text-xl font-black text-foreground">{Array.isArray(result.profiles) ? result.profiles[0]?.nama_lengkap : result.profiles?.nama_lengkap}</h3>
              </div>
              
              <div>
                <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Jenis Layanan</p>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <p className="text-lg font-bold">{result.jenis_surat}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">Tanggal Pengajuan</p>
                <p className="font-medium text-foreground">{formatTanggal(result.created_at)}</p>
              </div>

              {result.catatan_admin && (
                <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                  <p className="text-sm font-bold text-muted-foreground mb-1">Catatan dari Admin:</p>
                  <p className="font-medium text-sm leading-relaxed">{result.catatan_admin}</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-64 bg-background border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center shrink-0 shadow-inner">
              <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Status Terkini</p>
              
              {result.status === 'selesai' && (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-green-700 mb-2">Selesai</h4>
                  <p className="text-sm font-medium text-muted-foreground mb-6">Surat Anda telah selesai diproses.</p>
                  
                  {result.pdf_url ? (
                    <a 
                      href={result.pdf_url} 
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-primary text-primary-foreground font-bold px-4 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Unduh Surat
                    </a>
                  ) : (
                    <p className="text-xs text-amber-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">Surat fisik dapat diambil di sekretariat RW.</p>
                  )}
                </>
              )}

              {result.status === 'diproses' && (
                <>
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                    <Clock className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-amber-700 mb-2">Diproses</h4>
                  <p className="text-sm font-medium text-muted-foreground">Sedang ditandatangani oleh Ketua RT/RW.</p>
                </>
              )}

              {result.status === 'pending' && (
                <>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-blue-700 mb-2">Menunggu</h4>
                  <p className="text-sm font-medium text-muted-foreground">Menunggu konfirmasi admin.</p>
                </>
              )}

              {result.status === 'ditolak' && (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-red-700 mb-2">Ditolak</h4>
                  <p className="text-sm font-medium text-muted-foreground">Silakan cek catatan admin untuk detail perbaikan.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
