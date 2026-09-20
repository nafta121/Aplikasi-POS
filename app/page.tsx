import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Root Route (/) Server Component:
 * Memeriksa sesi otentikasi Supabase secara aman di server:
 * - Jika user BELUM login -> Redirect ke /login
 * - Jika user SUDAH login -> Cek role di tabel profiles:
 *   - role 'admin' -> Redirect ke /inventory
 *   - role 'cashier' -> Redirect ke /pos
 */
export default async function RootPage() {
  const supabase = await createClient();

  // Verifikasi sesi user di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Jika belum terotentikasi, alihkan ke halaman login
  if (!user) {
    redirect('/login');
  }

  // 2. Jika sudah terotentikasi, periksa role di tabel profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/inventory');
  } else {
    redirect('/pos');
  }
}
