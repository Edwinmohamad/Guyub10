"use client";

import { useState } from "react";
import { Type, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { createTicker, updateTicker, deleteTicker } from "./actions";

type TickerRow = { id: string; konten: string; urutan: number; aktif: boolean };

export function TickerManager({ tickerList }: { tickerList: TickerRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createTicker(formData);
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateTicker(id, formData);
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Yakin ingin menghapus ticker ini?")) {
      await deleteTicker(id);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-800">Running Text (Ticker)</h3>
            <p className="text-sm text-zinc-500 font-medium">Kelola teks berjalan di bagian atas Beranda.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isAdding ? "Batal" : <><Plus className="w-4 h-4"/> Tambah Ticker</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 mb-6">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-zinc-700">Konten Text (Gunakan emoji agar menarik)</label>
              <input type="text" name="konten" required placeholder="Contoh: 🚨 Info: Kerja Bakti hari minggu..." className="w-full p-2.5 rounded-lg border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm" />
            </div>
            <div className="w-24 space-y-1">
              <label className="text-xs font-bold text-zinc-700">Urutan</label>
              <input type="number" name="urutan" defaultValue="0" required className="w-full p-2.5 rounded-lg border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm" />
            </div>
            <button disabled={isSubmitting} type="submit" className="bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50">
              Simpan
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {tickerList.length === 0 ? (
          <p className="text-center text-zinc-500 py-4">Belum ada ticker.</p>
        ) : (
          tickerList.map((t) => (
            <div key={t.id} className="p-4 rounded-2xl border border-zinc-200 hover:border-primary/50 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
              {editingId === t.id ? (
                <form onSubmit={(e) => handleUpdate(e, t.id)} className="flex-1 flex flex-col md:flex-row gap-3 items-center w-full">
                  <input type="text" name="konten" defaultValue={t.konten} required className="flex-1 w-full p-2 rounded-lg border border-zinc-300 text-sm" />
                  <input type="number" name="urutan" defaultValue={t.urutan} required className="w-20 p-2 rounded-lg border border-zinc-300 text-sm" />
                  <select name="aktif" defaultValue={t.aktif.toString()} className="p-2 rounded-lg border border-zinc-300 text-sm">
                    <option value="true">Aktif</option>
                    <option value="false">Mati</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" disabled={isSubmitting} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Check className="w-4 h-4"/></button>
                    <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-zinc-100 text-zinc-600 rounded-lg"><X className="w-4 h-4"/></button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${t.aktif ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs font-bold text-zinc-500 uppercase">Urutan: {t.urutan}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-800">{t.konten}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingId(t.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
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
