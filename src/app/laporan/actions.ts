"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { safeUploadExtension, validateImageUpload } from "@/lib/uploads";

export async function submitLaporan(formData: FormData) {
  const supabase = await createClient();

  const nama_pelapor = String(formData.get("nama_pelapor") || "Anonim").trim();
  const kategori = String(formData.get("kategori") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const lokasi = String(formData.get("lokasi") || "").trim();
  const file = formData.get("foto") as File;

  if (!kategori || !deskripsi) {
    return { error: "Kategori dan deskripsi wajib diisi" };
  }
  if (nama_pelapor.length > 80 || kategori.length > 80 || lokasi.length > 300 || deskripsi.length > 2500) {
    return { error: "Isi laporan melebihi batas panjang yang diizinkan." };
  }

  let foto_url = "";

  if (file && file.size > 0) {
    const uploadErrorMessage = validateImageUpload(file);
    if (uploadErrorMessage) return { error: uploadErrorMessage };
    const fileExt = safeUploadExtension(file);
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `laporan/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("public_assets")
      .upload(filePath, file);

    if (uploadError) {
      return { error: "Gagal mengunggah foto: " + uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("public_assets")
      .getPublicUrl(filePath);

    foto_url = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("laporan_infrastruktur").insert({
    nama_pelapor,
    kategori,
    deskripsi,
    lokasi,
    foto_url,
    status: "dilaporkan",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/laporan");
  return { success: true };
}
