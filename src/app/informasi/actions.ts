"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAuthorizedAdminClient } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

/** Increment view counter setiap artikel dibuka */
export async function incrementViews(pengumumanId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("increment_views", { row_id: pengumumanId });
  
  if (error) {
    // Fallback manual jika RPC belum ada
    const { data } = await supabase
      .from("pengumuman")
      .select("views")
      .eq("id", pengumumanId)
      .single();
      
    if (data) {
      await supabase
        .from("pengumuman")
        .update({ views: (data.views ?? 0) + 1 })
        .eq("id", pengumumanId);
    }
  }
}

/** Submit komentar baru (masuk sebagai 'pending', menunggu approval admin) */
export async function submitKomentar(
  pengumumanId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const nama = (formData.get("nama") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const isi = (formData.get("isi") as string)?.trim();

  if (!nama || nama.length < 2) {
    return { success: false, error: "Nama harus diisi (minimal 2 karakter)." };
  }
  if (!isi || isi.length < 5) {
    return { success: false, error: "Komentar terlalu pendek." };
  }
  if (nama.length > 80 || isi.length > 1500 || (email && email.length > 254)) {
    return { success: false, error: "Komentar melebihi batas panjang yang diizinkan." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("komentar_pengumuman").insert({
    pengumuman_id: pengumumanId,
    nama,
    email,
    isi,
    status: "pending",
  });

  if (error) {
    return { success: false, error: "Gagal mengirim komentar. Coba lagi." };
  }

  revalidatePath(`/informasi/${pengumumanId}`);
  return { success: true };
}

/** Admin: approve atau tolak komentar */
export async function moderasiKomentar(
  komentarId: string,
  status: "disetujui" | "ditolak"
) {
  const supabase = await createAuthorizedAdminClient();
  const { error } = await supabase
    .from("komentar_pengumuman")
    .update({ status })
    .eq("id", komentarId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

/** Ambil semua komentar untuk admin (semua status) */
export async function getAllKomentarAdmin() {
  const supabase = await createAuthorizedAdminClient();
  const { data } = await supabase
    .from("komentar_pengumuman")
    .select(`id, nama, email, isi, status, created_at, pengumuman_id, pengumuman(judul)`)
    .order("created_at", { ascending: false });
  return data ?? [];
}
