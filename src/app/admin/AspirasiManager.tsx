"use client";

import { useState } from "react";
import { MessageSquare, Trash2, CheckCircle2 } from "lucide-react";
import { updateAspirasi, deleteAspirasi } from "./actions";

type AspirasiRow = { id: string; created_at: string; status: string; kategori: string; nama?: string; pesan: string; balasan_admin?: string };

export function AspirasiManager({ aspirasiList }: { aspirasiList: AspirasiRow[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateAspirasi(id, formData);
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Hapus aspirasi ini?")) {
      await deleteAspirasi(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'diproses': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-zinc-800">Aspirasi & Laporan Warga</h3>
          <p className="text-sm text-zinc-500 font-medium">Tanggapi keluhan, saran, dan masukan dari warga.</p>
        </div>
      </div>

      <div className="space-y-4">
        {aspirasiList.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">Belum ada aspirasi masuk.</p>
        ) : (
          aspirasiList.map((a) => (
            <div key={a.id} className="border border-zinc-200 rounded-2xl overflow-hidden transition-all">
              <div className="p-4 bg-white flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-zinc-500">{new Date(a.created_at).toLocaleDateString('id-ID')}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColor(a.status)}`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded uppercase font-bold">
                      {a.kategori}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-800 mb-1">Dari: {a.nama || 'Anonim'}</h4>
                  <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100 mt-2">
                    &ldquo;{a.pesan}&rdquo;
                  </p>
                  
                  {a.balasan_admin && editingId !== a.id && (
                    <div className="mt-3 pl-4 border-l-2 border-primary">
                      <p className="text-xs font-bold text-primary mb-1">Balasan Admin:</p>
                      <p className="text-sm text-zinc-700">{a.balasan_admin}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col items-center justify-end md:justify-start gap-2 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-4 min-w-[120px]">
                  {editingId === a.id ? (
                    <button onClick={() => setEditingId(null)} className="w-full text-xs font-bold px-3 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200">
                      Batal
                    </button>
                  ) : (
                    <button onClick={() => setEditingId(a.id)} className="w-full text-xs font-bold px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tanggapi
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="w-full text-xs font-bold px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>

              {editingId === a.id && (
                <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                  <form onSubmit={(e) => handleUpdate(e, a.id)} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Status Aspirasi</label>
                      <select name="status" defaultValue={a.status} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm font-bold">
                        <option value="masuk">Masuk (Belum diproses)</option>
                        <option value="diproses">Sedang Diproses</option>
                        <option value="selesai">Selesai / Ditanggapi</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Balasan / Tanggapan Admin</label>
                      <textarea name="balasan_admin" defaultValue={a.balasan_admin} rows={3} placeholder="Tuliskan tanggapan Anda di sini..." className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm"></textarea>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button disabled={isSubmitting} type="submit" className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50">
                        Simpan Tanggapan
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
