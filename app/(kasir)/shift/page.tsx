'use client';

import React, { useState } from 'react';
import {
  Clock,
  User,
  Wallet,
  Receipt,
  QrCode,
  Banknote,
  Printer,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { MOCK_ACTIVE_SHIFT } from '@/lib/mockData';

export default function KasirShiftPage() {
  const shift = MOCK_ACTIVE_SHIFT;
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [isShiftClosed, setIsShiftClosed] = useState<boolean>(false);

  const actualCash = parseFloat(actualCashInput) || 0;
  const discrepancy = actualCash - shift.expectedCash;

  const handleCloseShift = () => {
    if (!actualCashInput) {
      alert('Silakan masukkan jumlah uang fisik di laci kasir terlebih dahulu!');
      return;
    }
    setIsShiftClosed(true);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Shift Header Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              SR
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {shift.cashierName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shift Pagi • Mulai 07:30 WIB
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Aktif</span>
          </span>
        </div>

        {/* Modal Kas Awal */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Modal Kas Awal:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            Rp {shift.startingCash.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Ringkasan Penjualan Shift */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Ringkasan Penjualan Shift Ini
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Banknote className="h-4 w-4 text-emerald-600" />
              <span>Penjualan Tunai (Cash)</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Rp {shift.cashSales.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <QrCode className="h-4 w-4 text-blue-600" />
              <span>Penjualan QRIS / Transfer</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Rp {shift.qrisSales.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Receipt className="h-4 w-4 text-amber-600" />
              <span>Penjualan Tempo (Piutang)</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Rp {shift.tempoSales.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Total Omset Shift:
          </span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
            Rp {shift.totalSales.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Rekonsiliasi Kas Laci & Tutup Shift */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Uang Kas Fisik di Laci
        </h3>

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60">
          <span className="text-[11px] text-amber-800 dark:text-amber-300 block">
            Target Fisik Laci (Modal + Tunai):
          </span>
          <span className="text-lg font-bold text-amber-900 dark:text-amber-200 font-mono">
            Rp {shift.expectedCash.toLocaleString('id-ID')}
          </span>
        </div>

        {!isShiftClosed ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hitung Fisik Uang Kas:
              </label>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                placeholder={`Contoh: ${shift.expectedCash}`}
                className="w-full py-2 px-3 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            {actualCashInput && (
              <div
                className={`p-2 rounded-xl text-xs flex items-center justify-between font-semibold ${
                  discrepancy === 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : discrepancy > 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                <span>Selisih Kas:</span>
                <span className="font-mono">
                  {discrepancy === 0
                    ? 'Pas (Rp 0)'
                    : `${discrepancy > 0 ? '+ ' : '- '} Rp ${Math.abs(
                        discrepancy
                      ).toLocaleString('id-ID')}`}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCloseShift}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Tutup Shift & Cetak Rekap</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Shift Berhasil Ditutup & Dicetak!
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Rekapitulasi setoran kasir telah dikirimkan ke Dashboard Admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
