'use client';

import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Banknote,
  QrCode,
  Clock,
  UserCheck,
  Calendar,
  X,
  ScanBarcode,
  Printer,
  Layers,
  ArrowRight,
  HardHat,
  RotateCcw,
  Loader2,
  Database,
  RefreshCw,
  PackageOpen,
} from 'lucide-react';
import Link from 'next/link';
import {
  type POSProduct,
  type POSCartItem,
  type CompletedTransaction,
} from '@/utils/supabase/pos';
import { processCheckoutAction } from './actions';

// Mock Data Nama Kontraktor / Mandor Langganan untuk opsi Tempo
const CONTRACTOR_SUGGESTIONS: string[] = [
  'CV Karya Mandiri Sejahtera',
  'PT Cipta Graha Utama',
  'Pak Budi Handoko (Mandor Sukolilo)',
  'H. Ridwan (Renovasi Masjid Al-Hikmah)',
  'Pak Yanto (Tukang Proyek Asri)',
  'PT Sinar Jaya Konstruksi',
  'Ibu Dewi Lestari (Ruko Citra 3)',
  'Cak Agus (Mandor Perumahan Nirwana)',
];

const CATEGORIES = [
  'Semua',
  'Material Dasar',
  'Pipa & Sanitari',
  'Cat & Kimia',
  'Besi & Baja',
  'Keramik & Lantai',
  'Perkakas & Alat',
];

// Helper kalkulasi tanggal masa depan
function calculateFutureDateString(daysToAdd: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface POSClientViewProps {
  initialProducts: POSProduct[];
  isFromSupabase: boolean;
  dbError?: string | null;
}

export default function POSClientView({
  initialProducts,
  isFromSupabase,
  dbError,
}: POSClientViewProps) {
  // State Data Produk dari Supabase (tanpa fallback mock data)
  const [products] = useState<POSProduct[]>(initialProducts);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState<boolean>(false);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // State Pilihan Unit Aktif per Produk: { [productId]: unitName }
  const [activeUnits, setActiveUnits] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    initialProducts.forEach((p) => {
      initial[p.id] = p.units[0]?.name || p.baseUnit;
    });
    return initial;
  });

  // State Keranjang Belanja
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);

  // State Metode Pembayaran & Form Checkout
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'tempo'>('cash');
  const [cashPaidInput, setCashPaidInput] = useState<string>('');

  // Form Khusus Opsi [Tempo / Kredit Proyek]
  const [selectedContractor, setSelectedContractor] = useState<string>('');
  const [downPaymentInput, setDownPaymentInput] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => calculateFutureDateString(14));

  // Modal Struk / Nota Transaksi Berhasil
  const [completedTransaction, setCompletedTransaction] = useState<CompletedTransaction | null>(null);

  // Counter transaksi lokal untuk invoice number
  const [transactionCount, setTransactionCount] = useState(108);

  // Ganti satuan aktif untuk produk tertentu
  const handleSelectUnit = (productId: string, unitName: string) => {
    setActiveUnits((prev) => ({
      ...prev,
      [productId]: unitName,
    }));
  };

  // Tambah item ke keranjang dengan satuan yang dipilih
  const handleAddToCart = (product: POSProduct) => {
    const currentUnitName = activeUnits[product.id] || product.units[0]?.name || product.baseUnit;
    const unitObj =
      product.units.find((u) => u.name === currentUnitName) || product.units[0];

    const cartItemId = `${product.id}-${unitObj.name}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * unitObj.price,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedUnit: unitObj,
          quantity: 1,
          subtotal: unitObj.price,
        },
      ];
    });
  };

  // Update kuantitas item dalam keranjang
  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.selectedUnit.price,
            };
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  // Hapus item dari keranjang
  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Perhitungan Keuangan
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Perhitungan Pembayaran Tunai
  const cashPaidNumber = parseFloat(cashPaidInput) || 0;
  const changeAmount = Math.max(0, cashPaidNumber - totalAmount);

  // Perhitungan Pembayaran Tempo (DP & Sisa Piutang)
  const downPaymentNumber = parseFloat(downPaymentInput) || 0;
  const remainingCredit = Math.max(0, totalAmount - downPaymentNumber);

  // Preset shortcut penambahan tanggal jatuh tempo
  const handleSetDuePreset = (days: number) => {
    setDueDate(calculateFutureDateString(days));
  };

  // Validasi dan Penyelesaian Transaksi (Insert ke Supabase + Struk Nota)
  const handleProcessTransaction = async () => {
    if (cart.length === 0 || isSubmittingCheckout) return;

    if (paymentMethod === 'cash') {
      if (cashPaidNumber < totalAmount) {
        alert('Nominal uang tunai yang diterima kurang dari total belanja!');
        return;
      }
    }

    if (paymentMethod === 'tempo') {
      if (!selectedContractor.trim()) {
        alert('Harap pilih atau masukkan nama kontraktor/pelanggan untuk transaksi tempo!');
        return;
      }
      if (!dueDate) {
        alert('Harap tentukan tanggal jatuh tempo pembayaran proyek!');
        return;
      }
    }

    setIsSubmittingCheckout(true);
    const nextCount = transactionCount + 1;
    setTransactionCount(nextCount);

    try {
      const checkoutResult = await processCheckoutAction(cart, paymentMethod, {
        customerName:
          paymentMethod === 'tempo' ? selectedContractor : 'Pelanggan Umum',
        cashPaid: paymentMethod === 'cash' ? cashPaidNumber : 0,
        dpAmount: paymentMethod === 'tempo' ? downPaymentNumber : 0,
        dueDate: paymentMethod === 'tempo' ? dueDate : undefined,
        notes:
          paymentMethod === 'tempo'
            ? `Nota Tempo Proyek - Sisa Rp ${remainingCredit.toLocaleString('id-ID')}`
            : undefined,
      });

      const invoiceNum =
        checkoutResult.invoiceNumber ||
        `TB-INV-2026-${String(nextCount).padStart(4, '0')}`;

      const finalTrx: CompletedTransaction = {
        invoiceNumber: invoiceNum,
        createdAt: new Date().toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        items: [...cart],
        totalAmount,
        paymentMethod,
        cashPaid: paymentMethod === 'cash' ? cashPaidNumber : undefined,
        change: paymentMethod === 'cash' ? changeAmount : undefined,
        contractorName:
          paymentMethod === 'tempo' ? selectedContractor : undefined,
        downPayment: paymentMethod === 'tempo' ? downPaymentNumber : undefined,
        remainingCredit:
          paymentMethod === 'tempo' ? remainingCredit : undefined,
        dueDate: paymentMethod === 'tempo' ? dueDate : undefined,
        savedToDatabase: checkoutResult.success,
      };

      setCompletedTransaction(finalTrx);
      setCart([]);
      setIsCheckoutDrawerOpen(false);
      resetCheckoutForm();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Terjadi kesalahan saat memproses transaksi checkout.');
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const resetCheckoutForm = () => {
    setPaymentMethod('cash');
    setCashPaidInput('');
    setDownPaymentInput('');
    setSelectedContractor('');
  };

  // Filter daftar produk
  const filteredProducts = products.filter((prod) => {
    const matchCat =
      selectedCategory === 'Semua' || prod.category === selectedCategory;
    const matchQuery =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.barcode && prod.barcode.includes(searchQuery));
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-md mx-auto space-y-3.5 pb-28">
      {/* ==================================================== */}
      {/* HEADER: PENCARIAN CEPAT & SCAN BARCODE KAMERA       */}
      {/* ==================================================== */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="pos-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari semen, pipa, cat, paku..."
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none shadow-2xs placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            id="pos-scan-barcode-btn"
            type="button"
            onClick={() => {
              if (products.length > 0) {
                setSearchQuery(products[0].sku);
              }
            }}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 active:scale-95 transition-all"
            title="Scan Barcode Kamera"
          >
            <ScanBarcode className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Scan</span>
          </button>
        </div>

        {/* Kategori Slider Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Indikator Status Data & Total Material */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            {isFromSupabase ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live pos_catalog_view
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Database className="h-3 w-3 text-slate-400" />
                Supabase Connected
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {filteredProducts.length} Material ({selectedCategory})
          </span>
        </div>

        {dbError && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            Catatan Supabase: {dbError}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* AREA DAFTAR PRODUK (MOBILE VIEW: MULTI-SATUAN CARDS) */}
      {/* ==================================================== */}
      <div className="space-y-3">
        {products.length === 0 ? (
          /* UI ELEGAN: KATALOG MATERIAL KOSONG */
          <div
            id="empty-catalog-state"
            className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 my-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <PackageOpen className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Katalog Material Kosong
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Belum ada produk terdaftar di database Supabase atau data pada view{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-600 font-mono text-[11px]">
                  pos_catalog_view
                </code>{' '}
                masih belum diisi.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                href="/inventory"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Kelola Inventaris Material</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Segarkan Halaman</span>
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Layers className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Material Tidak Ditemukan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tidak ada material cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const activeUnitName = activeUnits[prod.id] || prod.units[0]?.name || prod.baseUnit;
            const activeUnitObj =
              prod.units.find((u) => u.name === activeUnitName) || prod.units[0];

            const inCartItem = cart.find(
              (c) => c.id === `${prod.id}-${activeUnitObj.name}`
            );
            const isLowStock = prod.stock <= prod.minStock;

            return (
              <div
                key={prod.id}
                className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-3 relative group"
              >
                {/* Header Card: Kategori, SKU & Stok */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {prod.sku}
                      </span>
                      {prod.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Indikator Stok Gudang & Lokasi */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isLowStock
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLowStock ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                        }`}
                      />
                      {prod.stock} {prod.baseUnit}
                    </span>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {prod.location}
                    </div>
                  </div>
                </div>

                {/* Multi-Satuan Toggle Pills */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Pilih Satuan Penjualan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prod.units.map((unit) => {
                      const isSelected = unit.name === activeUnitName;
                      return (
                        <button
                          key={unit.name}
                          type="button"
                          onClick={() => handleSelectUnit(prod.id, unit.name)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all touch-manipulation flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs ring-2 ring-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span>{unit.name}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected
                                ? 'text-amber-300 dark:text-slate-900 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            Rp {unit.price.toLocaleString('id-ID')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Card: Harga Satuan Terpilih & Action Button */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-[10px] text-slate-400">
                      Harga per {activeUnitObj.name}:
                    </div>
                    <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                      Rp {activeUnitObj.price.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {inCartItem ? (
                    <div className="flex items-center gap-1 bg-amber-500 text-slate-950 rounded-2xl p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(inCartItem.id, -1)}
                        className="w-7 h-7 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 flex items-center justify-center font-bold text-slate-950 transition-colors cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs font-mono">
                        {inCartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(inCartItem.id, 1)}
                        className="w-7 h-7 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 flex items-center justify-center font-bold text-slate-950 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==================================================== */}
      {/* FLOATING CART BAR (TOUCH-FRIENDLY BOTTOM BAR)        */}
      {/* ==================================================== */}
      {cart.length > 0 && (
        <div
          id="floating-cart-bar"
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="p-3 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-2xl text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-900">
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Total Belanja:</div>
                <div className="text-sm font-extrabold text-amber-400 font-mono">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <button
              id="btn-open-checkout"
              type="button"
              onClick={() => setIsCheckoutDrawerOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Bayar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SLIDING CHECKOUT DRAWER (MOBILE-FIRST)               */}
      {/* ==================================================== */}
      {isCheckoutDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md mx-auto max-h-[92vh] bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            {/* Drawer Drag Handle & Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ringkasan &amp; Pembayaran
                </h3>
                <p className="text-[11px] text-slate-400">
                  {cart.length} jenis material ({totalItemsCount} item)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* List Item Belanja */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Daftar Belanjaan:
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <span>{item.quantity} {item.selectedUnit.name}</span>
                          <span>×</span>
                          <span>Rp {item.selectedUnit.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Belanja */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Total Tagihan:
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Pilihan Metode Pembayaran (Cash, QRIS, Tempo) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Metode Pembayaran:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Option 1: Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-amber-500 bg-amber-500/15 text-slate-950 dark:text-white font-bold ring-2 ring-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Banknote className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs">Tunai (Cash)</span>
                  </button>

                  {/* Option 2: QRIS */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'border-amber-500 bg-amber-500/15 text-slate-950 dark:text-white font-bold ring-2 ring-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <QrCode className="h-5 w-5 text-blue-500" />
                    <span className="text-xs">QRIS / Bank</span>
                  </button>

                  {/* Option 3: Tempo / Kredit */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tempo')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'tempo'
                        ? 'border-amber-500 bg-amber-500/15 text-slate-950 dark:text-white font-bold ring-2 ring-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HardHat className="h-5 w-5 text-amber-500" />
                    <span className="text-xs">Tempo (Proyek)</span>
                  </button>
                </div>
              </div>

              {/* Form Input Detail Pembayaran Sesuai Metode */}
              {paymentMethod === 'cash' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Uang Tunai Diterima:</span>
                    <button
                      type="button"
                      onClick={() => setCashPaidInput(String(totalAmount))}
                      className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      Uang Pas
                    </button>
                  </div>
                  <input
                    type="number"
                    value={cashPaidInput}
                    onChange={(e) => setCashPaidInput(e.target.value)}
                    placeholder={`Rp ${totalAmount.toLocaleString('id-ID')}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold focus:border-amber-500 focus:outline-none"
                  />

                  {/* Shortcut Pecahan Rupiah Cepat */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[50000, 100000, 200000, 500000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashPaidInput(String(val))}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500"
                      >
                        Rp {val.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>

                  {/* Info Kembalian */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Kembalian:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      Rp {changeAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'qris' && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center space-y-2">
                  <QrCode className="h-16 w-16 text-blue-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Tunjukkan QRIS Dinamis ke Pelanggan
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scan dengan BCA, Mandiri, BRI, GoPay, OVO, atau ShopeePay.
                  </p>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              )}

              {paymentMethod === 'tempo' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Nama Kontraktor / Mandor Langganan:
                    </label>
                    <input
                      type="text"
                      value={selectedContractor}
                      onChange={(e) => setSelectedContractor(e.target.value)}
                      placeholder="Ketik atau pilih nama kontraktor..."
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                    />

                    {/* Quick Contractor Selection Chips */}
                    <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                      {CONTRACTOR_SUGGESTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedContractor(c)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                            selectedContractor === c
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Uang Muka (DP) */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Uang Muka / DP (Opsional):
                    </label>
                    <input
                      type="number"
                      value={downPaymentInput}
                      onChange={(e) => setDownPaymentInput(e.target.value)}
                      placeholder="Rp 0 (Jika tanpa DP)"
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Tanggal Jatuh Tempo */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Jatuh Tempo Pembayaran:
                      </label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSetDuePreset(7)}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500"
                        >
                          +7 Hari
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetDuePreset(14)}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500"
                        >
                          +14 Hari
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetDuePreset(30)}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500"
                        >
                          +30 Hari
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Sisa Piutang Berjalan */}
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      Sisa Piutang Berjalan:
                    </span>
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 font-mono text-sm">
                      Rp {remainingCredit.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Action Buttons */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCheckoutDrawerOpen(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-checkout"
                type="button"
                disabled={isSubmittingCheckout}
                onClick={handleProcessTransaction}
                className="flex-[2] py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmittingCheckout ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selesaikan Transaksi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL STRUK / NOTA PENJUALAN THERMAL                 */}
      {/* ==================================================== */}
      {completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-5 shadow-2xl space-y-4 font-mono text-xs border border-slate-200">
            {/* Header Toko */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <div className="text-sm font-black tracking-wider uppercase">
                TOKO BANGUNAN SUMBER ABADI
              </div>
              <div className="text-[10px] text-slate-500">
                Jl. Raya Industri Bangunan No. 88, Sidoarjo
              </div>
              <div className="text-[10px] text-slate-500">
                Telp / WA: 0812-3456-7890
              </div>
            </div>

            {/* Meta Transaksi */}
            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold text-slate-900">{completedTransaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{completedTransaction.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Kasir Mobile (PWA)</span>
              </div>
              {completedTransaction.contractorName && (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>Kontraktor:</span>
                  <span>{completedTransaction.contractorName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-y border-dashed border-slate-300 space-y-2">
              {completedTransaction.items.map((it) => (
                <div key={it.id} className="space-y-0.5">
                  <div className="font-bold text-slate-900 truncate">
                    {it.product.name}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>
                      {it.quantity} {it.selectedUnit.name} × Rp {it.selectedUnit.price.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-slate-900">
                      Rp {it.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Pembayaran */}
            <div className="space-y-1.5 text-[11px] pt-1">
              <div className="flex justify-between font-extrabold text-sm">
                <span>TOTAL:</span>
                <span>Rp {completedTransaction.totalAmount.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Metode Bayar:</span>
                <span className="font-bold uppercase">
                  {completedTransaction.paymentMethod}
                </span>
              </div>

              {completedTransaction.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Tunai:</span>
                    <span>Rp {completedTransaction.cashPaid?.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Kembali:</span>
                    <span>Rp {completedTransaction.change?.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}

              {completedTransaction.paymentMethod === 'tempo' && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>DP Masuk:</span>
                    <span>Rp {completedTransaction.downPayment?.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-700">
                    <span>Sisa Piutang:</span>
                    <span>Rp {completedTransaction.remainingCredit?.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Jatuh Tempo:</span>
                    <span>{completedTransaction.dueDate}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Nota & Tombol Aksi */}
            <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300">
              Barang yang sudah dibeli tidak dapat ditukar/dikembalikan tanpa nota asli.
              <br />
              Terima Kasih atas Kepercayaan Anda!
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Nota</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedTransaction(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 hover:bg-amber-400 cursor-pointer"
              >
                <span>Transaksi Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
