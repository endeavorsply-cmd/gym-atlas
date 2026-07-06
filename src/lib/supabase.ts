import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk komponen browser/client.
 * Mengembalikan null jika environment variable belum diisi, sehingga UI tetap
 * bisa dirender memakai data contoh.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
