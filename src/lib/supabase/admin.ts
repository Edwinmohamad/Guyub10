import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin client menggunakan Service Role Key.
 * Ini BYPASS semua RLS policies — gunakan HANYA di server actions admin.
 */
export function createAdminClient() {
  blockLegacy();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_URL di .env.local'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function blockLegacy(): void { throw new Error('Integrasi Supabase dinonaktifkan pada branch simulator lokal.'); }
