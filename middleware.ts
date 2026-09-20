import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware untuk Memproteksi Rute Aplikasi POS & Logistik:
 * 1. Memperbarui sesi cookie Supabase melalui supabase.auth.getUser().
 * 2. Redirect paksa ke /login jika user belum login dan mencoba mengakses rute terproteksi (/pos, /inventory, /customers, /transactions).
 * 3. Mencegah user yang sudah login mengakses kembali halaman /login dengan me-redirect ke dashboard/POS.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Buat server client dengan penanganan cookies untuk middleware
  const supabase = createServerClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // PENTING: Gunakan getUser() dan BUKAN getSession() untuk verifikasi otentikasi yang aman di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Daftar rute terproteksi
  const isProtectedRoute =
    pathname.startsWith('/pos') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/customers') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings');

  const isLoginPage = pathname === '/login';

  // 1. Jika BELUM login dan mencoba mengakses rute terproteksi -> redirect ke /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Jika SUDAH login dan mencoba membuka halaman /login -> redirect sesuai role
  if (user && isLoginPage) {
    // Ambil role dari tabel profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const targetUrl = request.nextUrl.clone();
    if (profile?.role === 'admin') {
      targetUrl.pathname = '/inventory';
    } else {
      targetUrl.pathname = '/pos';
    }
    return NextResponse.redirect(targetUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Terapkan middleware ke semua request path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - file ekstensi statis: svg, png, jpg, jpeg, gif, webp, json, webmanifest
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|webmanifest)$).*)',
  ],
};
