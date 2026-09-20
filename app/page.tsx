'use client';

import React from 'react';
import Link from 'next/link';
import {
  Monitor,
  Smartphone,
  HardHat,
  ShoppingCart,
  Boxes,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
            <HardHat className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              TB Mitra Bangunan
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem POS & Inventaris Toko Bangunan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Dual-Architecture Launcher */}
      <main className="max-w-5xl mx-auto w-full py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-3">
            <Zap className="h-3.5 w-3.5" />
            Next.js App Router • Route Groups `(admin)` & `(kasir)`
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pilih Antarmuka Pengguna
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
            Arsitektur terpisah dengan layout khusus untuk efisiensi operasional toko material.
          </p>
        </div>

        {/* 2 Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Admin PC */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col justify-between hover:border-amber-400 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Monitor className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  app/(admin)
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Dashboard Admin (PC Desktop)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Optimal untuk layar PC / Laptop. Dilengkapi Sidebar statis (w-64), Top Header (h-16) dengan Global Search, tabel inventaris master, dan analitik omset toko bangunan.
              </p>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Left Sidebar statis (w-64) dengan navigasi aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Top Header (h-16) + Global Search SKU & material</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Master Inventaris (Semen, Besi, Cat, Pipa, Keramik)</span>
                </div>
              </div>
            </div>

            <Link
              id="launch-admin-btn"
              href="/dashboard"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Buka Admin Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 2: Kasir Mobile PWA */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col justify-between hover:border-emerald-500 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  app/(kasir)
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Aplikasi Kasir (Mobile PWA)
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Optimal untuk layar sentuh HP / Tablet. Dilengkapi Top App Bar (h-14) Shift Aktif, Hamburger Drawer, dan Bottom Navigation Bar fixed (h-16) dengan 3 tab utama.
              </p>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Top App Bar (h-14) dengan status Shift Kasir Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Fixed Bottom Navigation Bar (h-16): POS 🛒, Stok 📦, Shift ⏱️</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Scrollable Main Content dengan padding anti-tertutup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>PWA Manifest, Service Worker offline & Install to Home Screen</span>
                </div>
              </div>
            </div>

            <Link
              id="launch-kasir-btn"
              href="/pos"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3"
            >
              <span>Buka POS Kasir (Mobile PWA)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>
          TB Mitra Bangunan • Next.js App Router • Tailwind CSS • Framer Motion • Supabase Realtime
        </p>
      </footer>
    </div>
  );
}
