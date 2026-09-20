'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, PackageSearch, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface NavTab {
  name: string;
  href: string;
  icon: React.ElementType;
  emoji: string;
}

const KASIR_TABS: NavTab[] = [
  {
    name: 'POS',
    href: '/pos',
    icon: ShoppingCart,
    emoji: '🛒',
  },
  {
    name: 'Cek Stok',
    href: '/cek-stok',
    icon: PackageSearch,
    emoji: '📦',
  },
  {
    name: 'Shift',
    href: '/shift',
    icon: Clock,
    emoji: '⏱️',
  },
];

export default function KasirBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      id="kasir-bottom-nav"
      aria-label="Navigasi Kasir Mobile"
      className="fixed bottom-0 left-0 right-0 h-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg select-none"
    >
      <div className="max-w-md mx-auto h-full grid grid-cols-3 items-center px-3">
        {KASIR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.name}
              id={`kasir-tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              href={tab.href}
              className="relative flex flex-col items-center justify-center h-full py-1 group focus:outline-none"
            >
              {/* Active Tab Background Indicator Animation */}
              {isActive && (
                <motion.div
                  layoutId="kasir-active-pill"
                  className="absolute inset-x-2 top-1.5 bottom-1.5 bg-amber-500/10 dark:bg-amber-400/15 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <div
                className={`relative flex items-center justify-center transition-transform duration-150 group-active:scale-90 ${
                  isActive ? '-translate-y-0.5' : ''
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-amber-600 dark:text-amber-400 stroke-[2.4]'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
              </div>

              <span
                className={`text-[11px] mt-1 font-medium transition-colors ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.name} <span className="text-[10px] opacity-80">{tab.emoji}</span>
              </span>

              {/* Active Dot indicator */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
