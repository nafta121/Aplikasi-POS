'use client';

import React, { useState } from 'react';
import KasirTopBar from './KasirTopBar';
import KasirBottomNav from './KasirBottomNav';
import KasirDrawer from './KasirDrawer';
import DeviceFrameToggle from '@/components/common/DeviceFrameToggle';
import PageTransition from '@/components/common/PageTransition';

export default function KasirLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start antialiased selection:bg-amber-500 selection:text-white">
      {/* Top Floating Switcher (on PC) to switch between Admin & Kasir */}
      <DeviceFrameToggle />

      {/* Mobile Container wrapper (centers nicely on larger desktop screens to simulate phone/tablet) */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 dark:bg-[#0b0f19] shadow-2xl relative flex flex-col border-x border-slate-200/80 dark:border-slate-800/80">
        {/* 1. Top App Bar (h-14) */}
        <KasirTopBar onOpenDrawer={() => setIsDrawerOpen(true)} />

        {/* 2. Main Content Area: Scrollable dengan padding menyesuaikan (pt-14 pb-20) */}
        <main
          id="kasir-main-content"
          className="flex-1 overflow-y-auto pt-14 pb-20 px-3.5 sm:px-4 transition-colors"
        >
          <PageTransition className="pt-2">
            {children}
          </PageTransition>
        </main>

        {/* 3. Bottom Navigation Bar (h-16) Fixed di bagian bawah */}
        <KasirBottomNav />

        {/* Kasir Sliding Drawer */}
        <KasirDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
