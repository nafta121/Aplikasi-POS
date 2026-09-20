'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import {
  type POSProduct,
  type POSCartItem,
  type CompletedTransaction,
  type CatalogViewRow,
  groupCatalogRows,
  processCheckout,
} from '@/utils/supabase/pos';

// ==========================================
// 2. MOCK DATA TOKO BANGUNAN (MULTI-SATUAN)
// ==========================================
const MOCK_PRODUCTS: POSProduct[] = [
  {
    id: 'prod-smn-gresik',
    sku: 'SMN-GR-50',
    barcode: '8991234000101',
    name: 'Semen Gresik Portland Composite 50 Kg',
    category: 'Material Dasar',
    stock: 145,
    minStock: 30,
    baseUnit: 'Sak',
    location: 'Gudang Utama - Rak A1',
    badge: 'Best Seller',
    units: [
      { name: 'Sak', price: 52000, multiplier: 1 },
      { name: 'Kg', price: 1500, multiplier: 0.02 },
    ],
  },
  {
    id: 'prod-smn-tigarda',
    sku: 'SMN-TR-50',
    barcode: '8991234000102',
    name: 'Semen Tiga Roda Portland 50 Kg',
    category: 'Material Dasar',
    stock: 24,
    minStock: 40,
    baseUnit: 'Sak',
    location: 'Gudang Utama - Rak A2',
    badge: 'Stok Kritis',
    units: [
      { name: 'Sak', price: 54000, multiplier: 1 },
      { name: 'Kg', price: 1600, multiplier: 0.02 },
    ],
  },
  {
    id: 'prod-pipa-paralon-3',
    sku: 'PPA-RUC-D3',
    barcode: '8991234000201',
    name: 'Pipa PVC Paralon Rucika D 3" (4 Meter)',
    category: 'Pipa & Sanitari',
    stock: 120,
    minStock: 25,
    baseUnit: 'Batang',
    location: 'Rak Pipa Lorong B',
    units: [
      { name: 'Batang', price: 40000, multiplier: 1 },
      { name: 'Meter', price: 12000, multiplier: 0.25 },
    ],
  },
  {
    id: 'prod-pipa-paralon-05',
    sku: 'PPA-RUC-AW05',
    barcode: '8991234000202',
    name: 'Pipa PVC Paralon AW 1/2" Air Bersih',
    category: 'Pipa & Sanitari',
    stock: 85,
    minStock: 20,
    baseUnit: 'Batang',
    location: 'Rak Pipa Lorong B',
    units: [
      { name: 'Batang', price: 28000, multiplier: 1 },
      { name: 'Meter', price: 8000, multiplier: 0.25 },
    ],
  },
  {
    id: 'prod-cat-catylac',
    sku: 'CAT-DUL-WHT',
    barcode: '8991234000301',
    name: 'Cat Tembok Dulux Catylac Interior Putih',
    category: 'Cat & Kimia',
    stock: 48,
    minStock: 15,
    baseUnit: 'Pail',
    location: 'Area Display Cat',
    badge: 'Promo Toko',
    units: [
      { name: 'Pail', price: 485000, multiplier: 1 },
      { name: 'Galon', price: 115000, multiplier: 0.2 },
    ],
  },
  {
    id: 'prod-besi-ulir-10',
    sku: 'BSI-ULR-10',
    barcode: '8991234000401',
    name: 'Besi Beton Ulir 10mm SNI (12 Meter)',
    category: 'Besi & Baja',
    stock: 310,
    minStock: 80,
    baseUnit: 'Batang',
    location: 'Gudang Terbuka C-1',
    units: [
      { name: 'Batang', price: 89000, multiplier: 1 },
      { name: 'Meter', price: 8500, multiplier: 0.0833 },
    ],
  },
  {
    id: 'prod-besi-polos-8',
    sku: 'BSI-PLS-08',
    barcode: '8991234000402',
    name: 'Besi Beton Polos 8mm SNI (12 Meter)',
    category: 'Besi & Baja',
    stock: 260,
    minStock: 60,
    baseUnit: 'Batang',
    location: 'Gudang Terbuka C-1',
    units: [
      { name: 'Batang', price: 52000, multiplier: 1 },
      { name: 'Meter', price: 5000, multiplier: 0.0833 },
    ],
  },
  {
    id: 'prod-pasir-lumajang',
    sku: 'MAT-PSR-LMJ',
    barcode: '8991234000501',
    name: 'Pasir Pasang Cor Hitam Super Lumajang',
    category: 'Material Dasar',
    stock: 60,
    minStock: 15,
    baseUnit: 'Truk',
    location: 'Depo Pasir Samping',
    units: [
      { name: 'Truk', price: 1350000, multiplier: 1 },
      { name: 'Pick-up', price: 380000, multiplier: 0.28 },
      { name: 'Karung', price: 18000, multiplier: 0.012 },
    ],
  },
  {
    id: 'prod-keramik-roman',
    sku: 'KRM-ROM-40',
    barcode: '8991234000601',
    name: 'Keramik Lantai Roman 40x40 Putih Glossy',
    category: 'Keramik & Lantai',
    stock: 180,
    minStock: 40,
    baseUnit: 'Dus',
    location: 'Showroom Lantai 1',
    units: [
      { name: 'Dus', price: 78000, multiplier: 1 },
      { name: 'Keping', price: 14000, multiplier: 0.166 },
    ],
  },
  {
    id: 'prod-paku-kayu',
    sku: 'PKU-KYU-MIX',
    barcode: '8991234000701',
    name: 'Paku Kayu Baja Super (5cm / 7cm / 10cm)',
    category: 'Perkakas & Alat',
    stock: 95,
    minStock: 25,
    baseUnit: 'Dus',
    location: 'Rak Baut & Paku D2',
    units: [
      { name: 'Dus', price: 280000, multiplier: 1 },
      { name: 'Kg', price: 20000, multiplier: 0.0667 },
      { name: 'Ons', price: 2500, multiplier: 0.00667 },
    ],
  },
  {
    id: 'prod-kawat-bendrat',
    sku: 'BND-KWT-01',
    barcode: '8991234000801',
    name: 'Kawat Bendrat Pengikat Besi Hitam Lunak',
    category: 'Besi & Baja',
    stock: 70,
    minStock: 15,
    baseUnit: 'Roll',
    location: 'Gudang Besi Belakang',
    units: [
      { name: 'Roll', price: 340000, multiplier: 1 },
      { name: 'Kg', price: 19000, multiplier: 0.05 },
    ],
  },
];

// Mock Data Nama Kontraktor / Mandor Langganan
const MOCK_CONTRACTORS: string[] = [
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

// ==========================================
// 3. KOMPONEN UTAMA POS KASIR MOBILE PWA
// ==========================================
export default function KasirPOSPage() {
  // State Data Produk dari Supabase (dengan fallback MOCK_PRODUCTS)
  const [products, setProducts] = useState<POSProduct[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState<boolean>(false);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // State Pilihan Unit Aktif per Produk: { [productId]: unitName }
  const [activeUnits, setActiveUnits] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MOCK_PRODUCTS.forEach((p) => {
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

  // Fetching Data Asli dari Supabase SQL View `pos_catalog_view`
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('pos_catalog_view')
          .select('*');

        if (!error && data && data.length > 0) {
          const grouped = groupCatalogRows(data as CatalogViewRow[]);
          if (isMounted) {
            setProducts(grouped);
            setIsSupabaseLive(true);
            setActiveUnits((prev) => {
              const updated = { ...prev };
              grouped.forEach((p) => {
                if (!updated[p.id]) {
                  updated[p.id] = p.units[0]?.name || p.baseUnit;
                }
              });
              return updated;
            });
          }
        } else {
          // Jika view belum dibuat atau belum ada data di database, gunakan fallback mock data
          if (isMounted) {
            setProducts(MOCK_PRODUCTS);
            setIsSupabaseLive(false);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat katalog dari Supabase, beralih ke fallback katalog:', err);
        if (isMounted) {
          setProducts(MOCK_PRODUCTS);
          setIsSupabaseLive(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  // Ganti satuan aktif untuk produk tertentu
  const handleSelectUnit = (productId: string, unitName: string) => {
    setActiveUnits((prev) => ({
      ...prev,
      [productId]: unitName,
    }));
  };

  // Tambah item ke keranjang dengan satuan yang dipilih
  const handleAddToCart = (product: POSProduct) => {
    const currentUnitName = activeUnits[product.id] || product.units[0].name;
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

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('id-ID', { dateStyle: 'medium' })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    let generatedInvoice = `INV-TB-${String(nextCount).padStart(5, '0')}`;
    let isSavedToDb = false;

    try {
      // Panggil fungsi kerangka INSERT ke Supabase
      const result = await processCheckout(cart, paymentMethod, {
        customerName: paymentMethod === 'tempo' ? selectedContractor : 'Pembeli Umum',
        cashPaid: paymentMethod === 'cash' ? cashPaidNumber : undefined,
        dpAmount: paymentMethod === 'tempo' ? downPaymentNumber : undefined,
        dueDate: paymentMethod === 'tempo' ? dueDate : undefined,
        notes:
          paymentMethod === 'tempo'
            ? `Proyek Kontraktor: ${selectedContractor}`
            : undefined,
      });

      if (result.success && result.invoiceNumber) {
        generatedInvoice = result.invoiceNumber;
        isSavedToDb = true;
      }
    } catch (err) {
      console.warn('Proses database dilewati / berjalan dalam mode offline:', err);
    } finally {
      setIsSubmittingCheckout(false);
    }

    // Buat nota transaksi
    const newTransaction: CompletedTransaction = {
      invoiceNumber: generatedInvoice,
      createdAt: formattedDate,
      items: [...cart],
      totalAmount,
      paymentMethod,
      cashPaid: paymentMethod === 'cash' ? cashPaidNumber : undefined,
      change: paymentMethod === 'cash' ? changeAmount : undefined,
      contractorName: paymentMethod === 'tempo' ? selectedContractor : undefined,
      downPayment: paymentMethod === 'tempo' ? downPaymentNumber : undefined,
      remainingCredit: paymentMethod === 'tempo' ? remainingCredit : undefined,
      dueDate: paymentMethod === 'tempo' ? dueDate : undefined,
      savedToDatabase: isSavedToDb,
    };

    setCompletedTransaction(newTransaction);
    setIsCheckoutDrawerOpen(false);
    setCart([]);
    setCashPaidInput('');
    setDownPaymentInput('');
    setSelectedContractor('');
  };

  // Filter daftar produk berdasarkan data state products
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
              setSearchQuery('SMN-GR-50');
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
            {isSupabaseLive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Supabase View
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Database className="h-3 w-3 text-slate-400" />
                Katalog POS (Siap Sync)
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {filteredProducts.length} Material ({selectedCategory})
          </span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* AREA DAFTAR PRODUK (MOBILE VIEW: MULTI-SATUAN CARDS) */}
      {/* ==================================================== */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
            <Loader2 className="h-7 w-7 text-amber-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Memuat data material toko bangunan...
              </h4>
              <p className="text-[11px] text-slate-400">
                Menghubungkan ke view pos_catalog_view di database Supabase
              </p>
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
            const activeUnitName = activeUnits[prod.id] || prod.units[0].name;
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
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {prod.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isLowStock
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Stok: {prod.stock} {prod.baseUnit}
                  </span>
                </div>

                {/* AREA MULTI-SATUAN TOGGLE/DROPDOWN */}
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Pilih Satuan Jual:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {prod.units.length} Opsi Satuan
                    </span>
                  </div>

                  {/* Button Segmented Unit Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {prod.units.map((unit) => {
                      const isSelected = activeUnitName === unit.name;
                      return (
                        <button
                          key={unit.name}
                          type="button"
                          onClick={() => handleSelectUnit(prod.id, unit.name)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all touch-manipulation ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{unit.name}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected
                                ? 'text-slate-900 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {(unit.price / 1000).toLocaleString('id-ID')}k
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Harga Reaktif & Tombol Besar Tambah ke Keranjang */}
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Harga Satuan ({activeUnitObj.name}):
                    </span>
                    <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                      Rp {activeUnitObj.price.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <button
                    id={`add-to-cart-${prod.id}-${activeUnitObj.name}`}
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all touch-manipulation"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>
                      {inCartItem
                        ? `Tambah (${inCartItem.quantity})`
                        : 'Tambah ke Keranjang'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==================================================== */}
      {/* FLOATING ACTION BAR: LIHAT KERANJANG (DI ATAS BOTTOM NAV) */}
      {/* ==================================================== */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              id="kasir-open-checkout-sheet-btn"
              type="button"
              onClick={() => setIsCheckoutDrawerOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm shadow-2xl flex items-center justify-between transition-all active:scale-98 hover:opacity-95"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-xs">
                  {totalItemsCount}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold">Keranjang Kasir</div>
                  <div className="text-[11px] opacity-75 font-normal">
                    {cart.length} Jenis Satuan Material
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-mono text-amber-400 dark:text-amber-600">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BOTTOM SHEET / DRAWER: KERANJANG & CHECKOUT LENGKAP */}
      {/* ==================================================== */}
      {isCheckoutDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-250">
            {/* Sheet Handle & Header */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Rincian Keranjang & Bayar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalItemsCount} item material toko bangunan
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DAFTAR ITEM KERANJANG SCROLLABLE */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-52 pr-1">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold font-mono">
                        {item.selectedUnit.name}
                      </span>
                      <span>•</span>
                      <span className="font-mono">
                        @ Rp {item.selectedUnit.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono mt-1">
                      Subtotal: Rp {item.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-extrabold w-6 text-center font-mono text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 active:scale-95 ml-1 transition-all"
                      title="Hapus Item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ==================================================== */}
            {/* AREA METODE PEMBAYARAN: [TUNAI] | [QRIS] | [TEMPO]   */}
            {/* ==================================================== */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3.5 overflow-y-auto max-h-72">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    <span>Tunai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`py-2 px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QRIS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tempo')}
                    className={`py-2 px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      paymentMethod === 'tempo'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Tempo</span>
                  </button>
                </div>
              </div>

              {/* 1. KONDISIONAL: OPSI TUNAI */}
              {paymentMethod === 'cash' && (
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                      Uang Diterima:
                    </span>
                    {cashPaidNumber >= totalAmount && (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        Kembalian: Rp {changeAmount.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>

                  <input
                    type="number"
                    value={cashPaidInput}
                    onChange={(e) => setCashPaidInput(e.target.value)}
                    placeholder={`Contoh: ${totalAmount}`}
                    className="w-full py-2 px-3 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />

                  {/* Tombol Cepat Nominal Pas & Pecahan Umum */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCashPaidInput(totalAmount.toString())}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs"
                    >
                      Uang Pas
                    </button>
                    {[
                      Math.ceil(totalAmount / 50000) * 50000,
                      Math.ceil(totalAmount / 100000) * 100000,
                      100000,
                      200000,
                      500000,
                    ]
                      .filter((val, idx, arr) => val >= totalAmount && arr.indexOf(val) === idx)
                      .slice(0, 3)
                      .map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCashPaidInput(val.toString())}
                          className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          Rp {val.toLocaleString('id-ID')}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* 2. KONDISIONAL: OPSI QRIS */}
              {paymentMethod === 'qris' && (
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/60 text-center space-y-2">
                  <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-slate-200">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    QRIS Statis TB Mitra Bangunan
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">
                    Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay
                  </p>
                </div>
              )}

              {/* 3. KONDISIONAL: OPSI TEMPO / KREDIT PROYEK */}
              {paymentMethod === 'tempo' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                    <span>Data Piutang Kontraktor / Mandor Proyek</span>
                  </div>

                  {/* a. Input Box "Nama Kontraktor/Pelanggan" */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Nama Kontraktor / Pelanggan:
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={selectedContractor}
                        onChange={(e) => setSelectedContractor(e.target.value)}
                        placeholder="Pilih kontraktor di bawah atau ketik nama baru..."
                        className="w-full py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none"
                      />
                      {/* Pilihan cepat dari MOCK_CONTRACTORS */}
                      <div className="flex flex-wrap gap-1">
                        {MOCK_CONTRACTORS.slice(0, 4).map((contractor) => (
                          <button
                            key={contractor}
                            type="button"
                            onClick={() => setSelectedContractor(contractor)}
                            className={`text-[10px] px-2 py-0.5 rounded-md transition-all ${
                              selectedContractor === contractor
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {contractor.split(' (')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* b. Input "Uang Muka (DP)" & Live Hitung Sisa Piutang */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Uang Muka (DP):
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Boleh Rp 0 jika tanpa DP
                      </span>
                    </div>
                    <input
                      type="number"
                      value={downPaymentInput}
                      onChange={(e) => setDownPaymentInput(e.target.value)}
                      placeholder="0 (Tanpa DP)"
                      className="w-full py-2 px-3 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />

                    {/* Rincian Sisa Piutang */}
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Sisa Tagihan (Hutang Proyek):
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                        Rp {remainingCredit.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* c. Input Kalender "Tanggal Jatuh Tempo" */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      <span>Tanggal Jatuh Tempo:</span>
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                    />
                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleSetDuePreset(7)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                      >
                        +7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDuePreset(14)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                      >
                        +14 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDuePreset(30)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                      >
                        +30 Hari
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TOTAL PEMBAYARAN & STICKY BOTTOM TOMBOL PROSES TRANSAKSI (HIJAU) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Total Belanja Material:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {totalItemsCount} pcs/sak/batang
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  id="pos-process-transaction-btn"
                  type="button"
                  disabled={isSubmittingCheckout}
                  onClick={handleProcessTransaction}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    {isSubmittingCheckout ? (
                      <Loader2 className="h-5 w-5 animate-spin stroke-[2.2]" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
                    )}
                    <span>
                      {isSubmittingCheckout ? 'Menyimpan ke Database...' : 'Proses Transaksi'}
                    </span>
                  </div>

                  <span className="font-mono text-base font-extrabold">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL STRUK / NOTA PENJUALAN THERMAL TOKO BANGUNAN  */}
      {/* ==================================================== */}
      {completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            {/* Struk Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <HardHat className="h-6 w-6 stroke-[2.2]" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                TB MITRA BANGUNAN
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Jl. Raya Bahan Bangunan No. 88, Surabaya
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                {completedTransaction.invoiceNumber} • {completedTransaction.createdAt}
              </div>
              {completedTransaction.savedToDatabase ? (
                <div className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Tersimpan di Supabase</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <span>Nota POS Lokal (Offline Ready)</span>
                </div>
              )}
            </div>

            {/* Jika Transaksi Tempo, Tampilkan Kontraktor & Jatuh Tempo */}
            {completedTransaction.paymentMethod === 'tempo' && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Kontraktor:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {completedTransaction.contractorName}
                  </span>
                </div>
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                  <span>Jatuh Tempo:</span>
                  <span className="font-mono">{completedTransaction.dueDate}</span>
                </div>
              </div>
            )}

            {/* List Barang di Struk */}
            <div className="space-y-1.5 text-xs max-h-44 overflow-y-auto py-1 border-b border-dashed border-slate-300 dark:border-slate-700">
              {completedTransaction.items.map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    {item.product.name}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>
                      {item.quantity} {item.selectedUnit.name} x Rp{' '}
                      {item.selectedUnit.price.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rincian Total */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Belanja:</span>
                <span className="font-mono">
                  Rp {completedTransaction.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Metode:</span>
                <span className="uppercase font-bold text-slate-800 dark:text-slate-200">
                  {completedTransaction.paymentMethod === 'tempo'
                    ? 'Tempo (Piutang Proyek)'
                    : completedTransaction.paymentMethod}
                </span>
              </div>

              {completedTransaction.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Tunai Dibayar:</span>
                    <span className="font-mono">
                      Rp {completedTransaction.cashPaid?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Kembalian:</span>
                    <span className="font-mono">
                      Rp {completedTransaction.change?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              )}

              {completedTransaction.paymentMethod === 'tempo' && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Uang Muka (DP):</span>
                    <span className="font-mono">
                      Rp {completedTransaction.downPayment?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                    <span>Sisa Hutang:</span>
                    <span className="font-mono">
                      Rp {completedTransaction.remainingCredit?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Tombol Aksi Struk */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Mencetak Nota ke Printer Bluetooth Thermal Kasir: ${completedTransaction.invoiceNumber}`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all"
              >
                <Printer className="h-4 w-4 text-amber-400" />
                <span>Cetak Nota Thermal</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedTransaction(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Transaksi Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
