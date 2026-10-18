import type { SupabaseClient } from "@supabase/supabase-js";

export function createAdminClient(): SupabaseClient {
  throw new Error(
    "Integrasi Supabase tidak tersedia dalam simulator lokal. Gunakan API lokal.",
  );
}
