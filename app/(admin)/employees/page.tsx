'use client';

import React from 'react';
import { Users, Plus, Shield, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { MOCK_EMPLOYEES } from '@/lib/mockData';

export default function AdminEmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Karyawan & Hak Akses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar pengguna sistem, kasir toko, staf gudang material, dan armada pengiriman.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Modal Tambah Karyawan Baru dapat dibuka di sini.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_EMPLOYEES.map((emp) => (
          <div
            key={emp.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
                  {emp.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Aktif</span>
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {emp.name}
              </h3>
              <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                Role: {emp.role}
              </span>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => alert(`Kelola hak akses untuk ${emp.name}`)}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Kelola Akses →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
