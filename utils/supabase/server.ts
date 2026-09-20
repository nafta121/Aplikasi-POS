import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Utilitas Supabase Server Client untuk Next.js App Router
 * Digunakan di Server Components, Server Actions, dan Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createServerClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component aman diabaikan jika middleware sudah menyegarkan cookie
          }
        },
      },
    }
  );
}
