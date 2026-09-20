'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  Settings,
  HardHat,
  LogOut,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { logout } from '@/app/login/actions';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    badge: '3 Kritis',
    badgeColor: 'bg-rose-500 text-white',
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: Receipt,
    badge: 'Tempo 1',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      id="admin-sidebar"
      className="w-64 flex-shrink-0 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 select-none"
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
          <HardHat className="h-6 w-6 text-slate-950 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base tracking-tight text-white truncate">
            Mitra Bangunan
          </span>
          <span className="text-[11px] font-medium text-amber-400/90 tracking-wide uppercase">
            Admin & Inventaris
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              id={`admin-nav-${item.name.toLowerCase()}`}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-slate-950 stroke-[2.2]'
                      : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>

              {item.badge ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                isActive && (
                  <ChevronRight className="h-4 w-4 text-slate-950 stroke-[2.5]" />
                )
              )}
            </Link>
          );
        })}
      </div>

      {/* Stock Critical Notice */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
          <AlertTriangle className="h-4 w-4" />
          <span>Peringatan Stok</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Semen Gresik & Besi 12mm berada di bawah batas minimum gudang.
        </p>
      </div>

      {/* User Logout Button */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <form action={logout}>
          <button
            id="admin-logout-btn"
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
