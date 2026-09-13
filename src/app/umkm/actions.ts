"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { safeUploadExtension, validateImageUpload } from "@/lib/uploads";

export async function submitUmkm(formData: FormData) {
  const supabase = await createClient();

  const namaPemilik = String(formData.get("nama_pemilik") || "").trim();
  const namaUsaha = String(formData.get("nama_usaha") || "").trim();
  const kategori = String(formData.get("kategori") || "").trim();
  const nomorWa = String(formData.get("nomor_wa") || "").trim();
  const alamat = String(formData.get("alamat") || "").trim();
  const jamBuka = String(formData.get("jam_buka") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const logo = formData.get("logo") as File | null;

  if (!namaPemilik || !namaUsaha || !kategori || !nomorWa || !deskripsi) {
    return { error: "Semua kolom yang ditandai bintang (*) wajib diisi." };
  }
  if (!/^\+?\d[\d\s-]{7,19}$/.test(nomorWa)) return { error: "Nomor WhatsApp tidak valid." };
  if (namaPemilik.length > 100 || namaUsaha.length > 120 || kategori.length > 60 || alamat.length > 300 || jamBuka.length > 100 || deskripsi.length > 2000) {
    return { error: "Data usaha melebihi batas panjang yang diizinkan." };
  }

  let fotoUrl = null;

  // Upload logo ke Supabase Storage (umkm_logo)
  if (logo && logo.size > 0) {
    const uploadErrorMessage = validateImageUpload(logo);
    if (uploadErrorMessage) return { error: uploadErrorMessage };
    const fileExt = safeUploadExtension(logo);
    const fileName = `umkm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("umkm_logo")
      .upload(fileName, logo);

    if (uploadError) {
      console.error("Gagal mengunggah logo UMKM:", uploadError);
      return { error: "Gagal mengunggah logo. Silakan coba gambar lain." };
    }

    const { data: publicUrlData } = supabase.storage
      .from("umkm_logo")
      .getPublicUrl(fileName);

    fotoUrl = publicUrlData.publicUrl;
  }

  // Insert ke database (is_approved = false)
  const { error: insertError } = await supabase
    .from("umkm")
    .insert({
      nama_pemilik: namaPemilik,
      nama_usaha: namaUsaha,
      kategori: kategori,
      nomor_wa: nomorWa,
      alamat: alamat,
      jam_buka: jamBuka,
      deskripsi: deskripsi,
      foto_url: fotoUrl,
      is_approved: false
    });

  if (insertError) {
    console.error("Gagal menyimpan data UMKM:", insertError);
    return { error: "Terjadi kesalahan pada sistem saat menyimpan data UMKM." };
  }

  // Revalidate halaman untuk memastikan admin dashboard ter-update
  revalidatePath("/admin");
  revalidatePath("/umkm");

  return { success: true };
}
