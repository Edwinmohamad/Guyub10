"use client";

import { useState } from "react";
import { Building } from "lucide-react";
import { updateLembaga } from "./actions";

type LembagaRow = { id: string; nama: string; ketua_nama?: string; ketua_wa?: string; deskripsi?: string; program_kerja?: string };

export function LembagaEditor({ lembagaList }: { lembagaList: LembagaRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateLembaga(id, formData);
    setEditingId(null);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-zinc-800">Manajemen Lembaga & RT</h3>
          <p className="text-sm text-zinc-500 font-medium">Edit data kepengurusan tiap RT dan kelembagaan.</p>
        </div>
      </div>

      <div className="space-y-4">
        {lembagaList.map((l) => (
          <div key={l.id} className="border border-zinc-200 rounded-2xl overflow-hidden transition-all">
            {/* Header / Summary */}
            <div className="bg-zinc-50 p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-zinc-800">{l.nama}</h4>
                <p className="text-sm text-zinc-500">Ketua: {l.ketua_nama || '-'}</p>
              </div>
              <button 
                onClick={() => setEditingId(editingId === l.id ? null : l.id)}
                className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-100"
              >
                {editingId === l.id ? "Batal Edit" : "Edit Data"}
              </button>
            </div>

            {/* Edit Form */}
            {editingId === l.id && (
              <div className="p-4 bg-white border-t border-zinc-200">
                <form onSubmit={(e) => handleUpdate(e, l.id)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Nama Lembaga / RT</label>
                      <input type="text" name="nama" defaultValue={l.nama} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Nama Ketua</label>
                      <input type="text" name="ketua_nama" defaultValue={l.ketua_nama} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">No WA Ketua</label>
                      <input type="text" name="ketua_wa" defaultValue={l.ketua_wa} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700">Foto Ketua (Opsional)</label>
                      <input type="file" name="ketua_foto" accept="image/*" className="w-full p-2 rounded-lg border border-zinc-300 bg-zinc-50 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Deskripsi Singkat</label>
                    <textarea name="deskripsi" defaultValue={l.deskripsi} rows={2} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm"></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Program Kerja (Pisahkan dengan koma atau baris baru)</label>
                    <textarea name="program_kerja" defaultValue={l.program_kerja} rows={3} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm"></textarea>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50">
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
