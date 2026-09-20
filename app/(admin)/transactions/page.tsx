'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';

export default function AdminTransactionsPage() {
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const filtered = MOCK_TRANSACTIONS.filter((trx) => {
    if (filterPayment === 'all') return true;
    return trx.paymentMethod === filterPayment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Riwayat Transaksi & Piutang
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar faktur kasir, pembayaran tunai, QRIS, dan tempo proyek pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'cash', 'qris', 'tempo'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterPayment(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                filterPayment === type
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'all' ? 'Semua' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((trx) => (
          <div
            key={trx.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                      {trx.invoiceNumber}
                    </span>
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
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Kasir: {trx.cashierName} • Pelanggan: {trx.customerName || 'Umum'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase">Total Tagihan</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    Rp {trx.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Mencetak struk untuk nota ${trx.invoiceNumber}`)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Cetak Struk"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Items list breakdown */}
            <div className="mt-3 pt-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Rincian Barang Material:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {trx.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate mr-2">
                      {item.productName} ({item.quantity} {item.unit})
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
