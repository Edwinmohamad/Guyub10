"use server";

import { revalidatePath } from "next/cache";
import { validateAttachmentUpload } from "@/lib/uploads";
import { createClient } from "@/lib/supabase/server";

export async function submitSurat(formData: FormData) {
  // Fitur cetak mandiri tidak memerlukan login.
  // Surat dicetak sendiri oleh warga dan disahkan langsung (fisik) ke RT/RW.

  // Mengambil data dari form
  const jenis = formData.get("jenis") as string;
  const keperluan = formData.get("keperluan") as string;
  const tujuan = formData.get("tujuan") as string;
  const lampiran = formData.get("lampiran") as File | null;

  if (!jenis || !keperluan || !tujuan) {
    return { error: "Jenis surat, tujuan, dan keperluan wajib diisi." };
  }

  // Lampiran hanya digunakan di browser untuk dokumen cetak mandiri dan tidak disimpan.
  if (lampiran && lampiran.size > 0) {
    const uploadErrorMessage = validateAttachmentUpload(lampiran);
    if (uploadErrorMessage) return { error: uploadErrorMessage };
  }

  // Generate Nomor Tiket
  const nomorTiket = `TKT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  // Karena ini adalah Cetak Mandiri, kita tidak perlu menyimpan 
  // ke tabel 'surat' (karena user_id wajib di tabel tersebut, dan admin tidak perlu
  // memproses secara digital, melainkan mengecap langsung kertas fisik).
  
  // Jika di masa depan ingin ada riwayat, kita perlu mengubah skema DB (membuat user_id nullable).

  revalidatePath("/admin");
  revalidatePath("/layanan");

  return { success: true, nomorTiket };
}

export async function getKetuaNames(rt: string) {
  const supabase = await createClient();

  // Get RW 10 Name
  const { data: rwData } = await supabase
    .from('profil_rw')
    .select('ketua_nama')
    .limit(1)
    .single();

  // Get RT Name
  let rtData = null;
  if (rt) {
    const { data } = await supabase
      .from('profil_rt')
      .select('ketua_nama')
      .eq('no_rt', rt.replace('RT ', ''))
      .limit(1)
      .single();
    rtData = data;
  }

  return {
    namaKetuaRw: rwData?.ketua_nama || '',
    namaKetuaRt: rtData?.ketua_nama || '',
  };
}
