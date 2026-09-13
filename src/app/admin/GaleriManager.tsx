"use client";

import { useState } from "react";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { createGaleri, deleteGaleri } from "./actions";
import Image from "next/image";

type GaleriRow = { id: string; foto_url: string; judul: string; album?: string };

export function GaleriManager({ galeriList }: { galeriList: GaleriRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createGaleri(formData);
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Hapus foto ini dari galeri?")) {
      await deleteGaleri(id);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-pink-100 p-3 rounded-xl text-pink-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-800">Galeri Foto</h3>
            <p className="text-sm text-zinc-500 font-medium">Upload dokumentasi kegiatan RW.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isAdding ? "Batal" : <><Plus className="w-4 h-4"/> Upload Foto</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold">Judul Foto</label>
                <input type="text" name="judul" required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold">Kategori/Album</label>
                <select name="album" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm">
                  <option value="kegiatan">Kegiatan Warga</option>
                  <option value="infrastruktur">Infrastruktur & Lingkungan</option>
                  <option value="perayaan">Perayaan & Event</option>
                  <option value="umum">Umum</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Deskripsi Singkat</label>
              <textarea name="deskripsi" rows={2} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm"></textarea>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Pilih Foto</label>
              <input type="file" name="foto" required accept="image/*" className="w-full p-2 rounded-lg border border-zinc-300 text-sm bg-white" />
            </div>
            <div className="mt-4 flex justify-end">
              <button disabled={isSubmitting} type="submit" className="bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl disabled:opacity-50">
                {isSubmitting ? "Mengunggah..." : "Upload Foto"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galeriList.length === 0 ? (
          <p className="text-zinc-500 py-4 col-span-full">Belum ada foto di galeri.</p>
        ) : (
          galeriList.map((g) => (
            <div key={g.id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 aspect-square bg-zinc-100">
              <Image src={g.foto_url} alt={g.judul} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded uppercase font-bold w-fit mb-1">{g.album}</span>
                <h4 className="text-white font-bold text-sm line-clamp-1">{g.judul}</h4>
                <button 
                  onClick={() => handleDelete(g.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
