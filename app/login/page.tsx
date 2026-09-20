'use client';

import React, { useActionState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  HardHat,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Boxes,
} from 'lucide-react';
import { login, type LoginActionResult } from './actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const [state, formAction, isPending] = useActionState<
    LoginActionResult | null,
    FormData
  >(login, null);

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/40">
      <div className="text-center space-y-2 mb-7">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
          <Boxes className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Masuk ke Sistem
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Silakan login dengan akun Anda. Sistem akan mengarahkan ke antarmuka Kasir Mobile atau Admin Desktop sesuai peran.
        </p>
      </div>

      {/* Feedback Pesan Error */}
      {state?.error && (
        <div
          id="login-error-alert"
          className="mb-6 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in-50 duration-200"
        >
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{state.error}</div>
        </div>
      )}

      {redirectTo && !state?.error && (
        <div className="mb-6 p-3 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Sesi diperlukan untuk membuka halaman tersebut.</span>
        </div>
      )}

      {/* Form Login */}
      <form action={formAction} className="space-y-4">
        {/* Input Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
          >
            Email Akun
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@tokobangunan.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="btn-submit-login"
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memverifikasi Akun...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>

      {/* Petunjuk Role Pengguna */}
      <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Akses Terintegrasi:</span>
          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-amber-400 font-bold block">Role Admin</span>
              <span className="text-slate-500">Stok &amp; Surat Jalan</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-emerald-400 font-bold block">Role Kasir</span>
              <span className="text-slate-500">POS Mobile PWA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-amber-500 selection:text-slate-900">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header Minimalis */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <HardHat className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              TB. MEKAR JAYA
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase block">
              Sistem POS & Logistik Material
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>PostgreSQL RLS Secured</span>
        </div>
      </header>

      {/* Main Content Form Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        <Suspense
          fallback={
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
              <span className="text-xs">Memuat formulir otentikasi...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer Minimalis */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
        TB. MEKAR JAYA &copy; {new Date().getFullYear()} • Sistem Terdistribusi POS &amp; Logistik Multi-Gudang
      </footer>
    </div>
  );
}
