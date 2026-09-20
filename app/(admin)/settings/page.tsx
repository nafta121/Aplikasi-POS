'use client';

import React from 'react';
import { Settings, Database, Printer, Shield, Save, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Sistem & Toko
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi identitas toko bangunan, printer kasir bluetooth/USB, dan integrasi database Supabase.
        </p>
      </div>

      {/* Database Connection Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Backend Supabase & Realtime Sync
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konektivitas sinkronisasi inventaris dan transaksi kasir secara real-time.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isSupabaseConfigured
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>
              {isSupabaseConfigured
                ? 'Supabase Terhubung'
                : 'Mode Dummy Data Aktif'}
            </span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <p>
            • Konfigurasi environment: <code className="text-amber-600 dark:text-amber-400 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> dan <code className="text-amber-600 dark:text-amber-400 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
          <p>
            • Schema database lengkap dengan RLS (Row Level Security) dan Triggers otomatis telah disiapkan di <code className="font-mono text-slate-700 dark:text-slate-200">lib/schema.sql</code>.
          </p>
        </div>
      </div>

      {/* Store Identity Settings */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Informasi Toko & Struk Kasir
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Toko Bangunan
            </label>
            <input
              type="text"
              defaultValue="TB Mitra Bangunan Sejahtera"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Telepon / WhatsApp Toko
            </label>
            <input
              type="text"
              defaultValue="0812-3456-7890"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Toko
            </label>
            <input
              type="text"
              defaultValue="Jl. Raya Industri Bangunan No. 45, Sentra Material, Jawa Tengah"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => alert('Pengaturan toko berhasil disimpan!')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
