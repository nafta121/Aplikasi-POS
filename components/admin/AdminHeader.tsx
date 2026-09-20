'use client';

import React, { useState } from 'react';
import { Search, Bell, MapPin, Store } from 'lucide-react';
import ThemeToggle from '@/context/../components/common/ThemeToggle';

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      id="admin-header"
      className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors z-20"
    >
      {/* Global Search Bar */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="admin-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU, nama material (semen, cat, besi), atau faktur..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-200/80 dark:bg-slate-700/80 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Header Actions: Branch Info, Dark Mode, Notifications, User Profile */}
      <div className="flex items-center gap-3 ml-4">
        {/* Branch Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Store className="h-3.5 w-3.5 text-amber-500" />
          <span>Toko Utama (Pusat)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          id="admin-notifications-btn"
          type="button"
          aria-label="Notifikasi"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Profile Card */}
        <div
          id="admin-user-profile"
          className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
            BS
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              Budi Santoso
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Owner / Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
