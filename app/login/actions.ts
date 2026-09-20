'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export interface LoginActionResult {
  error?: string;
}

/**
 * Server Action: Login dengan Email & Password
 * Menentukan redirect otomatis berdasarkan role user ('admin' -> /inventory, 'cashier' -> /pos)
 */
export async function login(
  prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  const supabase = await createClient();

  // 1. Eksekusi sign in dengan email & password
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    return {
      error:
        authError?.message ||
        'Kredensial login tidak valid. Silakan periksa kembali email dan password Anda.',
    };
  }

  // 2. Query data role dari tabel profiles berdasarkan auth.uid()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  let targetRoute = '/pos'; // Fallback default untuk kasir

  if (!profileError && profile) {
    if (profile.role === 'admin') {
      targetRoute = '/inventory';
    } else {
      targetRoute = '/pos';
    }
  }

  // 3. Redirect user ke halaman dashboard/POS sesuai role
  redirect(targetRoute);
}

/**
 * Server Action: Logout user dari sesi Supabase
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
