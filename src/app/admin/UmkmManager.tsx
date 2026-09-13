"use client";

import { useState, useTransition } from "react";
import { Store, Check, X, Trash2, Edit2, MapPin, Printer } from "lucide-react";
import { updateUmkmStatus, deleteUmkm, updateUmkmLengkap } from "./actions";

type UmkmRow = { id: string; nama_usaha: string; kategori: string; nomor_wa: string; alamat?: string; jam_buka?: string; deskripsi: string; is_approved: boolean; nama_pemilik?: string; profiles?: { nama_lengkap?: string; rt?: string } | { nama_lengkap?: string; rt?: string }[] };

export function UmkmManager({ umkmList }: { umkmList: UmkmRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusUpdate = async (id: string, is_approved: boolean) => {
    startTransition(async () => {
      await updateUmkmStatus(id, is_approved);
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateUmkmLengkap(id, formData);
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus UMKM ini?")) {
      startTransition(async () => {
        await deleteUmkm(id);
      });
    }
  };

  const profileOf = (row: UmkmRow) => Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-zinc-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Store className="w-5 h-5 text-emerald-500" />
        <h3 className="text-xl font-black text-zinc-800">Verifikasi UMKM Warga</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-zinc-100 text-sm font-bold text-zinc-400">
              <th className="pb-3 w-1/4">Usaha & Kategori</th>
              <th className="pb-3 w-1/4">Pemilik (RT)</th>
              <th className="pb-3 w-1/4">Kontak & Deskripsi</th>
              <th className="pb-3 w-1/4">Status & Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {umkmList.map((u) => (
              editingId === u.id ? (
                <tr key={u.id} className="border-b border-zinc-200 bg-zinc-50">
                  <td colSpan={4} className="p-4 md:p-6">
                    <form onSubmit={(e) => handleUpdate(e, u.id)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Nama Usaha</label>
                          <input type="text" name="nama_usaha" defaultValue={u.nama_usaha} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Kategori</label>
                          <select name="kategori" defaultValue={u.kategori} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm">
                            <option value="Kuliner">Kuliner</option>
                            <option value="Jasa">Jasa</option>
                            <option value="Retail">Retail / Warung</option>
                            <option value="Fashion">Fashion & Kerajinan</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Nomor WA</label>
                          <input type="text" name="nomor_wa" defaultValue={u.nomor_wa} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Foto Tempat Usaha (Opsional)</label>
                          <input type="file" name="foto" accept="image/*" className="w-full p-2 rounded-lg border border-zinc-300 text-sm bg-white" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold">Alamat / Patokan</label>
                          <input type="text" name="alamat" defaultValue={u.alamat} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold">Jam Buka - Tutup</label>
                          <input type="text" name="jam_buka" defaultValue={u.jam_buka} placeholder="Contoh: Senin-Sabtu, 08:00 - 17:00" required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-bold">Deskripsi Usaha</label>
                          <textarea name="deskripsi" defaultValue={u.deskripsi} required rows={2} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm"></textarea>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-200">
                        <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-200 hover:bg-zinc-300 rounded-lg transition-colors">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">Simpan Perubahan</button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
              <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                <td className="py-4 pr-4">
                  <div className="font-bold text-zinc-800 text-base">{u.nama_usaha}</div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    {u.kategori}
                  </div>
                </td>
                <td className="py-4 pr-4 text-zinc-600">
                  <div className="font-bold text-zinc-800">{profileOf(u)?.nama_lengkap || u.nama_pemilik || "Tanpa Nama"}</div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                    <MapPin className="w-3 h-3" /> RT {profileOf(u)?.rt || "-"}
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <div className="text-zinc-600 text-xs mb-1 line-clamp-2">{u.deskripsi}</div>
                  <div className="font-bold text-emerald-600 text-xs">WA: {u.nomor_wa}</div>
                </td>
                <td className="py-4">
                  {u.is_approved ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 w-fit">
                        <Check className="w-3.5 h-3.5" /> Disetujui
                      </span>
                      <a
                        href={`/sertifikat/umkm/${u.id}`}
                        target="_blank"
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        title="Cetak Sertifikat"
                      >
                        <Printer className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setEditingId(u.id)}
                        disabled={isPending}
                        className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        title="Edit UMKM"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(u.id, false)}
                        disabled={isPending}
                        className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50"
                        title="Cabut Izin"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={isPending}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Hapus Permanen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 w-fit">
                        Pending
                      </span>
                      <button
                        onClick={() => setEditingId(u.id)}
                        disabled={isPending}
                        className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        title="Edit UMKM"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(u.id, true)}
                        disabled={isPending}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        title="Setujui"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={isPending}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Tolak / Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              )
            ))}
            {umkmList.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500">
                  Tidak ada pendaftaran UMKM saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
