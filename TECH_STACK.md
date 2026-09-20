# Tech Stack & Architecture

## Core Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (menggunakan class utility)
- **Database & Auth:** Supabase (PostgreSQL)
- **PWA:** `@ducanh2912/next-pwa` (atau sejenisnya untuk Next.js App Router)

## Supabase Rules (CRITICAL FOR AI AGENT)
- **DO NOT** use `@supabase/auth-helpers-nextjs`. It is deprecated.
- **ALWAYS** use `@supabase/ssr`.
- Browser/Client component: Use `createBrowserClient` (dari `utils/supabase/client.ts`).
- Server component/action: Use `createServerClient` (dari `utils/supabase/server.ts`).

## Middleware & Routing
- Aplikasi dilindungi oleh `middleware.ts` di root.
- User diverifikasi menggunakan `supabase.auth.getUser()`. (JANGAN gunakan `getSession()`).
- Jika role `admin` login, arahkan ke `/inventory`.
- Jika role `cashier` login, arahkan ke `/pos`.
