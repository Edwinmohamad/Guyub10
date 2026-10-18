import type { SupabaseClient } from "@supabase/supabase-js";

export async function createClient(): Promise<SupabaseClient> {
  throw new Error(
    "Integrasi Supabase tidak tersedia dalam simulator lokal. Gunakan API lokal.",
  );
}
