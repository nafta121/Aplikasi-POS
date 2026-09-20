'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  Users,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_ACTIVE_SHIFT } from '@/lib/mockData';

export default function AdminDashboardPage() {
  const lowStockItems = MOCK_PRODUCTS.filter((p) => p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Utama
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Ikhtisar operasional toko bangunan, pergerakan stok material, dan kasir harian.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Material</span>
          </Link>

          <button
            type="button"
            onClick={() => alert('Fitur Ekspor Laporan Excel/PDF siap dikonfigurasi.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Ekspor Laporan</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards: Mobile (1 kol), Tablet (2 kol), Desktop (4 kol) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Omset Hari Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Omset Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            Rp {MOCK_ACTIVE_SHIFT.totalSales.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+14.2% dari kemarin</span>
          </div>
        </div>

        {/* Metric 2: Total Transaksi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Transaksi Selesai
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            18 Nota
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Kasir: Siti Rahma (Shift Pagi)
          </div>
        </div>

        {/* Metric 3: Stok Kritis */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Stok Kritis Gudang
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {lowStockItems.length} Material
          </div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
          >
            <span>Lihat daftar restock</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Metric 4: Piutang Proyek */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Piutang Proyek (Tempo)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            Rp 2.060.000
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            1 Faktur jatuh tempo 14 hari
          </div>
        </div>
      </div>

      {/* 2-Column Section: Stok Kritis & Transaksi Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tabel Material & Stok Kritis */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Material Perlu Restock
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Barang dengan jumlah di bawah batas stok pengaman gudang.
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Semua Inventaris →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Material</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Sisa Stok</th>
                  <th className="py-2.5 px-3 text-center">Min. Stok</th>
                  <th className="py-2.5 px-3 text-right">Harga Jual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockItems.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {prod.name}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {prod.sku} • {prod.location}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {prod.category}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                        {prod.stock} {prod.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-slate-500 dark:text-slate-400">
                      {prod.minStock} {prod.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900 dark:text-white">
                      Rp {prod.sellingPrice.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Transaksi Terbaru Kasir */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Transaksi Terkini
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Lihat Riwayat →
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {MOCK_TRANSACTIONS.map((trx) => (
              <div
                key={trx.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {trx.invoiceNumber}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {trx.customerName || 'Pembeli Umum'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      trx.paymentMethod === 'tempo'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {trx.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {trx.items.length} item material
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Rp {trx.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
