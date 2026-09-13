"use client";

import { useState } from "react";
import { DollarSign, Plus, Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { createKas, updateKas, deleteKas } from "./actions";

type KasRow = { id: string; tanggal: string; jenis: string; jumlah: number; kategori: string; entitas_type: string; entitas_id: string; keterangan: string };

function FormFields({ data }: { data?: KasRow }) {
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="space-y-1"><label className="text-xs font-bold">Tanggal</label><input type="date" name="tanggal" defaultValue={data?.tanggal} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
    <div className="space-y-1"><label className="text-xs font-bold">Jenis</label><select name="jenis" defaultValue={data?.jenis || "masuk"} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm font-bold"><option value="masuk">Pemasukan (Masuk)</option><option value="keluar">Pengeluaran (Keluar)</option></select></div>
    <div className="space-y-1"><label className="text-xs font-bold">Nominal (Rp)</label><input type="number" name="jumlah" defaultValue={data?.jumlah} required min="1" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm font-mono" /></div>
    <div className="space-y-1"><label className="text-xs font-bold">Kategori</label><input type="text" name="kategori" defaultValue={data?.kategori || "Iuran Warga"} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
    <div className="space-y-1"><label className="text-xs font-bold">Milik Entitas</label><select name="entitas_type" defaultValue={data?.entitas_type || "RW"} required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm font-bold"><option value="RW">Kas RW Utama</option><option value="RT">Kas RT Khusus</option><option value="Lembaga">Kas Lembaga Khusus</option></select></div>
    <div className="space-y-1"><label className="text-xs font-bold">ID Entitas (Jika RT/Lembaga)</label><input type="text" name="entitas_id" defaultValue={data?.entitas_id || "RW"} required placeholder="Contoh: 01, PKK, RW" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
    <div className="md:col-span-2 space-y-1"><label className="text-xs font-bold">Keterangan / Uraian</label><input type="text" name="keterangan" defaultValue={data?.keterangan} required placeholder="Contoh: Iuran kebersihan RT 01 bulan Mei" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" /></div>
  </div>;
}

export function KasManager({ kasList }: { kasList: KasRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createKas(formData);
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await updateKas(id, formData);
    setEditingId(null);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Hapus catatan kas ini? Data yang terhapus akan mengubah total saldo.")) {
      await deleteKas(id);
    }
  };

  // Kalkulasi total
  const totalMasuk = kasList.filter(k => k.jenis === 'masuk').reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = kasList.filter(k => k.jenis === 'keluar').reduce((acc, curr) => acc + curr.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-6">
      {/* Cards Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary text-white p-6 rounded-3xl shadow-sm">
          <p className="text-sm font-medium text-blue-100 mb-1">Total Saldo Kas RW</p>
          <h3 className="text-3xl font-black font-mono tracking-tight">{formatRp(saldo)}</h3>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">Total Pemasukan</p>
            <h3 className="text-2xl font-black text-emerald-700 font-mono">{formatRp(totalMasuk)}</h3>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full"><TrendingUp className="text-emerald-600 w-6 h-6"/></div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-rose-600 mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-black text-rose-700 font-mono">{formatRp(totalKeluar)}</h3>
          </div>
          <div className="bg-rose-100 p-3 rounded-full"><TrendingDown className="text-rose-600 w-6 h-6"/></div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-800">Buku Kas RW</h3>
              <p className="text-sm text-zinc-500 font-medium">Catat dan kelola transparansi keuangan warga.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            {isAdding ? "Batal" : <><Plus className="w-4 h-4"/> Tambah Entri Kas</>}
          </button>
        </div>

        {isAdding && (
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-6">
            <h4 className="font-bold mb-4 border-b pb-2">Entri Kas Baru</h4>
            <form onSubmit={handleAdd}>
              <FormFields />
              <div className="mt-6 flex justify-end">
                <button disabled={isSubmitting} type="submit" className="bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-50">
                  Simpan ke Buku Kas
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Kas */}
        <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Uraian</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Milik</th>
                <th className="px-4 py-3 text-right">Pemasukan</th>
                <th className="px-4 py-3 text-right">Pengeluaran</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {kasList.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Buku kas masih kosong.</td></tr>
              ) : (
                kasList.map((k) => (
                  editingId === k.id ? (
                    <tr key={k.id} className="bg-zinc-50">
                      <td colSpan={6} className="p-4">
                        <form onSubmit={(e) => handleUpdate(e, k.id)}>
                          <FormFields data={k} />
                          <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-zinc-200 rounded-lg font-bold">Batal</button>
                            <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold">Simpan Update</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={k.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{new Date(k.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 font-medium">{k.keterangan}</td>
                      <td className="px-4 py-3"><span className="bg-zinc-100 px-2 py-1 rounded text-xs text-zinc-600 font-medium uppercase">{k.kategori}</span></td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-700 font-bold uppercase">{k.entitas_type} {k.entitas_id !== 'RW' ? k.entitas_id : ''}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                        {k.jenis === 'masuk' ? formatRp(k.jumlah) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                        {k.jenis === 'keluar' ? formatRp(k.jumlah) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setEditingId(k.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(k.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
