'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';

export default function DeviceFrameToggle() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/dashboard') || 
                  pathname.startsWith('/inventory') || 
                  pathname.startsWith('/transactions') || 
                  pathname.startsWith('/employees') || 
                  pathname.startsWith('/settings');
  const isKasir = pathname.startsWith('/pos') || 
                  pathname.startsWith('/stock') || 
                  pathname.startsWith('/shift');

  return (
    <div
      id="device-frame-toggle-bar"
      className="fixed top-2 right-4 z-50 hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full shadow-lg text-xs"
    >
      <span className="text-slate-400 font-medium mr-1 select-none">Tampilan:</span>
      
      <Link
        id="switch-to-admin-link"
        href="/dashboard"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all ${
          isAdmin
            ? 'bg-amber-500 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        <span>Admin (PC)</span>
      </Link>

      <Link
        id="switch-to-kasir-link"
        href="/pos"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all ${
          isKasir
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" />
        <span>Kasir (PWA Mobile)</span>
      </Link>
    </div>
  );
}
