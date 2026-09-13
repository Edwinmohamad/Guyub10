"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2, Plus, X, Loader2, Megaphone } from "lucide-react";
import { createPengumuman, deletePengumuman, updatePengumuman } from "./actions";

interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  kategori: string;
  penyelenggara?: string;
  foto_url?: string;
  created_at: string;
}

const KATEGORIS = ["Pengumuman", "Penting", "Laporan Kas", "Kegiatan", "Kesehatan", "Keamanan", "Infrastruktur", "Ekonomi Warga"];
const PENYELENGGARA = ["Pengurus RW", "RT 01", "RT 02", "RT 03", "RT 04", "Karang Taruna", "PKK", "Posyandu"];

function PengumumanModal({
  mode,
  data,
  onClose,
}: {
  mode: "create" | "edit";
  data?: Pengumuman;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const result = mode === "create"
        ? await createPengumuman(formData)
        : await updatePengumuman(data!.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h3 className="text-xl font-black text-zinc-800">
            {mode === "create" ? "Tambah Berita Warga Baru" : "Edit Berita"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1.5">Judul Berita</label>
            <input
              name="judul"
              defaultValue={data?.judul}
              required
              placeholder="Judul berita..."
              className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1.5">Gambar / Foto (Opsional)</label>
            <input
              type="file"
              name="foto"
              accept="image/*"
              className="w-full px-4 py-2 border-2 border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {data?.foto_url && (
              <p className="text-xs text-zinc-500 mt-2">Gambar saat ini sudah tersimpan. Upload gambar baru untuk mengganti.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Kategori</label>
              <select
                name="kategori"
                defaultValue={data?.kategori ?? "Pengumuman"}
                required
                className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {KATEGORIS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1.5">Penyelenggara</label>
              <select
                name="penyelenggara"
                defaultValue={data?.penyelenggara ?? "Pengurus RW"}
                required
                className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                {PENYELENGGARA.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1.5">Isi Berita Warga</label>
            <textarea
              name="konten"
              defaultValue={data?.konten}
              required
              rows={5}
              placeholder="Tulis isi berita di sini..."
              className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "create" ? "Simpan" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PengumumanManager({ pengumumanList }: { pengumumanList: Pengumuman[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editData, setEditData] = useState<Pengumuman | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    setDeleteId(id);
    startTransition(async () => {
      await deletePengumuman(id);
      setDeleteId(null);
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      {showCreate && <PengumumanModal mode="create" onClose={() => setShowCreate(false)} />}
      {editData && <PengumumanModal mode="edit" data={editData} onClose={() => setEditData(null)} />}

      <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-zinc-800 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-500" />
            Manajemen Berita Warga
          </h3>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Baru
          </button>
        </div>

        {pengumumanList.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 font-medium">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada berita warga. Tambahkan yang pertama!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pengumumanList.map((p) => (
              <div key={p.id} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-colors group">
                {p.foto_url && (
                  <Image src={p.foto_url} alt={p.judul} width={80} height={80} className="w-20 h-20 object-cover rounded-xl shadow-sm border border-zinc-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{p.kategori}</span>
                    {p.penyelenggara && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{p.penyelenggara}</span>
                    )}
                    <span className="text-xs text-zinc-400">{formatDate(p.created_at)}</span>
                  </div>
                  <p className="font-bold text-zinc-800 truncate">{p.judul}</p>
                  <p className="text-sm text-zinc-500 line-clamp-1 mt-0.5">{p.konten}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditData(p)}
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={isPending && deleteId === p.id}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors disabled:opacity-60"
                    title="Hapus"
                  >
                    {isPending && deleteId === p.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
