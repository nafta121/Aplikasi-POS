import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

/**
 * Utilitas Supabase Server Client untuk Next.js App Router
 * Mendukung pemanggilan dengan parameter cookieStore: createClient(cookieStore)
 * maupun pemanggilan tanpa parameter (async): await createClient()
 */
export async function createClient(
  providedCookieStore?: Awaited<ReturnType<typeof cookies>>
) {
  const cookieStore = providedCookieStore ?? (await cookies());

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase Environment Variables: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum disetel di .env.local."
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
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
  });
}
