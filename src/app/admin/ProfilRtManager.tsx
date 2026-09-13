"use client";

import { useState, useTransition } from "react";
import { updateProfilRt } from "./actions";
import { Edit2, Users, Save, X } from "lucide-react";
import Image from "next/image";

type ProfilRtRow = { no_rt: string; ketua_nama?: string; ketua_foto_url?: string; kontak?: string; sambutan?: string; visi_misi?: string };

export function ProfilRtManager({ data }: { data: ProfilRtRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingRt, setEditingRt] = useState<string | null>(null);

  const rtList = ['01', '02', '03', '04'];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, no_rt: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfilRt(no_rt, formData);
      if (res.success) {
        setEditingRt(null);
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-slate-50/50 flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-bitter)" }}>Profil RT</h2>
          <p className="text-sm text-muted-foreground">Kelola informasi ketua dan profil masing-masing RT (01 - 04).</p>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rtList.map((no_rt) => {
            const rtData: ProfilRtRow = data.find(d => d.no_rt === no_rt) || { no_rt };
            const isEditing = editingRt === no_rt;

            return (
              <div key={no_rt} className="border border-border rounded-xl overflow-hidden bg-white hover:border-primary/30 transition-colors">
                <div className="bg-slate-50 border-b border-border p-3 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">RT {no_rt}</h3>
                  {!isEditing && (
                    <button onClick={() => setEditingRt(no_rt)} className="text-xs flex items-center gap-1 text-primary hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">
                      <Edit2 className="w-3 h-3" /> Edit Profil
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={(e) => handleSubmit(e, no_rt)} className="p-4 space-y-3 bg-blue-50/30">
                    <div>
                      <label className="text-xs font-bold block mb-1">Nama Ketua RT</label>
                      <input name="ketua_nama" defaultValue={rtData.ketua_nama} required className="w-full text-sm border rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Foto Ketua RT</label>
                      <input type="file" name="foto" accept="image/*" className="w-full text-xs" />
                      {rtData.ketua_foto_url && <p className="text-[10px] text-slate-500 mt-1">Foto sudah ada, upload untuk mengganti.</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">No. WhatsApp</label>
                      <input name="kontak" defaultValue={rtData.kontak} placeholder="08..." className="w-full text-sm border rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Sambutan Singkat</label>
                      <textarea name="sambutan" defaultValue={rtData.sambutan} rows={2} className="w-full text-sm border rounded-lg p-2" />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Visi Misi</label>
                      <textarea name="visi_misi" defaultValue={rtData.visi_misi} rows={2} className="w-full text-sm border rounded-lg p-2" />
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" onClick={() => setEditingRt(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
                        <X className="w-3 h-3" /> Batal
                      </button>
                      <button type="submit" disabled={isPending} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <Save className="w-3 h-3" /> {isPending ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 flex gap-4">
                    {rtData.ketua_foto_url ? (
                      <Image src={rtData.ketua_foto_url} alt={rtData.ketua_nama || `Ketua RT ${no_rt}`} width={64} height={64} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800">{rtData.ketua_nama || "Belum diset"}</p>
                      <p className="text-xs text-slate-500 font-semibold mb-2">Ketua RT {no_rt}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{rtData.sambutan || rtData.visi_misi || "Belum ada informasi profil."}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
