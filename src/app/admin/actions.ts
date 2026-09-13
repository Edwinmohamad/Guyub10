"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createAuthorizedAdminClient } from "@/lib/auth/admin";
import { assertImageUpload, safeUploadExtension, validateImageUpload } from "@/lib/uploads";

// ══════════════════════════════════════════════════════════════
// SURAT ACTIONS
// ══════════════════════════════════════════════════════════════

export async function updateSuratStatus(suratId: string, status: "diproses" | "selesai" | "ditolak", catatan?: string) {
  const supabase = await createAuthorizedAdminClient();

  const { error } = await supabase
    .from("surat")
    .update({ status, catatan_admin: catatan ?? null })
    .eq("id", suratId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
// ══════════════════════════════════════════════════════════════
// PENGUMUMAN ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createPengumuman(formData: FormData) {
  const supabase = await createAuthorizedAdminClient();

  const judul = formData.get("judul") as string;
  const konten = formData.get("konten") as string;
  const kategori = formData.get("kategori") as string;
  const penyelenggara = formData.get("penyelenggara") as string || "Pengurus RW";

  if (!judul || !konten || !kategori) return { error: "Semua field harus diisi." };

  const insertData: Record<string, unknown> = {
    judul,
    konten,
    kategori,
    penyelenggara,
  };

  const foto = formData.get("foto") as File | null;
  if (foto && foto.size > 0) {
    const uploadError = validateImageUpload(foto);
    if (uploadError) return { error: uploadError };
    const ext = safeUploadExtension(foto);
    const fileName = `berita_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("berita").upload(fileName, foto);
    if (upErr) return { error: `Gagal mengunggah gambar: ${upErr.message}` };
    const { data: urlData } = supabase.storage.from("berita").getPublicUrl(fileName);
    insertData.foto_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("pengumuman").insert(insertData);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/informasi");
  revalidatePath("/");
  return { success: true };
}

export async function deletePengumuman(id: string) {
  const supabase = await createAuthorizedAdminClient();

  const { error } = await supabase.from("pengumuman").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/informasi");
  revalidatePath("/");
  return { success: true };
}

export async function updatePengumuman(id: string, formData: FormData) {
  const supabase = await createAuthorizedAdminClient();

  const judul = formData.get("judul") as string;
  const konten = formData.get("konten") as string;
  const kategori = formData.get("kategori") as string;
  const penyelenggara = formData.get("penyelenggara") as string || "Pengurus RW";

  if (!judul || !konten || !kategori) return { error: "Semua field harus diisi." };

  const updateData: Record<string, unknown> = { judul, konten, kategori, penyelenggara };

  const foto = formData.get("foto") as File | null;
  if (foto && foto.size > 0) {
    const uploadError = validateImageUpload(foto);
    if (uploadError) return { error: uploadError };
    const ext = safeUploadExtension(foto);
    const fileName = `berita_${id}_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("berita").upload(fileName, foto, { upsert: true });
    if (upErr) return { error: `Gagal mengunggah gambar: ${upErr.message}` };
    const { data: urlData } = supabase.storage.from("berita").getPublicUrl(fileName);
    updateData.foto_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("pengumuman").update(updateData).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/informasi");
  revalidatePath("/");
  return { success: true };
}

// ══════════════════════════════════════════════════════════════
// LAPORAN ACTIONS
// ══════════════════════════════════════════════════════════════

export async function updateLaporanStatus(laporanId: string, status: "diproses" | "selesai" | "ditolak", balasan?: string) {
  const supabase = await createAuthorizedAdminClient();

  const { error } = await supabase
    .from("laporan_infrastruktur")
    .update({ status, balasan_admin: balasan ?? null })
    .eq("id", laporanId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/laporan");
  return { success: true };
}

// ══════════════════════════════════════════════════════════════
// KEGIATAN ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createKegiatan(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();

    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const lokasi = formData.get("lokasi") as string;
    const kategori = formData.get("kategori") as string;
    const penyelenggara = formData.get("penyelenggara") as string || "Pengurus RW";
    const penyelenggara_type = formData.get("penyelenggara_type") as string || "RW";
    const penyelenggara_id = formData.get("penyelenggara_id") as string || "RW";
    
    const tanggalInput = formData.get("tanggal") as string; 
    const tanggal = new Date(tanggalInput).toISOString();

    const insertData: Record<string, unknown> = {
      judul,
      deskripsi,
      tanggal,
      lokasi,
      kategori,
      penyelenggara,
      penyelenggara_type,
      penyelenggara_id,
    };

    const foto = formData.get("foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `kegiatan_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("kegiatan").upload(fileName, foto);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("kegiatan").getPublicUrl(fileName);
        insertData.foto_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("kegiatan").insert(insertData);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/kegiatan");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to create kegiatan" };
  }
}

export async function updateKegiatan(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();

    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const lokasi = formData.get("lokasi") as string;
    const kategori = formData.get("kategori") as string;
    const penyelenggara = formData.get("penyelenggara") as string || "Pengurus RW";
    const penyelenggara_type = formData.get("penyelenggara_type") as string || "RW";
    const penyelenggara_id = formData.get("penyelenggara_id") as string || "RW";
    const tanggalInput = formData.get("tanggal") as string;
    const tanggal = new Date(tanggalInput).toISOString();

    const updateData: Record<string, unknown> = {
      judul,
      deskripsi,
      tanggal,
      lokasi,
      kategori,
      penyelenggara,
      penyelenggara_type,
      penyelenggara_id,
    };

    const foto = formData.get("foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `kegiatan_${id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("kegiatan").upload(fileName, foto, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("kegiatan").getPublicUrl(fileName);
        updateData.foto_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("kegiatan")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/kegiatan");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to update kegiatan" };
  }
}

export async function deleteKegiatan(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("kegiatan").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/kegiatan");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to delete kegiatan" };
  }
}

export async function updateProfilRt(no_rt: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    
    const updateData: Record<string, unknown> = {
      no_rt,
      ketua_nama: formData.get("ketua_nama") as string,
      sambutan: formData.get("sambutan") as string,
      visi_misi: formData.get("visi_misi") as string,
      kontak: formData.get("kontak") as string,
    };

    const foto = formData.get("foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `rt_${no_rt}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("galeri").upload(fileName, foto);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("galeri").getPublicUrl(fileName);
        updateData.ketua_foto_url = urlData.publicUrl;
      }
    }

    const { data: existing } = await supabase.from("profil_rt").select("id").eq("no_rt", no_rt).single();

    if (existing) {
      const { error } = await supabase.from("profil_rt").update(updateData).eq("no_rt", no_rt);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("profil_rt").insert(updateData);
      if (error) throw error;
    }

    revalidatePath("/admin");
    revalidatePath(`/rt/${no_rt}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update profil RT" };
  }
}

// ══════════════════════════════════════════════════════════════
// UMKM ACTIONS
// ══════════════════════════════════════════════════════════════

export async function updateUmkmStatus(id: string, is_approved: boolean) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("umkm").update({ is_approved }).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/umkm");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal mengubah status UMKM" };
  }
}

export async function updateUmkmLengkap(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    
    const updateData: Record<string, unknown> = {
      nama_usaha: formData.get("nama_usaha") as string,
      kategori: formData.get("kategori") as string,
      deskripsi: formData.get("deskripsi") as string,
      nomor_wa: formData.get("nomor_wa") as string,
      alamat: formData.get("alamat") as string,
      jam_buka: formData.get("jam_buka") as string,
    };

    const foto = formData.get("foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `umkm_${id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("umkm").upload(fileName, foto, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("umkm").getPublicUrl(fileName);
        updateData.foto_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("umkm").update(updateData).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/umkm");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal mengedit UMKM" };
  }
}

export async function deleteUmkm(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("umkm").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/umkm");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menghapus UMKM" };
  }
}

// ══════════════════════════════════════════════════════════════
// PROFIL RW ACTIONS
// ══════════════════════════════════════════════════════════════

export async function updateProfilRw(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();

    const updateData: Record<string, unknown> = {};
    const fields = [
      "ketua_nama", "ketua_sambutan", "ketua_wa",
      "sekretaris_nama", "sekretaris_wa",
      "bendahara_nama", "bendahara_wa",
      "sejarah", "visi", "fasilitas_lain", "maps_embed_url",
      "nomor_darurat", "info_penting_kegiatan", "wa_rw",
      "wa_rt1", "wa_rt2", "wa_rt3", "wa_rt4", "password_warga"
    ];
    
    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) updateData[field] = val as string;
    }

    // Handle misi array
    const misiRaw = formData.get("misi") as string;
    if (misiRaw) {
      updateData.misi = misiRaw.split("\n").filter((m: string) => m.trim() !== "");
    }

    // Handle numeric fields
    const numFields = ["jumlah_warga", "jumlah_kk", "jumlah_rt", "jumlah_masjid", "jumlah_lapangan"];
    for (const field of numFields) {
      const val = formData.get(field);
      if (val !== null && val !== "") updateData[field] = parseInt(val as string, 10);
    }

    // Handle foto upload
    const foto = formData.get("ketua_foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `ketua_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profil_rw").upload(fileName, foto, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("profil_rw").getPublicUrl(fileName);
        updateData.ketua_foto_url = urlData.publicUrl;
      }
    }

    const heroFoto = formData.get("hero_foto") as File | null;
    if (heroFoto && heroFoto.size > 0) {
      assertImageUpload(heroFoto);
      const ext = safeUploadExtension(heroFoto);
      const fileName = `hero_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profil_rw").upload(fileName, heroFoto, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("profil_rw").getPublicUrl(fileName);
        updateData.hero_foto_url = urlData.publicUrl;
      }
    }

    // Get first (and only) row ID
    const { data: existing } = await supabase.from("profil_rw").select("id").limit(1).single();
    if (!existing) return { success: false, error: "Data profil_rw belum ada." };

    const { error } = await supabase.from("profil_rw").update(updateData).eq("id", existing.id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/profil");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update profil RW" };
  }
}

// ══════════════════════════════════════════════════════════════
// TICKER ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createTicker(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const konten = formData.get("konten") as string;
    const urutan = parseInt(formData.get("urutan") as string || "0", 10);
    
    if (!konten) return { success: false, error: "Konten wajib diisi." };
    
    const { error } = await supabase.from("ticker").insert({ konten, urutan, aktif: true });
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menambah ticker" };
  }
}

export async function updateTicker(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const konten = formData.get("konten") as string;
    const urutan = parseInt(formData.get("urutan") as string || "0", 10);
    const aktif = formData.get("aktif") === "true";

    const { error } = await supabase.from("ticker").update({ konten, urutan, aktif }).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update ticker" };
  }
}

export async function deleteTicker(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("ticker").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal hapus ticker" };
  }
}

// ══════════════════════════════════════════════════════════════
// LEMBAGA ACTIONS
// ══════════════════════════════════════════════════════════════

export async function updateLembaga(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();

    const updateData: Record<string, unknown> = {};
    const fields = ["nama", "deskripsi", "ketua_nama", "ketua_wa", "sekretaris_nama", "bendahara_nama", "program_kerja", "kontak_wa"];
    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) updateData[field] = val as string;
    }

    // Handle foto upload
    const foto = formData.get("ketua_foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `lembaga_${id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("lembaga").upload(fileName, foto, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("lembaga").getPublicUrl(fileName);
        updateData.ketua_foto_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("lembaga").update(updateData).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/lembaga");
    revalidatePath("/profil");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update lembaga" };
  }
}

// ══════════════════════════════════════════════════════════════
// FASILITAS ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createFasilitas(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const lokasi = formData.get("lokasi") as string;
    const jam_operasional = formData.get("jam_operasional") as string;
    const cara_peminjaman = formData.get("cara_peminjaman") as string;
    const bisa_dipinjam = formData.get("bisa_dipinjam") === "true";

    if (!nama) return { success: false, error: "Nama fasilitas wajib diisi." };

    const insertData: Record<string, unknown> = { nama, deskripsi, lokasi, jam_operasional, cara_peminjaman, bisa_dipinjam };

    const foto = formData.get("foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `fasilitas_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("fasilitas").upload(fileName, foto);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("fasilitas").getPublicUrl(fileName);
        insertData.foto_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("fasilitas").insert(insertData);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/fasilitas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menambah fasilitas" };
  }
}

export async function updateFasilitas(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const updateData: Record<string, unknown> = {
      nama: formData.get("nama") as string,
      deskripsi: formData.get("deskripsi") as string,
      lokasi: formData.get("lokasi") as string,
      jam_operasional: formData.get("jam_operasional") as string,
      cara_peminjaman: formData.get("cara_peminjaman") as string,
      bisa_dipinjam: formData.get("bisa_dipinjam") === "true",
    };

    const foto = formData.get("foto") as File | null;
    if (foto && foto.size > 0) {
      assertImageUpload(foto);
      const ext = safeUploadExtension(foto);
      const fileName = `fasilitas_${id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("fasilitas").upload(fileName, foto, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("fasilitas").getPublicUrl(fileName);
        updateData.foto_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("fasilitas").update(updateData).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/fasilitas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update fasilitas" };
  }
}

export async function deleteFasilitas(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("fasilitas").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/fasilitas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal hapus fasilitas" };
  }
}

// ══════════════════════════════════════════════════════════════
// GALERI ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createGaleri(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const album = formData.get("album") as string || "umum";
    const foto = formData.get("foto") as File | null;

    if (!judul) return { success: false, error: "Judul wajib diisi." };
    if (!foto || foto.size === 0) return { success: false, error: "Foto wajib diupload." };

    assertImageUpload(foto);
    const ext = safeUploadExtension(foto);
    const fileName = `galeri_${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("galeri").upload(fileName, foto);
    if (upErr) return { success: false, error: "Gagal upload foto: " + upErr.message };

    const { data: urlData } = supabase.storage.from("galeri").getPublicUrl(fileName);

    const { error } = await supabase.from("galeri").insert({
      judul, deskripsi, album, foto_url: urlData.publicUrl,
    });
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/galeri");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menambah foto galeri" };
  }
}

export async function deleteGaleri(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("galeri").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/galeri");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal hapus foto galeri" };
  }
}

// ══════════════════════════════════════════════════════════════
// KAS ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createKas(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const tanggal = formData.get("tanggal") as string;
    const keterangan = formData.get("keterangan") as string;
    const jenis = formData.get("jenis") as string;
    const jumlah = parseInt(formData.get("jumlah") as string, 10);
    const kategori = formData.get("kategori") as string || "umum";
    const entitas_type = formData.get("entitas_type") as string || "RW";
    const entitas_id = formData.get("entitas_id") as string || "RW";

    if (!tanggal || !keterangan || !jenis || isNaN(jumlah)) {
      return { success: false, error: "Semua field wajib diisi." };
    }

    const { error } = await supabase.from("kas").insert({ tanggal, keterangan, jenis, jumlah, kategori, entitas_type, entitas_id });
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/kas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menambah entri kas" };
  }
}

export async function updateKas(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const updateData: Record<string, unknown> = {
      tanggal: formData.get("tanggal") as string,
      keterangan: formData.get("keterangan") as string,
      jenis: formData.get("jenis") as string,
      jumlah: parseInt(formData.get("jumlah") as string, 10),
      kategori: formData.get("kategori") as string || "umum",
      entitas_type: formData.get("entitas_type") as string || "RW",
      entitas_id: formData.get("entitas_id") as string || "RW",
    };

    const { error } = await supabase.from("kas").update(updateData).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/kas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update entri kas" };
  }
}

export async function deleteKas(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("kas").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/kas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal hapus entri kas" };
  }
}

// ══════════════════════════════════════════════════════════════
// ASPIRASI ACTIONS
// ══════════════════════════════════════════════════════════════

export async function updateAspirasi(id: string, formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const status = formData.get("status") as string;
    const balasan_admin = formData.get("balasan_admin") as string;

    const { error } = await supabase.from("aspirasi").update({ status, balasan_admin }).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/aspirasi");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal update aspirasi" };
  }
}

export async function deleteAspirasi(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("aspirasi").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/aspirasi");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal hapus aspirasi" };
  }
}

// ══════════════════════════════════════════════════════════════
// WARGA ACTIONS
// ══════════════════════════════════════════════════════════════

export async function createWarga(formData: FormData) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const insertData = {
      nik: formData.get("nik") as string,
      no_kk: formData.get("no_kk") as string,
      nama_lengkap: formData.get("nama_lengkap") as string,
      tempat_lahir: formData.get("tempat_lahir") as string,
      tanggal_lahir: formData.get("tanggal_lahir") as string || null,
      jenis_kelamin: formData.get("jenis_kelamin") as string,
      agama: formData.get("agama") as string,
      status_perkawinan: formData.get("status_perkawinan") as string,
      pekerjaan: formData.get("pekerjaan") as string,
      pendidikan: formData.get("pendidikan") as string,
      rt: formData.get("rt") as string,
      alamat: formData.get("alamat") as string,
      status_warga: formData.get("status_warga") as string || "aktif",
    };

    if (!insertData.nik || !insertData.nama_lengkap || !insertData.rt) {
      return { success: false, error: "NIK, Nama, dan RT wajib diisi." };
    }

    const { error } = await supabase.from("warga").insert(insertData);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/warga");
    updateTag("warga-statistics");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal menambah data warga" };
  }
}

export async function bulkInsertWarga(rows: Record<string, unknown>[]) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("warga").upsert(rows, { onConflict: 'nik' });
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/warga");
    updateTag("warga-statistics");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal import data warga" };
  }
}

export async function deleteWarga(id: string) {
  try {
    const supabase = await createAuthorizedAdminClient();
    const { error } = await supabase.from("warga").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/warga");
    updateTag("warga-statistics");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Gagal hapus data warga" };
  }
}

