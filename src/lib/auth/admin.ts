import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/config";

export const getCurrentAdminUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user && isAdminEmail(user.email) ? user : null;
});

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();

  if (!user) {
    throw new Error("Akses admin ditolak.");
  }

  return user;
}

export async function createAuthorizedAdminClient() {
  await requireAdminUser();
  return createAdminClient();
}
