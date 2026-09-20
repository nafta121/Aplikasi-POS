'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Monitor,
  Clock,
  Wallet,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import PWAInstallButton from '@/components/common/PWAInstallButton';
import { MOCK_ACTIVE_SHIFT } from '@/lib/mockData';
import { logout } from '@/app/login/actions';

interface KasirDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KasirDrawer({ isOpen, onClose }: KasirDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                  SR
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {MOCK_ACTIVE_SHIFT.cashierName}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Kasir Shift Pagi Aktif
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shift Quick Metrics */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/80">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Ringkasan Kas Laci
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Modal Awal:</span>
                  <span className="font-semibold">
                    Rp {MOCK_ACTIVE_SHIFT.startingCash.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Penjualan Tunai:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Rp {MOCK_ACTIVE_SHIFT.cashSales.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-800 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-800 font-bold">
                  <span>Total Kas Laci:</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    Rp {MOCK_ACTIVE_SHIFT.expectedCash.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {/* PWA Install Button inside Drawer */}
              <div className="pb-1">
                <PWAInstallButton variant="full" />
              </div>

              <Link
                href="/shift"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Detail & Rekap Shift</span>
              </Link>

              <form action={logout} className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Keluar Akun (Logout)</span>
                </button>
              </form>
            </div>

            {/* Drawer Footer: Theme & Info */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Mode Gelap / Terang
                </span>
                <ThemeToggle />
              </div>
              <p className="mt-3 text-[10px] text-center text-slate-400 dark:text-slate-500">
                TB Mitra Bangunan v1.0 • PWA Mobile Kasir
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
