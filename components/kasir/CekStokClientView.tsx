'use client';

import React, { useState } from 'react';
import {
  PackageSearch,
  Search,
  ScanBarcode,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Layers,
  ArrowRight,
  Database,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export interface StockMaterialItem {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  baseUnit: string;
  location: string;
  warehouseType?: string;
  units: {
    name: string;
    price: number;
    multiplier: number;
  }[];
}

interface CekStokClientViewProps {
  initialMaterials: StockMaterialItem[];
  isFromSupabase: boolean;
  dbError?: string | null;
}

export default function CekStokClientView({
  initialMaterials,
  isFromSupabase,
  dbError,
}: CekStokClientViewProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'safe'>('all');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  const categories = [
    'Semua',
    ...Array.from(new Set(initialMaterials.map((m) => m.category))).filter(Boolean),
  ];

  const filtered = initialMaterials.filter((prod) => {
    const matchCat =
      categoryFilter === 'Semua' || prod.category === categoryFilter;

    const matchQuery =
      prod.name.toLowerCase().includes(query.toLowerCase()) ||
      prod.sku.toLowerCase().includes(query.toLowerCase()) ||
      (prod.barcode && prod.barcode.toLowerCase().includes(query.toLowerCase())) ||
      prod.location.toLowerCase().includes(query.toLowerCase());

    const isCritical = prod.stock <= prod.minStock;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'critical'
        ? isCritical
        : !isCritical;

    return matchCat && matchQuery && matchStatus;
  });

  const criticalCount = initialMaterials.filter(
    (m) => m.stock <= m.minStock
  ).length;

  return (
    <div className="space-y-3.5 pb-24">
      {/* Title & Barcode Scanner Button */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Cek Stok &amp; Lokasi Rak</span>
            {isFromSupabase && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Live DB
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencarian cepat sisa stok gudang dan lokasi rak fisik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (initialMaterials.length > 0) {
              setQuery(initialMaterials[0].sku);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
        >
          <ScanBarcode className="h-4 w-4 text-amber-400" />
          <span>Scan</span>
        </button>
      </div>

      {dbError && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
          Info Supabase: {dbError}
        </div>
      )}

      {/* Quick Summary Pill Badges */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-2 rounded-2xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'border-amber-500 bg-amber-500/15 text-slate-950 dark:text-white ring-2 ring-amber-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
          }`}
        >
          <div className="text-[10px] text-slate-400">Total Material</div>
          <div className="text-sm font-extrabold font-mono">{initialMaterials.length}</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('critical')}
          className={`p-2 rounded-2xl border text-left transition-all ${
            statusFilter === 'critical'
              ? 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
          }`}
        >
          <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Stok Kritis</span>
          </div>
          <div className="text-sm font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {criticalCount} Item
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('safe')}
          className={`p-2 rounded-2xl border text-left transition-all ${
            statusFilter === 'safe'
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
          }`}
        >
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Stok Aman</span>
          </div>
          <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {initialMaterials.length - criticalCount} Item
          </div>
        </button>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          id="stock-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ketik nama semen, besi, pipa, barcode, atau rak..."
          className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none shadow-2xs placeholder-slate-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Material Stock List */}
      <div className="space-y-2.5">
        {initialMaterials.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <PackageSearch className="h-10 w-10 text-amber-500/70 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Katalog Material Belum Terdaftar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Database Supabase saat ini belum memiliki data di view{' '}
                <code className="px-1 rounded bg-slate-100 dark:bg-slate-800 text-amber-600 font-mono text-[11px]">
                  pos_catalog_view
                </code>.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-xs hover:bg-amber-400"
              >
                <span>Input Material di Admin</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
            <Layers className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Material Tidak Ditemukan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tidak ada material cocok dengan filter saat ini.
            </p>
          </div>
        ) : (
          filtered.map((prod) => {
            const isCritical = prod.stock <= prod.minStock;

            return (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-amber-400 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {prod.sku}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {prod.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                      {prod.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap font-mono ${
                      isCritical
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {prod.stock} {prod.baseUnit}
                    </span>
                  </span>
                </div>

                {/* Lokasi Rak Fisik / Gudang */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                    <span className="font-medium">{prod.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <span>Min Alert: {prod.minStock} {prod.baseUnit}</span>
                  </div>
                </div>

                {/* Variasi Harga Jual Multi-Satuan */}
                {prod.units.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5">
                    {prod.units.map((u) => (
                      <span
                        key={u.name}
                        className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono border border-slate-200/60 dark:border-slate-700"
                      >
                        {u.name}:{' '}
                        <strong className="text-amber-600 dark:text-amber-400 font-bold">
                          Rp {u.price.toLocaleString('id-ID')}
                        </strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
