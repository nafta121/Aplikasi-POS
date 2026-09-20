import { createBrowserClient } from '@supabase/ssr';

/**
 * Utilitas Supabase Client untuk Client Components di Next.js App Router.
 * Menggunakan createBrowserClient dari @supabase/ssr.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );
}

/**
 * Cek apakah kredensial Supabase sudah terisi dengan benar (bukan placeholder)
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url && 
    key && 
    !url.includes('xyzcompany') && 
    !url.includes('placeholder') &&
    key !== 'public-anon-key'
  );
}
