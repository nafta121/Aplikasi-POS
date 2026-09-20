import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware Keamanan & Proteksi Akses Berdasarkan Role (RBAC)
 * 1. Menjaga sesi token Supabase tetap segar melalui getSession/getUser via cookies.
 * 2. Mengamankan root URL (/): Pengguna yang belum login diarahkan ke /login, pengguna terotentikasi diarahkan sesuai role.
 * 3. Mencegah akses persilangan (Cross-Access):
 *    - Role 'cashier' dilarang mengakses rute admin (/inventory, /dashboard, /transactions, dll) -> dipaksa ke /pos
 *    - Role 'admin' dilarang mengakses rute kasir (/pos, /cek-stok, /stock, /shift) -> dipaksa ke /inventory
 * 4. Mengarahkan pengguna yang sudah login menjauhi halaman /login langsung ke dasbor masing-masing.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Jika kredensial Supabase belum disetel, lewati middleware
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  // Buat Supabase Server Client untuk middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  // Ambil sesi user saat ini secara aman di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Klasifikasi Rute Aplikasi
  const isAdminRoute =
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/settings');

  const isCashierRoute =
    pathname.startsWith('/pos') ||
    pathname.startsWith('/cek-stok') ||
    pathname.startsWith('/stock') ||
    pathname.startsWith('/shift');

  const isRootRoute = pathname === '/';
  const isLoginRoute = pathname === '/login';
  const isProtectedRoute = isAdminRoute || isCashierRoute || isRootRoute;

  // Helper untuk redirect sembari mempertahankan cookies Supabase
  const createRedirect = (targetPath: string, retainRedirectParam = false) => {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = targetPath;
    targetUrl.search = '';

    if (retainRedirectParam && pathname !== '/' && pathname !== '/login') {
      targetUrl.searchParams.set('redirectTo', pathname);
    }

    const redirectResponse = NextResponse.redirect(targetUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  // ==========================================
  // KASUS 1: PENGGUNA BELUM LOGIN (!user)
  // ==========================================
  if (!user) {
    if (isProtectedRoute) {
      return createRedirect('/login', true);
    }
    return supabaseResponse;
  }

  // ==========================================
  // KASUS 2: PENGGUNA SUDAH LOGIN (user ada)
  // ==========================================

  // Ambil role pengguna dari tabel 'profiles'
  let userRole = 'cashier';
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      userRole = 'admin';
    }
  } catch (err) {
    console.warn('[Middleware] Gagal mengambil role profil:', err);
  }

  // 2A. Jika mencoba membuka root (/) atau /login -> arahkan ke halaman utama masing-masing
  if (isRootRoute || isLoginRoute) {
    if (userRole === 'admin') {
      return createRedirect('/inventory');
    } else {
      return createRedirect('/pos');
    }
  }

  // 2B. Proteksi Akses Persilangan (Cross-Access Prevention):
  // User 'cashier' mencoba membuka halaman admin -> paksa kembali ke /pos
  if (userRole === 'cashier' && isAdminRoute) {
    return createRedirect('/pos');
  }

  // User 'admin' mencoba membuka halaman kasir -> paksa kembali ke /inventory
  if (userRole === 'admin' && isCashierRoute) {
    return createRedirect('/inventory');
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
