"use client";

import { useState } from "react";
import { Building2, Plus, Trash2, Edit2, X } from "lucide-react";
import { createFasilitas, updateFasilitas, deleteFasilitas } from "./actions";

type FasilitasRow = { id: string; nama: string; lokasi?: string; jam_operasional?: string; foto_url?: string; deskripsi?: string; cara_peminjaman?: string; bisa_dipinjam: boolean };

function FormFields({ data }: { data?: FasilitasRow }) {
  return <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1"><label className="text-xs font-bold">Nama Fasilitas</label><input type="text" name="nama" defaultValue={data?.nama} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
      <div className="space-y-1"><label className="text-xs font-bold">Lokasi</label><input type="text" name="lokasi" defaultValue={data?.lokasi} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
      <div className="space-y-1"><label className="text-xs font-bold">Jam Operasional</label><input type="text" name="jam_operasional" defaultValue={data?.jam_operasional} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
      <div className="space-y-1"><label className="text-xs font-bold">Foto (Opsional)</label><input type="file" name="foto" accept="image/*" className="w-full p-2 rounded-lg border border-zinc-300 text-sm bg-white" /></div>
    </div>
    <div className="space-y-1 mt-4"><label className="text-xs font-bold">Deskripsi</label><textarea name="deskripsi" defaultValue={data?.deskripsi} rows={2} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
    <div className="space-y-1 mt-4"><label className="text-xs font-bold">Cara Peminjaman</label><textarea name="cara_peminjaman" defaultValue={data?.cara_peminjaman} rows={2} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
    <div className="mt-4 flex items-center gap-2"><input id={`bisa-${data?.id ?? "baru"}`} type="checkbox" name="bisa_dipinjam" value="true" defaultChecked={data?.bisa_dipinjam ?? true} className="w-4 h-4 rounded" /><label htmlFor={`bisa-${data?.id ?? "baru"}`} className="text-sm font-bold">Fasilitas bisa dipinjam oleh warga</label></div>
  </>;
}

export function FasilitasManager({ fasilitasList }: { fasilitasList: FasilitasRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createFasilitas(formData);
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateFasilitas(id, formData);
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Hapus fasilitas ini?")) {
      await deleteFasilitas(id);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-800">Fasilitas & Sarana</h3>
            <p className="text-sm text-zinc-500 font-medium">Data inventaris RW yang bisa diakses warga.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isAdding ? "Batal" : <><Plus className="w-4 h-4"/> Tambah Fasilitas</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-6">
          <h4 className="font-bold mb-4 border-b pb-2">Tambah Fasilitas Baru</h4>
          <form onSubmit={handleAdd}>
            <FormFields />
            <div className="mt-6 flex justify-end">
              <button disabled={isSubmitting} type="submit" className="bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl disabled:opacity-50">
                Simpan Fasilitas
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fasilitasList.length === 0 ? (
          <p className="text-zinc-500 py-4 col-span-2">Belum ada fasilitas terdaftar.</p>
        ) : (
          fasilitasList.map((f) => (
            <div key={f.id} className="border border-zinc-200 rounded-2xl overflow-hidden flex flex-col">
              {editingId === f.id ? (
                <div className="p-4 bg-zinc-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Edit Fasilitas</h4>
                    <button onClick={() => setEditingId(null)} className="p-1"><X className="w-5 h-5"/></button>
                  </div>
                  <form onSubmit={(e) => handleUpdate(e, f.id)}>
                    <FormFields data={f} />
                    <div className="mt-4 flex justify-end">
                      <button disabled={isSubmitting} type="submit" className="bg-primary text-white font-bold px-4 py-2 rounded-lg">Simpan</button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="h-32 bg-zinc-100 bg-cover bg-center" style={{ backgroundImage: f.foto_url ? `url(${f.foto_url})` : 'none' }}>
                    {!f.foto_url && <div className="w-full h-full flex items-center justify-center text-zinc-400 font-medium">No Image</div>}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-lg">{f.nama}</h4>
                    <p className="text-xs text-zinc-500 mb-2">{f.lokasi} • {f.jam_operasional}</p>
                    <p className="text-sm text-zinc-600 line-clamp-2 mb-4 flex-1">{f.deskripsi}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${f.bisa_dipinjam ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {f.bisa_dipinjam ? 'Bisa Dipinjam' : 'Hanya Fasilitas'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(f.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(f.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
