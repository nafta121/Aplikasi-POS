'use client';

import React from 'react';
import { Menu, Clock, ShieldCheck, User } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { MOCK_ACTIVE_SHIFT } from '@/lib/mockData';

interface KasirTopBarProps {
  onOpenDrawer: () => void;
}

export default function KasirTopBar({ onOpenDrawer }: KasirTopBarProps) {
  return (
    <header
      id="kasir-top-app-bar"
      className="fixed top-0 left-0 right-0 h-14 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between px-4 transition-colors"
    >
      {/* Left: Hamburger Menu Button */}
      <div className="flex items-center gap-2">
        <button
          id="kasir-hamburger-btn"
          type="button"
          onClick={onOpenDrawer}
          aria-label="Buka Menu Kasir"
          className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Store Name Minimal for Mobile */}
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
            TB Mitra Bangunan
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            POS Kasir Mobile
          </span>
        </div>
      </div>

      {/* Center/Right: Informasi "Shift Aktif" & Dark Mode */}
      <div className="flex items-center gap-2">
        {/* Shift Aktif Badge */}
        <div
          id="kasir-shift-badge"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-tight">Shift Aktif</span>
          <span className="hidden xs:inline text-slate-400 dark:text-slate-500 font-normal">|</span>
          <span className="hidden xs:inline text-slate-600 dark:text-slate-300 font-medium">
            {MOCK_ACTIVE_SHIFT.cashierName.split(' ')[0]}
          </span>
        </div>

        {/* Dark Mode Toggle */}
        <ThemeToggle className="p-1.5" />
      </div>
    </header>
  );
}
