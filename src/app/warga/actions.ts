"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createWargaAccessToken, WARGA_ACCESS_COOKIE } from "@/lib/auth/warga";

export async function unlockWarga(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data } = await supabase.from("profil_rw").select("password_warga").limit(1).single();
  const expected = data?.password_warga || process.env.WARGA_ACCESS_PASSWORD || "RW10PINTAR";
  if (password !== expected) redirect("/warga?error=1");

  const cookieStore = await cookies();
  cookieStore.set(WARGA_ACCESS_COOKIE, createWargaAccessToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/warga",
  });
  redirect("/warga");
}

export async function lockWarga() {
  const cookieStore = await cookies();
  cookieStore.delete(WARGA_ACCESS_COOKIE);
  redirect("/warga");
}

export async function registerUmkm(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const nama_usaha = formData.get("nama_usaha") as string;
    const kategori = formData.get("kategori") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const nomor_wa = formData.get("nomor_wa") as string;

    if (!nama_usaha || !kategori || !nomor_wa) {
      return { success: false, error: "Nama Usaha, Kategori, dan Nomor WA wajib diisi." };
    }

    // Insert dengan default is_approved = false
    const { error } = await supabase.from("umkm").insert({
      owner_id: user.id,
      nama_usaha,
      kategori,
      deskripsi,
      nomor_wa,
      is_approved: false
    });

    if (error) throw error;

    revalidatePath("/warga");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mendaftarkan UMKM." };
  }
}
