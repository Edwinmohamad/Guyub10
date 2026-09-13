import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { getAdminEmails } from "@/lib/auth/config";

export async function GET() {
  return NextResponse.json(
    { error: "Gunakan permintaan POST dari sesi admin untuk sinkronisasi akun." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST() {
  const currentAdmin = await getCurrentAdminUser();

  if (!currentAdmin) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Konfigurasi server belum lengkap." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: users, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) {
    return NextResponse.json({ error: "Gagal membaca daftar akun." }, { status: 500 });
  }

  const allowedEmails = getAdminEmails();
  const allowedUsers = users.users.filter((user) =>
    allowedEmails.has(user.email?.toLowerCase() ?? ""),
  );

  for (const user of allowedUsers) {
    await supabase.from("profiles").upsert({ 
      id: user.id, 
      role: "admin",
      nama_lengkap: user.user_metadata?.nama_lengkap || "Admin Baru",
      rt: user.user_metadata?.rt || "1"
    });
  }

  return NextResponse.json({
    success: true,
    updated: allowedUsers.length,
    message: "Profil admin allowlist telah disinkronkan.",
  });
}
