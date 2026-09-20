import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DeviceFrameToggle from '@/components/common/DeviceFrameToggle';
import PageTransition from '@/components/common/PageTransition';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Quick Switcher Tool to Jump Between Desktop Admin and Kasir Mobile PWA */}
      <DeviceFrameToggle />

      {/* 1. Left Sidebar Statis (w-64) */}
      <AdminSidebar />

      {/* Right Area: Header + Main Content */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* 2. Top Header (h-16) */}
        <AdminHeader />

        {/* 3. Main Content Area (Responsif untuk PC) */}
        <main
          id="admin-main-content"
          className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-[#0b0f19] transition-colors"
        >
          <div className="max-w-7xl mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
