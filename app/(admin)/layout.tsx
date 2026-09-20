'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import PageTransition from '@/components/common/PageTransition';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 relative">
      {/* Overlay Backdrop transparan/gelap di belakang sidebar saat terbuka di mode Mobile/Tablet */}
      {isSidebarOpen && (
        <div
          id="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* 1. Left Sidebar:
          - Desktop (lg ke atas): Statis w-64 di sebelah kiri
          - Mobile & Tablet (< lg): Tersembunyi (-translate-x-full) dan muncul sebagai sliding drawer
      */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Right Area: Header + Main Content */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* 2. Top Header (h-16) dengan tombol Hamburger Menu di Mobile */}
        <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* 3. Main Content Area (Responsif untuk Mobile, Tablet & Desktop) */}
        <main
          id="admin-main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-[#0b0f19] transition-colors"
        >
          <div className="max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
