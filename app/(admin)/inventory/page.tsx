'use client';

import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Boxes,
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { Product } from '@/types';

export default function AdminInventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [search, setSearch] = useState<string>('');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const filtered = products.filter((item) => {
    const matchCat =
      selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventaris & Master Material
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data stok material bangunan, harga modal, harga jual, dan lokasi rak.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Modal Tambah Material Baru dapat dibuka di sini.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Material Baru</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama semen, besi, cat, pipa, atau SKU..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {['Semua', ...MOCK_CATEGORIES.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Kode & Nama Material</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Lokasi Gudang</th>
                <th className="py-3 px-3 text-right">Harga Modal</th>
                <th className="py-3 px-3 text-right">Harga Jual</th>
                <th className="py-3 px-3 text-center">Status Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => {
                const isCritical = item.stock <= item.minStock;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span>Barcode: {item.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-xs text-slate-500 dark:text-slate-400">
                      {item.location}
                    </td>

                    <td className="py-3.5 px-3 text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                      Rp {item.costPrice.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-3 text-right font-bold font-mono text-slate-900 dark:text-white">
                      Rp {item.sellingPrice.toLocaleString('id-ID')}
                      <span className="text-[11px] font-normal text-slate-400">
                        {' '}/{item.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isCritical
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {isCritical ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        <span>
                          {item.stock} {item.unit}
                        </span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          alert(`Buka dialog edit atau restock untuk ${item.name}`)
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
