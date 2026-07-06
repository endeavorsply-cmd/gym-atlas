import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client (service role) untuk operasi server-side terpercaya
 * seperti webhook pembayaran. Jangan pernah diekspos ke browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
