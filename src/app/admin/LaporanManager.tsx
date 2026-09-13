"use client";

import { useState } from "react";
import { Wrench, CheckCircle, XCircle, Clock, Search, MapPin } from "lucide-react";
import { updateLaporanStatus } from "./actions";
import Image from "next/image";

type LaporanRow = { id: string; judul?: string; kategori: string; lokasi?: string; deskripsi: string; created_at: string; is_anonim?: boolean; nama_pelapor?: string; rt?: string; foto_url?: string; status: string; balasan_admin?: string };

export function LaporanManager({ laporanList }: { laporanList: LaporanRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  
  const filteredData = laporanList.filter((l) =>
    (l.judul || l.deskripsi).toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.lokasi || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, status: "diproses" | "selesai" | "ditolak", balasan?: string) => {
    setIsSubmitting(id);
    await updateLaporanStatus(id, status, balasan);
    setIsSubmitting(null);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-zinc-200 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-800">Manajemen Laporan Infrastruktur</h3>
            <p className="text-sm text-zinc-500 font-medium">Kelola laporan kerusakan dari warga.</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 font-medium bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            Belum ada laporan yang sesuai dengan pencarian Anda.
          </div>
        ) : (
          filteredData.map((laporan) => (
            <div key={laporan.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      {laporan.kategori}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {new Date(laporan.created_at).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    {laporan.is_anonim ? (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        Anonim
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        Dilaporkan Oleh: {laporan.nama_pelapor} (RT {laporan.rt})
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-zinc-800 mb-2">{laporan.judul}</h4>
                  <p className="text-zinc-600 text-sm mb-3 leading-relaxed">{laporan.deskripsi}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium mb-4">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    {laporan.lokasi}
                  </div>

                  {laporan.foto_url && (
                    <div className="mb-4">
                      <Image src={laporan.foto_url} alt="Foto laporan" width={192} height={128} className="w-48 h-32 object-cover rounded-xl border border-zinc-200" />
                    </div>
                  )}

                  {laporan.status === "masuk" && (
                    <form className="mt-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const balasan = formData.get("balasan_admin") as string;
                        const actionStatus = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).name as "diproses" | "ditolak";
                        handleStatusChange(laporan.id, actionStatus, balasan);
                      }}
                    >
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Tanggapan / Catatan Admin</label>
                      <textarea
                        name="balasan_admin"
                        placeholder="Masukkan tanggapan atas laporan ini..."
                        className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm mb-3"
                        rows={2}
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          name="diproses"
                          disabled={isSubmitting === laporan.id}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <Clock className="w-4 h-4" /> Proses Laporan
                        </button>
                        <button
                          type="submit"
                          name="ditolak"
                          disabled={isSubmitting === laporan.id}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Tolak
                        </button>
                      </div>
                    </form>
                  )}
                  {laporan.status === "diproses" && (
                    <form className="mt-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const balasan = formData.get("balasan_admin") as string;
                        handleStatusChange(laporan.id, "selesai", balasan);
                      }}
                    >
                      <label className="block text-sm font-bold text-zinc-700 mb-2">Update Tanggapan (Opsional)</label>
                      <textarea
                        name="balasan_admin"
                        defaultValue={laporan.balasan_admin || ""}
                        className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm mb-3"
                        rows={2}
                      ></textarea>
                      <button
                        type="submit"
                        disabled={isSubmitting === laporan.id}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" /> Tandai Selesai
                      </button>
                    </form>
                  )}
                </div>
                
                <div className="w-full md:w-48 shrink-0">
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Status Laporan</p>
                    {laporan.status === "masuk" && (
                      <div className="flex items-center gap-2 text-zinc-500 bg-zinc-100 px-3 py-2 rounded-lg font-bold text-sm">
                        Menunggu
                      </div>
                    )}
                    {laporan.status === "diproses" && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg font-bold text-sm">
                        <Clock className="w-4 h-4" /> Diproses
                      </div>
                    )}
                    {laporan.status === "selesai" && (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg font-bold text-sm">
                        <CheckCircle className="w-4 h-4" /> Selesai
                      </div>
                    )}
                    {laporan.status === "ditolak" && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg font-bold text-sm">
                        <XCircle className="w-4 h-4" /> Ditolak
                      </div>
                    )}

                    {laporan.balasan_admin && (
                      <div className="mt-4 pt-4 border-t border-zinc-200">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Catatan Admin:</p>
                        <p className="text-sm text-zinc-700 italic">{laporan.balasan_admin}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
