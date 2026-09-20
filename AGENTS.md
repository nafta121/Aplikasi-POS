# Supabase Server Guidelines

This project uses `@supabase/server` and `@supabase/ssr` to interact with Supabase on the backend and frontend.

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`: `https://iqvsnnohsyrafvpdhbap.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_3ht9HqJoLx24Lyh_IGaFqw_OJS8ju5w`
- `SUPABASE_SECRET_KEY`: `sb_secret_7hvILHmuLZBrUC3WN4E6HA_B9Q-ZyQi`
- `SUPABASE_JWKS_URL`: `https://iqvsnnohsyrafvpdhbap.supabase.co/auth/v1/.well-known/jwks.json`

## Server-Side Integration Pattern
1. **Server Components, Actions, & Route Handlers**:
   - Always use `createClient()` from `@/utils/supabase/server`.
   - Never expose `SUPABASE_SECRET_KEY` on client-side components.
2. **Client Components**:
   - Use `createClient()` from `@/utils/supabase/client`.
3. **Admin Privileges / Service Role**:
   - For backend-only operations that bypass RLS (when necessary for administrative batch jobs or secure webhooks), use `SUPABASE_SECRET_KEY` with `@supabase/supabase-js` or `@supabase/server`.
