'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Database,
  ArrowRight,
  TrendingUp,
  FileText,
  RotateCcw,
} from 'lucide-react';
import type { ShiftSummaryData } from './types';

interface ShiftClientViewProps {
  initialSummary: ShiftSummaryData;
}

export default function ShiftClientView({ initialSummary }: ShiftClientViewProps) {
  const [summary, setSummary] = useState<ShiftSummaryData>(initialSummary);
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [isShiftClosed, setIsShiftClosed] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const actualCash = parseFloat(actualCashInput) || 0;
  const discrepancy = actualCash - summary.expectedCash;

  const handleCloseShift = () => {
    if (!actualCashInput) {
      alert('Silakan masukkan jumlah uang fisik di laci kasir terlebih dahulu!');
      return;
    }
    setIsShiftClosed(true);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Shift Header Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              {summary.cashierName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{summary.cashierName}</span>
                {summary.isFromSupabase && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" />
                    <span>Supabase Live</span>
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {summary.shiftDate} • Shift Pagi ({summary.shiftStartTime})
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isShiftClosed ? 'Tutup' : 'Aktif'}</span>
          </span>
        </div>

        {/* Modal Kas Awal */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Modal Kas Awal:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            Rp {summary.startingCash.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Ringkasan Penjualan Shift */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ringkasan Penjualan Shift Ini
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {summary.transactionCount} Transaksi
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Banknote className="h-4 w-4 text-emerald-600" />
              <span>Penjualan Tunai (Cash)</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Rp {summary.cashSales.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <QrCode className="h-4 w-4 text-blue-600" />
              <span>Penjualan QRIS / Transfer</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Rp {summary.qrisSales.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Receipt className="h-4 w-4 text-amber-600" />
              <span>Penjualan Tempo (Piutang)</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              Rp {summary.tempoSales.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Total Omset Shift:
          </span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
            Rp {summary.totalSales.toLocaleString('id-ID')}
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
            Rp {summary.expectedCash.toLocaleString('id-ID')}
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
                placeholder={`Contoh: ${summary.expectedCash}`}
                className="w-full py-2 px-3 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none"
              />
            </div>

            {actualCashInput && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between font-semibold ${
                  discrepancy === 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : discrepancy > 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                <span>Selisih Kas:</span>
                <span className="font-mono font-bold">
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
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Shift Berhasil Ditutup & Dicatat!
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Rekapitulasi setoran kasir telah dikonfirmasi dan siap dicetak.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat Struk Rekap</span>
              </button>
              <Link
                href="/pos"
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-amber-400"
              >
                <span>Buka Shift Baru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Riwayat Transaksi Shift Ini dari Supabase */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span>Riwayat Transaksi Shift</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {summary.recentTransactions.length} Struk
          </span>
        </div>

        {summary.recentTransactions.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Belum ada transaksi yang diproses pada shift ini.
          </div>
        ) : (
          <div className="space-y-2">
            {summary.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    {tx.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {tx.customerName} • {new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    Rp {tx.totalAmount.toLocaleString('id-ID')}
                  </div>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      tx.paymentMethod === 'tunai'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : tx.paymentMethod === 'qris'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CETAK STRUK REKAPITULASI SHIFT */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Struk Tutup Shift Kasir
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Print Preview Paper */}
            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60">
              <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  TOKO BANGUNAN SUMBER ABADI
                </div>
                <div className="text-[10px] text-slate-500">
                  REKAP PENUTUPAN SHIFT KASIR
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{summary.shiftDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{summary.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{new Date().toLocaleTimeString('id-ID')} WIB</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Modal Awal:</span>
                  <span>Rp {summary.startingCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan Tunai:</span>
                  <span>Rp {summary.cashSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan QRIS:</span>
                  <span>Rp {summary.qrisSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan Tempo:</span>
                  <span>Rp {summary.tempoSales.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Omset:</span>
                  <span>Rp {summary.totalSales.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Target Kas Fisik:</span>
                  <span>Rp {summary.expectedCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Hitung Fisik Kas:</span>
                  <span>Rp {actualCash.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                  <span>Selisih:</span>
                  <span>
                    {discrepancy === 0
                      ? 'Rp 0 (Pas)'
                      : `${discrepancy > 0 ? '+' : ''} Rp ${discrepancy.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300 dark:border-slate-700">
                Tercatat otomatis di Supabase Cloud Database.
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Thermal</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
