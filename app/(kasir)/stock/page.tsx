'use client';

import React, { useState } from 'react';
import {
  PackageSearch,
  Search,
  ScanBarcode,
  MapPin,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export default function KasirStockCheckPage() {
  const [query, setQuery] = useState('');

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode.includes(query)
  );

  return (
    <div className="space-y-3">
      {/* Title & Barcode Scanner Button */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            Cek Stok Material
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencarian cepat lokasi rak & sisa stok gudang.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Simulasi Barcode Scanner Kamera diaktifkan!')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xs"
        >
          <ScanBarcode className="h-4 w-4 text-amber-400" />
          <span>Scan</span>
        </button>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik nama semen, besi, pipa, barcode..."
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none shadow-2xs"
        />
      </div>

      {/* Material Stock List */}
      <div className="space-y-2.5 pb-20">
        {filtered.map((prod) => {
          const isCritical = prod.stock <= prod.minStock;

          return (
            <div
              key={prod.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                    {prod.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {prod.sku} • {prod.barcode}
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    isCritical
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {isCritical ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  <span>
                    {prod.stock} {prod.unit}
                  </span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span>{prod.location}</span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    Rp {prod.sellingPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400"> /{prod.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
