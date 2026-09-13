"use client";

import { useState } from "react";
import { Landmark, Save, MapPin } from "lucide-react";
import { updateProfilRw } from "./actions";

type ProfilRwData = {
  ketua_nama?: string; ketua_wa?: string; wa_rw?: string; nomor_darurat?: string;
  ketua_sambutan?: string; ketua_foto_url?: string; sekretaris_nama?: string;
  sekretaris_wa?: string; bendahara_nama?: string; bendahara_wa?: string;
  visi?: string; misi?: string[]; sejarah?: string; jumlah_warga?: number;
  jumlah_kk?: number; jumlah_rt?: number; jumlah_masjid?: number;
  maps_embed_url?: string; password_warga?: string; hero_foto_url?: string;
  wa_rt1?: string; wa_rt2?: string; wa_rt3?: string; wa_rt4?: string;
  info_penting_kegiatan?: string;
};

export function ProfilRwEditor({ data }: { data: ProfilRwData | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const result = await updateProfilRw(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Profil RW berhasil diperbarui!" });
    }
    setIsSubmitting(false);
  };

  if (!data) return <div>Data tidak ditemukan. Silakan jalankan seed database.</div>;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
          <Landmark className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-zinc-800">Profil RW 10</h3>
          <p className="text-sm text-zinc-500 font-medium">Informasi utama wilayah, visi misi, dan kepengurusan.</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Seksi Kepengurusan */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg border-b pb-2">Kepengurusan Harian</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Nama Ketua RW</label>
              <input type="text" name="ketua_nama" defaultValue={data.ketua_nama} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Ketua RW</label>
              <input type="text" name="ketua_wa" defaultValue={data.ketua_wa} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Pelayanan RW (Admin Utama)</label>
              <input type="text" name="wa_rw" defaultValue={data.wa_rw} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. Darurat (Ambulans/Polisi)</label>
              <input type="text" name="nomor_darurat" defaultValue={data.nomor_darurat} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Teks Sambutan Ketua RW</label>
            <textarea name="ketua_sambutan" defaultValue={data.ketua_sambutan} rows={3} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Foto Ketua RW (Opsional)</label>
            <input type="file" name="ketua_foto" accept="image/*" className="w-full p-3 rounded-xl border border-zinc-300 bg-zinc-50" />
            {data.ketua_foto_url && <p className="text-xs text-blue-600 font-medium">Foto saat ini sudah terpasang.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Nama Sekretaris</label>
              <input type="text" name="sekretaris_nama" defaultValue={data.sekretaris_nama} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Sekretaris</label>
              <input type="text" name="sekretaris_wa" defaultValue={data.sekretaris_wa} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Nama Bendahara</label>
              <input type="text" name="bendahara_nama" defaultValue={data.bendahara_nama} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Bendahara</label>
              <input type="text" name="bendahara_wa" defaultValue={data.bendahara_wa} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Seksi Visi Misi */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg border-b pb-2">Visi & Misi</h4>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Visi</label>
            <textarea name="visi" defaultValue={data.visi} rows={2} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Misi (Pisahkan dengan baris baru / enter)</label>
            <textarea name="misi" defaultValue={data.misi?.join("\n")} rows={6} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">Sejarah Singkat</label>
            <textarea name="sejarah" defaultValue={data.sejarah} rows={4} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
          </div>
        </div>

        {/* Seksi Statistik */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg border-b pb-2">Statistik Wilayah</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Jml Warga</label>
              <input type="number" name="jumlah_warga" defaultValue={data.jumlah_warga} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Jml KK</label>
              <input type="number" name="jumlah_kk" defaultValue={data.jumlah_kk} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Jml RT</label>
              <input type="number" name="jumlah_rt" defaultValue={data.jumlah_rt} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Jml Masjid</label>
              <input type="number" name="jumlah_masjid" defaultValue={data.jumlah_masjid} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        {/* Peta */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg border-b pb-2">Lokasi (Google Maps Embed)</h4>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 flex items-center gap-1"><MapPin className="w-4 h-4"/> URL Embed (src dari iframe)</label>
            <input type="text" name="maps_embed_url" defaultValue={data.maps_embed_url} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {/* Pengaturan Lanjutan */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg border-b pb-2">Pengaturan Lanjutan</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Password Akses Database Warga</label>
              <input type="text" name="password_warga" defaultValue={data.password_warga} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
              <p className="text-xs text-zinc-500">Kata sandi yang digunakan warga untuk membuka menu Database Warga.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Foto Utama Beranda (Hero Foto)</label>
              <input type="file" name="hero_foto" accept="image/*" className="w-full p-3 rounded-xl border border-zinc-300 bg-zinc-50" />
              {data.hero_foto_url && <p className="text-xs text-blue-600 font-medium">Foto utama saat ini sudah terpasang.</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Pengurus RT 01</label>
              <input type="text" name="wa_rt1" defaultValue={data.wa_rt1} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Pengurus RT 02</label>
              <input type="text" name="wa_rt2" defaultValue={data.wa_rt2} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Pengurus RT 03</label>
              <input type="text" name="wa_rt3" defaultValue={data.wa_rt3} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">No. WA Pengurus RT 04</label>
              <input type="text" name="wa_rt4" defaultValue={data.wa_rt4} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <label className="text-sm font-bold text-zinc-700">Info Penting Kegiatan (Untuk sidebar kalender)</label>
            <textarea name="info_penting_kegiatan" defaultValue={data.info_penting_kegiatan} rows={3} className="w-full p-3 rounded-xl border border-zinc-300 focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : <><Save className="w-5 h-5" /> Simpan Perubahan Profil</>}
        </button>

      </form>
    </div>
  );
}
