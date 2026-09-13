"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { createKegiatan, updateKegiatan, deleteKegiatan } from "./actions";

interface Kegiatan {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  kategori: string;
  penyelenggara?: string;
  penyelenggara_type?: string;
  penyelenggara_id?: string;
  foto_url?: string;
}

export default function KegiatanManager({ data }: { data: Kegiatan[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingData, setEditingData] = useState<Kegiatan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTanggal = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenNew = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (kegiatan: Kegiatan) => {
    setEditingData(kegiatan);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      startTransition(async () => {
        const result = await deleteKegiatan(id);
        if (!result.success) alert(result.error);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let result;
      if (editingData) {
        result = await updateKegiatan(editingData.id, formData);
      } else {
        result = await createKegiatan(formData);
      }

      if (result.success) {
        setIsModalOpen(false);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-bitter)" }}>Agenda Kegiatan</h2>
          <p className="text-sm text-muted-foreground">Kelola jadwal kegiatan warga seperti Posyandu, Kerja Bakti, dll.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Tambah Kegiatan
        </button>
      </div>

      <div className="divide-y divide-border">
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Belum ada kegiatan yang ditambahkan.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    {item.kategori}
                  </span>
                  {item.penyelenggara && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {item.penyelenggara}
                    </span>
                  )}
                </div>
                {item.foto_url && (
                  <Image src={item.foto_url} alt={item.judul} width={320} height={128} className="w-full h-32 md:w-32 object-cover rounded-lg mb-3 md:mb-0 md:float-left md:mr-4 border border-border" />
                )}
                <h3 className="font-bold text-foreground">{item.judul}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.deskripsi}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatTanggal(item.tanggal)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.lokasi}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={isPending}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border bg-slate-50">
              <h3 className="font-bold text-lg">{editingData ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Judul Kegiatan</label>
                  <input
                    name="judul"
                    defaultValue={editingData?.judul}
                    required
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Gambar / Poster Kegiatan (Opsional)</label>
                  <input
                    type="file"
                    name="foto"
                    accept="image/*"
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {editingData?.foto_url && (
                    <p className="text-xs text-muted-foreground mt-2">Gambar saat ini sudah tersimpan. Upload gambar baru untuk mengganti.</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Kategori</label>
                    <select
                      name="kategori"
                      defaultValue={editingData?.kategori || "Pengajian"}
                      className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      <option value="Pengajian">Pengajian</option>
                      <option value="Kerja Bakti">Kerja Bakti</option>
                      <option value="Posyandu">Posyandu</option>
                      <option value="Karang Taruna">Karang Taruna</option>
                      <option value="Rapat">Rapat</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Nama Penyelenggara</label>
                    <select
                      name="penyelenggara"
                      defaultValue={editingData?.penyelenggara || "Pengurus RW"}
                      className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      <option value="Pengurus RW">Pengurus RW</option>
                      <option value="RT 01">RT 01</option>
                      <option value="RT 02">RT 02</option>
                      <option value="RT 03">RT 03</option>
                      <option value="RT 04">RT 04</option>
                      <option value="Karang Taruna">Karang Taruna</option>
                      <option value="PKK">PKK</option>
                      <option value="Posyandu">Posyandu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Tipe Entitas</label>
                    <select
                      name="penyelenggara_type"
                      defaultValue={editingData?.penyelenggara_type || "RW"}
                      className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      <option value="RW">RW (Umum)</option>
                      <option value="RT">RT</option>
                      <option value="Lembaga">Lembaga</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">ID Entitas</label>
                    <input
                      name="penyelenggara_id"
                      defaultValue={editingData?.penyelenggara_id || "RW"}
                      placeholder="Contoh: 01, PKK, RW"
                      className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Tanggal & Waktu</label>
                    {/* Hati-hati dengan default value datetime-local, butuh format YYYY-MM-DDThh:mm */}
                    <input
                      type="datetime-local"
                      name="tanggal"
                      defaultValue={editingData ? new Date(editingData.tanggal).toISOString().slice(0,16) : ""}
                      required
                      className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Lokasi</label>
                    <input
                      name="lokasi"
                      defaultValue={editingData?.lokasi}
                      required
                      className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    defaultValue={editingData?.deskripsi}
                    required
                    rows={3}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Kegiatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
