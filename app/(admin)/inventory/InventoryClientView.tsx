'use client';

import React, { useState, useTransition } from 'react';
import {
  Warehouse,
  Truck,
  ArrowRightLeft,
  Package,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Building2,
  MapPin,
  User,
  ArrowRight,
  X,
  Boxes,
  Eye,
  Check,
  Edit3,
  RefreshCw,
  Lock,
  Database,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  fetchInventory,
  seedInitialMaterialsAction,
  fetchDeliveryOrders,
  updateDeliveryOrderStatusAction,
} from './actions';
import type {
  InventoryMaterialItem,
  DeliveryOrder,
  DeliveryStatus,
} from './types';
import MaterialFormModal from '@/components/admin/MaterialFormModal';

const WAREHOUSE_LOCATIONS = [
  { id: 'toko', name: 'Toko Utama (Display & Kasir)' },
  { id: 'gudang01', name: 'Gudang 01 (Semen/Pasir/Besi)' },
];

interface InventoryClientViewProps {
  initialItems: InventoryMaterialItem[];
  initialIsFromSupabase: boolean;
  initialDeliveryOrders?: DeliveryOrder[];
}

export default function InventoryClientView({
  initialItems,
  initialIsFromSupabase,
  initialDeliveryOrders = [],
}: InventoryClientViewProps) {
  // 1. STATE TAB AKTIF: 'stok' | 'surat-jalan'
  const [activeTab, setActiveTab] = useState<'stok' | 'surat-jalan'>('stok');

  // 2. STATE INVENTORY DATA DARI SUPABASE
  const [inventoryList, setInventoryList] = useState<InventoryMaterialItem[]>(initialItems);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState(initialIsFromSupabase);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // 3. STATE MODAL FORM CRUD MATERIAL (TAMBAH & EDIT)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<InventoryMaterialItem | null>(null);

  // 4. STATE MODAL MUTASI STOK ANTAR-GUDANG
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedItemForTransfer, setSelectedItemForTransfer] = useState<InventoryMaterialItem | null>(null);
  const [sourceLocation, setSourceLocation] = useState<'toko' | 'gudang01'>('gudang01');
  const [targetLocation, setTargetLocation] = useState<'toko' | 'gudang01'>('toko');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferMemo, setTransferMemo] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5. STATE TAB SURAT JALAN / DELIVERY ORDERS DARI SUPABASE
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(initialDeliveryOrders);
  const [selectedDOForPreview, setSelectedDOForPreview] = useState<DeliveryOrder | null>(null);

  // 6. TRANSITION UNTUK SEED DATA AWAL
  const [isSeeding, startSeeding] = useTransition();

  // Helper Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load / Refresh Inventory Data dari Supabase Server Action
  const loadInventory = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoadingInventory(true);
    try {
      const res = await fetchInventory();
      setInventoryList(res.items);
      setIsSupabaseLive(res.isFromSupabase);
    } catch (err) {
      console.warn('Gagal memuat inventaris:', err);
      setIsSupabaseLive(false);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Handlers Buka Modal Form Tambah
  const handleOpenCreateModal = () => {
    setMaterialToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handlers Buka Modal Form Edit
  const handleOpenEditModal = (item: InventoryMaterialItem) => {
    setMaterialToEdit(item);
    setIsFormModalOpen(true);
  };

  // Callback Sukses dari MaterialFormModal
  const handleFormSuccess = (msg: string) => {
    showToast(msg);
    loadInventory(false);
  };

  // Handler Seed Data Material Awal ke Supabase
  const handleSeedInitialMaterials = () => {
    if (confirm('Apakah Anda ingin memasukkan 10 material standar bangunan ke database Supabase Anda sekarang?')) {
      startSeeding(async () => {
        const res = await seedInitialMaterialsAction();
        if (res.success) {
          showToast(`Berhasil menyimpan ${res.data?.count || 10} material awal ke database Supabase.`);
          loadInventory(false);
        } else {
          showToast(`Gagal seeding: ${res.error}`);
        }
      });
    }
  };

  // ==========================================
  // HANDLERS TAB 1: MUTASI STOK
  // ==========================================
  const handleOpenTransferModal = (item: InventoryMaterialItem) => {
    setSelectedItemForTransfer(item);
    setSourceLocation('gudang01');
    setTargetLocation('toko');
    setTransferAmount('20');
    setTransferMemo(`Restock display toko ${item.name.split(' ')[0]}`);
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForTransfer) return;

    const amount = parseInt(transferAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Masukkan jumlah pindah stok yang valid (minimal 1)!');
      return;
    }

    if (sourceLocation === targetLocation) {
      alert('Lokasi asal dan tujuan mutasi tidak boleh sama!');
      return;
    }

    const availableStock =
      sourceLocation === 'toko'
        ? selectedItemForTransfer.stockToko
        : selectedItemForTransfer.stockGudang01;

    if (amount > availableStock) {
      alert(
        `Stok di ${sourceLocation === 'toko' ? 'Toko Utama' : 'Gudang 01'} tidak mencukupi! Hanya tersedia ${availableStock} ${selectedItemForTransfer.base_unit}.`
      );
      return;
    }

    // Update state inventory lokal
    setInventoryList((prev) =>
      prev.map((item) => {
        if (item.id === selectedItemForTransfer.id) {
          let nextStockToko = item.stockToko;
          let nextStockGudang = item.stockGudang01;

          if (sourceLocation === 'toko' && targetLocation === 'gudang01') {
            nextStockToko -= amount;
            nextStockGudang += amount;
          } else if (sourceLocation === 'gudang01' && targetLocation === 'toko') {
            nextStockGudang -= amount;
            nextStockToko += amount;
          }

          return {
            ...item,
            stockToko: nextStockToko,
            stockGudang01: nextStockGudang,
          };
        }
        return item;
      })
    );

    const sourceName = sourceLocation === 'toko' ? 'Toko Utama' : 'Gudang 01';
    const targetName = targetLocation === 'toko' ? 'Toko Utama' : 'Gudang 01';

    showToast(
      `Berhasil memindahkan ${amount} ${selectedItemForTransfer.base_unit} "${selectedItemForTransfer.name}" dari ${sourceName} ke ${targetName}.`
    );

    setIsTransferModalOpen(false);
    setSelectedItemForTransfer(null);
  };

  // ==========================================
  // HANDLERS TAB 2: SURAT JALAN STATUS PROGRESSION
  // ==========================================
  const handleAdvanceStatus = async (orderId: string, currentStatus: DeliveryStatus) => {
    let nextStatus: DeliveryStatus = currentStatus;
    let successMessage = '';

    if (currentStatus === 'menunggu_disiapkan' || (currentStatus as string) === 'menunggu') {
      nextStatus = 'siap_kirim';
      successMessage = 'Surat Jalan berhasil dicetak! Material telah dinaikkan ke armada & siap kirim.';
    } else if (currentStatus === 'siap_kirim') {
      nextStatus = 'dalam_perjalanan';
      successMessage = 'Armada diberangkatkan! Supir sedang menuju ke lokasi proyek konstruksi.';
    } else if (currentStatus === 'dalam_perjalanan') {
      nextStatus = 'selesai';
      successMessage = 'Pengiriman selesai! Material telah diterima & ditandatangani mandor proyek.';
    }

    // Optimistic update
    setDeliveryOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );
    showToast(successMessage);

    // Call Supabase update action
    try {
      await updateDeliveryOrderStatusAction(orderId, nextStatus);
    } catch (e) {
      console.warn('Gagal sinkronisasi update status DO ke Supabase:', e);
    }
  };

  // Filter Inventory
  const categories = [
    'Semua',
    'Material Dasar',
    'Besi & Baja',
    'Pipa & Sanitari',
    'Cat & Kimia',
    'Perkakas & Alat',
    'Keramik & Lantai',
  ];

  const filteredInventory = inventoryList.filter((item) => {
    const matchCat = categoryFilter === 'Semua' || item.category === categoryFilter;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Perhitungan Ringkasan Inventaris
  const lowStockCountToko = inventoryList.filter(
    (i) => i.stockToko < (i.min_stock_alert ?? 10)
  ).length;
  const totalGlobalItems = inventoryList.reduce(
    (acc, curr) => acc + curr.stockToko + curr.stockGudang01,
    0
  );

  // Grouping DO by status for Kanban
  const ordersMenunggu = deliveryOrders.filter(
    (o) => o.status === 'menunggu_disiapkan' || (o.status as string) === 'menunggu'
  );
  const ordersSiapKirim = deliveryOrders.filter((o) => o.status === 'siap_kirim');
  const ordersDalamPerjalanan = deliveryOrders.filter((o) => o.status === 'dalam_perjalanan');
  const ordersSelesai = deliveryOrders.filter((o) => o.status === 'selesai');

  return (
    <div className="space-y-6 pb-12">
      {/* ==================================================== */}
      {/* TOAST ALERT NOTIFICATION BANNER                      */}
      {/* ==================================================== */}
      {toastMessage && (
        <div
          id="inventory-toast-banner"
          className="fixed top-20 right-8 z-50 flex items-center gap-3 p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl border border-emerald-500/40 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="text-sm font-medium pr-2 max-w-sm">{toastMessage}</div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* PAGE HEADER & QUICK METRICS                          */}
      {/* ==================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Boxes className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Inventaris &amp; Logistik Gudang</span>
                {isSupabaseLive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Supabase Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                    Mode Siap Sinkron
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat kontrol multi-gudang, manajemen CRUD material dengan proteksi RLS harga beli, dan pelacakan surat jalan.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Indicators Desktop & Tambah Material Button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Stok Menipis Toko:</div>
              <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                {lowStockCountToko} Item (&lt;Min)
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Armada Pengiriman:</div>
              <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {ordersMenunggu.length + ordersSiapKirim.length + ordersDalamPerjalanan.length} Aktif
              </div>
            </div>
          </div>

          {/* Tombol Tambah Material Baru */}
          <button
            id="btn-open-create-material"
            type="button"
            onClick={handleOpenCreateModal}
            className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Tambah Material</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SISTEM TABS UTAMA: [STOK GUDANG] | [SURAT JALAN]      */}
      {/* ==================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Tab 1 Button */}
          <button
            id="tab-stok-gudang-btn"
            type="button"
            onClick={() => setActiveTab('stok')}
            className={`flex items-center gap-2.5 px-5 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'stok'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Warehouse className="h-4 w-4" />
            <span>Tab 1: Stok Gudang</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'stok'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {inventoryList.length} SKU
            </span>
          </button>

          {/* Tab 2 Button */}
          <button
            id="tab-surat-jalan-btn"
            type="button"
            onClick={() => setActiveTab('surat-jalan')}
            className={`flex items-center gap-2.5 px-5 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'surat-jalan'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Tab 2: Surat Jalan (Delivery Order)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                activeTab === 'surat-jalan'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {deliveryOrders.filter((o) => o.status !== 'selesai').length} Berjalan
            </span>
          </button>
        </div>

        {/* Tab Actions Toolbar */}
        <div className="flex items-center gap-2">
          {activeTab === 'stok' && (
            <button
              id="btn-refresh-inventory"
              type="button"
              disabled={isLoadingInventory}
              onClick={() => loadInventory(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Perbarui data inventaris dari Supabase"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingInventory ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* KONTEN TAB 1: STOK GUDANG (DATA TABLE & MUTASI)       */}
      {/* ==================================================== */}
      {activeTab === 'stok' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Banner Informasi Sinkronisasi Supabase jika belum live */}
          {!isSupabaseLive && (
            <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Tabel Products Supabase Terkoneksi
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Anda dapat langsung menekan tombol <strong>Tambah Material</strong> untuk membuat data baru di Supabase, atau mengisi data awal sampel secara otomatis.
                  </p>
                </div>
              </div>

              <button
                id="btn-seed-materials"
                type="button"
                disabled={isSeeding}
                onClick={handleSeedInitialMaterials}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan ke DB...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 dark:text-slate-950" />
                    <span>Seed Material Sampel ke Supabase</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bar Kontrol & Filter Pencarian */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Input Pencarian */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="inventory-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SKU, Barcode, atau nama semen, besi, pipa..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Kategori Material */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Legenda & Status Keterangan Kolom */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <strong className="text-slate-700 dark:text-slate-300">Merah:</strong> Stok Toko Utama &lt; Batas Minimum
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <strong className="text-slate-700 dark:text-slate-300">Hijau:</strong> Stok Toko Aman
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="h-3 w-3 text-emerald-500" />
                <span>HPP Beli terproteksi RLS</span>
              </span>
            </div>
            <div className="text-slate-400">
              Total Fisik:{' '}
              <strong className="font-mono text-slate-700 dark:text-slate-300">
                {totalGlobalItems.toLocaleString('id-ID')} unit
              </strong>
            </div>
          </div>

          {/* TABEL DATA STOK GUDANG */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <th className="py-3.5 px-4 font-bold">SKU &amp; Barcode</th>
                    <th className="py-3.5 px-4 font-bold">Nama Material &amp; Satuan</th>
                    <th className="py-3.5 px-4 text-right font-bold">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Lock className="h-3 w-3" />
                        HPP Beli (Admin)
                      </span>
                    </th>
                    <th className="py-3.5 px-4 text-center font-bold">Stok Global</th>
                    <th className="py-3.5 px-4 text-center font-bold bg-amber-500/5 dark:bg-amber-500/10 border-x border-slate-200/70 dark:border-slate-800">
                      Toko Utama (Display)
                    </th>
                    <th className="py-3.5 px-4 text-center font-bold">Gudang 01 (Logistik)</th>
                    <th className="py-3.5 px-4 text-center font-bold">Aksi CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {isLoadingInventory ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                          <span>Memuat inventaris dari database Supabase...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Package className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                          <div className="font-bold text-slate-700 dark:text-slate-300">
                            Tidak ada material yang ditemukan
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Coba sesuaikan kata kunci pencarian atau klik tombol <strong>Tambah Material</strong> untuk menambahkan produk baru.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const globalStock = item.stockToko + item.stockGudang01;
                      const minStock = item.min_stock_alert ?? 10;
                      const isStockTokoCritical = item.stockToko < minStock;
                      const primarySellPrice = item.units[0]?.sell_price || 0;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          {/* 1. KOLOM SKU & BARCODE */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                                {item.sku}
                              </span>
                            </div>
                            {item.barcode && item.barcode !== item.sku && (
                              <div className="text-[10px] text-slate-400 font-mono mt-1">
                                Barcode: {item.barcode}
                              </div>
                            )}
                          </td>

                          {/* 2. KOLOM NAMA BARANG */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {item.category}
                              </span>
                              <span>•</span>
                              <span>
                                Satuan Dasar: <strong className="text-slate-700 dark:text-slate-300">{item.base_unit}</strong>
                              </span>
                              {item.units && item.units.length > 1 && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {item.units.length} Variasi Satuan
                                  </span>
                                </>
                              )}
                              {primarySellPrice > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-600 dark:text-slate-300">
                                    Jual: <strong>Rp {primarySellPrice.toLocaleString('id-ID')}</strong>
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* 3. KOLOM HPP BELI (TERPROTEKSI RLS ADMIN) */}
                          <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/50 dark:border-emerald-800/50">
                              <Lock className="h-3 w-3 text-emerald-500" />
                              <span>Rp {item.buy_price ? item.buy_price.toLocaleString('id-ID') : '0'}</span>
                            </div>
                          </td>

                          {/* 4. KOLOM STOK GLOBAL */}
                          <td className="py-4 px-4 text-center whitespace-nowrap font-mono">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-xs">
                              <span>{globalStock}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{item.base_unit}</span>
                            </div>
                          </td>

                          {/* 5. KOLOM TOKO UTAMA */}
                          <td className="py-4 px-4 text-center whitespace-nowrap bg-amber-500/5 dark:bg-amber-500/10 border-x border-slate-200/70 dark:border-slate-800">
                            {isStockTokoCritical ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-extrabold font-mono text-xs shadow-2xs animate-pulse">
                                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                  <span>
                                    {item.stockToko} {item.base_unit}
                                  </span>
                                </span>
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                                  Kritis (&lt;{minStock})! Perlu Mutasi
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold font-mono text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>
                                  {item.stockToko} {item.base_unit}
                                </span>
                              </span>
                            )}
                          </td>

                          {/* 6. KOLOM GUDANG 01 */}
                          <td className="py-4 px-4 text-center whitespace-nowrap font-mono">
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-extrabold text-xs">
                                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                <span>
                                  {item.stockGudang01} {item.base_unit}
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {item.rackLocationGudang || 'Gudang Logistik'}
                              </span>
                            </div>
                          </td>

                          {/* 7. KOLOM ACTION (EDIT & MUTASI) */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Tombol Edit Material */}
                              <button
                                id={`btn-edit-${item.sku}`}
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                                title="Edit data material & harga"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Tombol Mutasi Stok Antar-Gudang */}
                              <button
                                id={`btn-mutasi-${item.sku}`}
                                type="button"
                                onClick={() => handleOpenTransferModal(item)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                                  isStockTokoCritical
                                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                                }`}
                                title="Pindahkan stok antar-gudang"
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Mutasi</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* KONTEN TAB 2: SURAT JALAN / DELIVERY ORDER (KANBAN)  */}
      {/* ==================================================== */}
      {activeTab === 'surat-jalan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Info Tab Surat Jalan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" />
                <span>Logistik Armada Toko &amp; Delivery Order</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulasi alur faktur material berat dari kasir, pemuatan ke armada pick-up/truk, hingga pengantaran ke mandor proyek.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Order Aktif:
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono">
                {ordersMenunggu.length + ordersSiapKirim.length + ordersDalamPerjalanan.length} Pengiriman
              </span>
            </div>
          </div>

          {/* KANBAN BOARD 3 KOLOM STATUS PENGIRIMAN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* ==================================================== */}
            {/* KOLOM A: [Menunggu Disiapkan] (Faktur baru kasir)    */}
            {/* ==================================================== */}
            <div className="p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Menunggu Disiapkan
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {ordersMenunggu.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Faktur baru masuk dari kasir, butuh dimuat ke armada.
              </p>

              {/* Cards List */}
              <div className="space-y-3">
                {ordersMenunggu.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Tidak ada pesanan antrian baru.
                  </div>
                ) : (
                  ordersMenunggu.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {order.transactionId}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {order.createdAt}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-start gap-1.5">
                          <User className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{order.contractorName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pl-0.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.projectAddress}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Nopol Armada:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                            {order.vehiclePlate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Kendaraan:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                            {order.vehicleType.split(' (')[0]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Supir:</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {order.driverName}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Muatan Material Berat:</span>
                          <span className="text-[10px] text-slate-400">{order.items.length} jenis</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1 text-xs font-mono">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                                {it.quantity} {it.unit} {it.productName.split(' ')[0]} {it.productName.split(' ')[1] || ''}
                              </span>
                              <span className="text-amber-700 dark:text-amber-400 flex-shrink-0 text-[10px]">
                                {it.weightEst}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDOForPreview(order)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                          title="Preview Detail & Cetak DO"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          id={`advance-do-${order.id}`}
                          type="button"
                          onClick={() => handleAdvanceStatus(order.id, order.status)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak DO &amp; Pindahkan</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ==================================================== */}
            {/* KOLOM B: [Siap Kirim / DO Dicetak] (Barang dimuat)   */}
            {/* ==================================================== */}
            <div className="p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Siap Kirim / DO Dicetak
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {ordersSiapKirim.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Barang sudah dinaikkan ke armada pick-up/truk, siap jalan.
              </p>

              <div className="space-y-3">
                {ordersSiapKirim.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Tidak ada muatan siap kirim.
                  </div>
                ) : (
                  ordersSiapKirim.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-2xs hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {order.doNumber}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Dimuat di Armada
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-start gap-1.5">
                          <User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{order.contractorName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pl-0.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.projectAddress}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Nopol Armada:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                            {order.vehiclePlate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Supir:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {order.driverName}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 space-y-1 text-xs font-mono">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                              {it.quantity} {it.unit} {it.productName.split(' ')[0]}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 text-[10px]">
                              {it.weightEst}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDOForPreview(order)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                          title="Preview Surat Jalan"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          id={`start-delivery-${order.id}`}
                          type="button"
                          onClick={() => handleAdvanceStatus(order.id, order.status)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Berangkatkan Supir</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ==================================================== */}
            {/* KOLOM C: [Dalam Perjalanan] (Supir menuju lokasi)     */}
            {/* ==================================================== */}
            <div className="p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Dalam Perjalanan
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {ordersDalamPerjalanan.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Supir armada toko sedang meluncur ke alamat proyek.
              </p>

              <div className="space-y-3">
                {ordersDalamPerjalanan.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Tidak ada armada di jalan saat ini.
                  </div>
                ) : (
                  ordersDalamPerjalanan.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-2xs hover:shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {order.doNumber}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          OTW Lokasi Proyek
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-start gap-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{order.contractorName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pl-0.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.projectAddress}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Nopol Armada:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                            {order.vehiclePlate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Supir:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {order.driverName}
                          </span>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 text-[11px] text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40">
                          <strong>Keterangan:</strong> {order.notes}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDOForPreview(order)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                          title="Preview Surat Jalan"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          id={`finish-delivery-${order.id}`}
                          type="button"
                          onClick={() => handleAdvanceStatus(order.id, order.status)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Konfirmasi Tiba &amp; Selesai</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section Selesai Terkirim */}
          {ordersSelesai.length > 0 && (
            <div className="mt-6 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Pengiriman yang Telah Tuntas Diterima Mandor ({ordersSelesai.length})</span>
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ordersSelesai.map((doneOrder) => (
                  <div
                    key={doneOrder.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {doneOrder.doNumber} • {doneOrder.contractorName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Armada: {doneOrder.vehiclePlate} ({doneOrder.driverName})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDOForPreview(doneOrder)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 text-xs flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Lihat DO</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: TAMBAH / EDIT MATERIAL (CRUD COMPONENT)     */}
      {/* ==================================================== */}
      <MaterialFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        materialToEdit={materialToEdit}
        onSuccess={handleFormSuccess}
      />

      {/* ==================================================== */}
      {/* MODAL 2: INTER-WAREHOUSE TRANSFER (MUTASI STOK)     */}
      {/* ==================================================== */}
      {isTransferModalOpen && selectedItemForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <ArrowRightLeft className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Mutasi Stok Antar-Gudang
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pindahkan stok fisik antara display Toko Utama dan Gudang Logistik.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ringkasan Material Yang Dimutasi */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  SKU: {selectedItemForTransfer.sku}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {selectedItemForTransfer.category}
                </span>
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                {selectedItemForTransfer.name}
              </h4>

              {/* Posisi Stok Saat Ini */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="text-slate-400 text-[10px]">Stok Toko Utama:</div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      selectedItemForTransfer.stockToko < (selectedItemForTransfer.min_stock_alert ?? 10)
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {selectedItemForTransfer.stockToko} {selectedItemForTransfer.base_unit}
                    {selectedItemForTransfer.stockToko < (selectedItemForTransfer.min_stock_alert ?? 10) &&
                      ' (Kritis)'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="text-slate-400 text-[10px]">Stok Gudang 01:</div>
                  <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                    {selectedItemForTransfer.stockGudang01} {selectedItemForTransfer.base_unit}
                  </div>
                </div>
              </div>
            </div>

            {/* FORM MUTASI */}
            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Dari Lokasi (Asal):
                  </label>
                  <select
                    id="transfer-source-select"
                    value={sourceLocation}
                    onChange={(e) => {
                      const newSource = e.target.value as 'toko' | 'gudang01';
                      setSourceLocation(newSource);
                      if (newSource === targetLocation) {
                        setTargetLocation(newSource === 'toko' ? 'gudang01' : 'toko');
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {WAREHOUSE_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Ke Lokasi (Tujuan):
                  </label>
                  <select
                    id="transfer-target-select"
                    value={targetLocation}
                    onChange={(e) => {
                      const newTarget = e.target.value as 'toko' | 'gudang01';
                      setTargetLocation(newTarget);
                      if (newTarget === sourceLocation) {
                        setSourceLocation(newTarget === 'toko' ? 'gudang01' : 'toko');
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {WAREHOUSE_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Jumlah Pindah */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Jumlah Pindah ({selectedItemForTransfer.base_unit}):
                  </label>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Tersedia di asal:{' '}
                    <strong>
                      {sourceLocation === 'toko'
                        ? selectedItemForTransfer.stockToko
                        : selectedItemForTransfer.stockGudang01}{' '}
                      {selectedItemForTransfer.base_unit}
                    </strong>
                  </span>
                </div>
                <input
                  id="transfer-amount-input"
                  type="number"
                  min="1"
                  max={
                    sourceLocation === 'toko'
                      ? selectedItemForTransfer.stockToko
                      : selectedItemForTransfer.stockGudang01
                  }
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Masukkan kuantitas transfer..."
                  className="w-full py-2.5 px-3 font-mono font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                />

                <div className="flex gap-1.5 pt-1">
                  {[10, 20, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTransferAmount(String(num))}
                      className="text-[10px] font-mono font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      +{num} {selectedItemForTransfer.base_unit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setTransferAmount(
                        String(
                          sourceLocation === 'toko'
                            ? selectedItemForTransfer.stockToko
                            : selectedItemForTransfer.stockGudang01
                        )
                      )
                    }
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                  >
                    Semua (Maksimal)
                  </button>
                </div>
              </div>

              {/* Input Catatan / Memo Mutasi */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Keterangan / Memo Mutasi:
                </label>
                <input
                  type="text"
                  value={transferMemo}
                  onChange={(e) => setTransferMemo(e.target.value)}
                  placeholder="Contoh: Restock display toko depan, instruksi kepala gudang"
                  className="w-full py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  id="process-transfer-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowRightLeft className="h-4 w-4 stroke-[2.5]" />
                  <span>Proses Mutasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: PREVIEW SURAT JALAN (DELIVERY ORDER FORMAL) */}
      {/* ==================================================== */}
      {selectedDOForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header Surat Jalan Resmi */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-slate-800 dark:border-slate-700">
              <div>
                <div className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  TB MITRA BANGUNAN SURABAYA
                </div>
                <div className="text-[11px] text-slate-500">
                  Jl. Raya Bahan Bangunan No. 88, Surabaya • Telp: (031) 876-5432
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                  SURAT JALAN / DELIVERY ORDER
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  {selectedDOForPreview.doNumber}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Faktur: {selectedDOForPreview.transactionId}
                </div>
              </div>
            </div>

            {/* Info Kontraktor & Armada */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tujuan Pengiriman:</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedDOForPreview.contractorName}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {selectedDOForPreview.projectAddress}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Telp: {selectedDOForPreview.phone}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Armada &amp; Supir:</span>
                <div className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedDOForPreview.vehiclePlate} ({selectedDOForPreview.vehicleType.split(' (')[0]})
                </div>
                <div className="text-slate-500 text-[11px]">
                  Supir: <strong>{selectedDOForPreview.driverName}</strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  Waktu Muat: {selectedDOForPreview.createdAt}
                </div>
              </div>
            </div>

            {/* Tabel Muatan Barang */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Daftar Muatan Material Fisik:
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Nama Material</th>
                      <th className="py-2 px-3 text-center">Kuantitas</th>
                      <th className="py-2 px-3 text-right">Est. Bobot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedDOForPreview.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {it.productName}
                        </td>
                        <td className="py-2 px-3 text-center font-bold font-mono">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">
                          {it.weightEst}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kolom Tanda Tangan 3 Pihak */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center text-xs">
              <div className="p-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl space-y-8">
                <div className="text-[10px] text-slate-400">Petugas Gudang</div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-1 font-semibold text-slate-600 dark:text-slate-400 text-[10px]">
                  (Kepala Logistik)
                </div>
              </div>

              <div className="p-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl space-y-8">
                <div className="text-[10px] text-slate-400">Supir Armada</div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-1 font-semibold text-slate-600 dark:text-slate-400 text-[10px]">
                  ({selectedDOForPreview.driverName})
                </div>
              </div>

              <div className="p-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl space-y-8">
                <div className="text-[10px] text-slate-400">Mandor Penerima</div>
                <div className="border-t border-slate-300 dark:border-slate-600 pt-1 font-semibold text-slate-600 dark:text-slate-400 text-[10px]">
                  (Tanda Tangan &amp; Cap)
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDOForPreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Mencetak dokumen resmi ${selectedDOForPreview.doNumber} ke printer gudang...`);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-90"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Dokumen Surat Jalan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
