import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Utilitas Supabase Server Client untuk Next.js App Router
 * Mendukung pemanggilan dengan parameter cookieStore: createClient(cookieStore)
 * maupun pemanggilan tanpa parameter (async): await createClient()
 */
export async function createClient(
  providedCookieStore?: Awaited<ReturnType<typeof cookies>>
) {
  const cookieStore = providedCookieStore ?? (await cookies());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase Environment Variables: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum disetel di .env.local."
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
