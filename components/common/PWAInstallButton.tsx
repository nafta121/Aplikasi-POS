'use client';

import React, { useState } from 'react';
import { Download, Share, PlusSquare, CheckCircle, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function PWAInstallButton({
  className = '',
  variant = 'compact',
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed in standalone mode, show clean installed badge if full, or hide if compact
  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-semibold ${className}`}>
          <CheckCircle className="h-4 w-4" />
          <span>PWA Terpasang (Standalone)</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    await install();
  };

  return (
    <>
      <button
        id="pwa-install-app-btn"
        type="button"
        onClick={handleClick}
        className={
          variant === 'full'
            ? `w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all ${className}`
            : `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all ${className}`
        }
      >
        <Download className="h-4 w-4" />
        <span>Install Aplikasi POS</span>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-amber-500" />
                <span>Pasang di iPhone / iPad</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Untuk memasang Aplikasi Kasir di layar utama iOS Safari:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <Share className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>1. Ketuk tombol <strong>Bagikan (Share)</strong> di bar navigasi bawah Safari.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <PlusSquare className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>2. Gulir ke bawah lalu pilih <strong>&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong>.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
