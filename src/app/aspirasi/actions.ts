"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitAspirasi(formData: FormData) {
  const supabase = await createClient();

  const nama = String(formData.get("nama") || "Anonim").trim();
  const kategori = String(formData.get("kategori") || "").trim();
  const pesan = String(formData.get("pesan") || "").trim();

  if (!kategori || !pesan) {
    return { error: "Kategori dan isi pesan wajib diisi." };
  }
  if (nama.length > 80 || kategori.length > 60 || pesan.length > 2000) {
    return { error: "Isi aspirasi melebihi batas panjang yang diizinkan." };
  }

  const { error } = await supabase
    .from("aspirasi")
    .insert({
      nama,
      kategori,
      pesan,
      status: "masuk",
    });

  if (error) {
    console.error("Gagal mengirim aspirasi:", error);
    return { error: "Gagal mengirim aspirasi." };
  }

  revalidatePath("/aspirasi");
  revalidatePath("/admin");

  return { success: true };
}
