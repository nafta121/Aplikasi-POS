'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  Package,
  Layers,
  Check,
  Boxes,
  Barcode,
} from 'lucide-react';
import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '@/app/(admin)/inventory/actions';
import type {
  InventoryMaterialItem,
  ProductUnitInput,
} from '@/app/(admin)/inventory/types';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialToEdit?: InventoryMaterialItem | null;
  onSuccess: (message: string) => void;
}

const CATEGORIES = [
  'Material Dasar',
  'Besi & Baja',
  'Pipa & Sanitari',
  'Cat & Kimia',
  'Perkakas & Alat',
  'Keramik & Lantai',
  'Kayu & Atap',
  'Lain-lain',
];

const COMMON_BASE_UNITS = ['Sak', 'Batang', 'Dus', 'Pail', 'Truk', 'Meter', 'Pcs', 'Kg', 'Roll'];

interface MaterialFormContentProps {
  materialToEdit?: InventoryMaterialItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function MaterialFormContent({
  materialToEdit,
  onClose,
  onSuccess,
}: MaterialFormContentProps) {
  const isEditMode = Boolean(materialToEdit);

  // Form State diinisialisasi langsung dari props
  const [sku, setSku] = useState(materialToEdit?.sku || '');
  const [barcode, setBarcode] = useState(materialToEdit?.barcode || materialToEdit?.sku || '');
  const [name, setName] = useState(materialToEdit?.name || '');
  const [category, setCategory] = useState(materialToEdit?.category || CATEGORIES[0]);
  const [baseUnit, setBaseUnit] = useState(materialToEdit?.base_unit || 'Sak');
  const [buyPrice, setBuyPrice] = useState<string>(
    materialToEdit ? String(materialToEdit.buy_price || 0) : ''
  );
  const [minStockAlert, setMinStockAlert] = useState<string>(
    materialToEdit ? String(materialToEdit.min_stock_alert ?? 10) : '10'
  );

  // Variasi Satuan Jual (product_units)
  const [units, setUnits] = useState<ProductUnitInput[]>(() => {
    if (materialToEdit?.units && materialToEdit.units.length > 0) {
      return materialToEdit.units.map((u) => ({
        id: u.id,
        unit_name: u.unit_name,
        conversion_multiplier: u.conversion_multiplier || 1,
        sell_price: u.sell_price || 0,
      }));
    }
    if (materialToEdit) {
      return [
        {
          unit_name: materialToEdit.base_unit || 'Sak',
          conversion_multiplier: 1,
          sell_price: Math.round(Number(materialToEdit.buy_price || 0) * 1.15),
        },
      ];
    }
    return [{ unit_name: 'Sak', conversion_multiplier: 1, sell_price: 0 }];
  });

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle changes to baseUnit: update first unit's name
  const handleBaseUnitChange = (newBaseUnit: string) => {
    setBaseUnit(newBaseUnit);
    setUnits((prev) => {
      if (prev.length === 0) {
        return [{ unit_name: newBaseUnit, conversion_multiplier: 1, sell_price: 0 }];
      }
      return prev.map((u, idx) => (idx === 0 ? { ...u, unit_name: newBaseUnit } : u));
    });
  };

  // Add new unit variation
  const handleAddUnit = () => {
    setUnits((prev) => [
      ...prev,
      { unit_name: '', conversion_multiplier: 1, sell_price: 0 },
    ]);
  };

  // Remove unit variation
  const handleRemoveUnit = (index: number) => {
    if (units.length <= 1) {
      alert('Material harus memiliki setidaknya 1 satuan penjualan.');
      return;
    }
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  // Update specific unit variation
  const handleUnitChange = (
    index: number,
    field: keyof ProductUnitInput,
    value: string | number
  ) => {
    setUnits((prev) =>
      prev.map((u, i) => {
        if (i !== index) return u;
        return {
          ...u,
          [field]: field === 'unit_name' ? value : Number(value) || 0,
        };
      })
    );
  };

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sku.trim()) {
      setErrorMessage('SKU Material wajib diisi.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Nama Material wajib diisi.');
      return;
    }

    const validUnits = units.map((u, idx) => ({
      ...u,
      unit_name: u.unit_name.trim() || (idx === 0 ? baseUnit : `Satuan-${idx + 1}`),
      conversion_multiplier: Number(u.conversion_multiplier) > 0 ? Number(u.conversion_multiplier) : 1,
      sell_price: Number(u.sell_price) >= 0 ? Number(u.sell_price) : 0,
    }));

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (isEditMode && materialToEdit) {
        formData.append('id', materialToEdit.id);
      }
      formData.append('sku', sku.trim().toUpperCase());
      formData.append('barcode', barcode.trim() || sku.trim().toUpperCase());
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('base_unit', baseUnit.trim());
      formData.append('buy_price', buyPrice || '0');
      formData.append('min_stock_alert', minStockAlert || '10');
      formData.append('units_json', JSON.stringify(validUnits));

      let result;
      if (isEditMode) {
        result = await updateMaterial(formData);
      } else {
        result = await createMaterial(formData);
      }

      if (result.success) {
        onSuccess(
          isEditMode
            ? `Berhasil memperbarui data material "${name}".`
            : `Berhasil menambahkan material baru "${name}" ke inventaris.`
        );
        onClose();
      } else {
        setErrorMessage(result.error || 'Terjadi kesalahan saat memproses data ke Supabase.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Gagal: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Material
  const handleDelete = async () => {
    if (!materialToEdit?.id) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await deleteMaterial(materialToEdit.id);
      if (result.success) {
        onSuccess(`Material "${materialToEdit.name}" telah berhasil dihapus dari inventaris.`);
        onClose();
      } else {
        setErrorMessage(result.error || 'Gagal menghapus material dari database.');
        setShowDeleteConfirm(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Gagal menghapus: ${msg}`);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="material-form-modal-card"
      className="w-[95%] sm:w-[90%] md:max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
    >
      {/* Header Modal: Tetap di atas (shrink-0) dengan close button yang selalu terlihat */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0">
            <Boxes className="h-5 w-5 stroke-[2.4]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Data Material Bangunan' : 'Tambah Material Baru ke Inventaris'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
              {isEditMode
                ? `Mengubah spesifikasi katalog, HPP beli, dan satuan jual SKU ${materialToEdit?.sku}`
                : 'Daftarkan SKU produk baru, variasi harga satuan, dan HPP rahasia toko'}
            </p>
          </div>
        </div>

        <button
          id="btn-close-material-modal"
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isDeleting}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Scrollable Body: scrollable di HP tanpa menghilangkan tombol Header/Close modal */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[85vh] p-4 sm:p-6 space-y-6 text-xs">
        {/* Alert Error jika ada */}
        {errorMessage && (
          <div
            id="material-modal-error-alert"
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3"
          >
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <strong>Gagal Menyimpan:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* SECTION 1: IDENTITAS PRODUK (SKU, BARCODE, NAMA, KATEGORI) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
            <Package className="h-4 w-4 text-amber-500" />
            <span>1. Identitas &amp; Katalog Material</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-material-sku"
                className="font-bold text-slate-700 dark:text-slate-300 block"
              >
                Kode SKU / Ref Material <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-material-sku"
                type="text"
                required
                placeholder="Contoh: SMN-GR-50"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none uppercase"
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-material-barcode"
                className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>Barcode Fisik (Opsional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Untuk scanner kasir</span>
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="input-material-barcode"
                  type="text"
                  placeholder="Contoh: 899123456789"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Nama Material */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-material-name"
              className="font-bold text-slate-700 dark:text-slate-300 block"
            >
              Nama Lengkap Material Bangunan <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-material-name"
              type="text"
              required
              placeholder="Contoh: Semen Gresik Portland Composite 50 Kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Kategori & Satuan Dasar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="select-material-category"
                className="font-bold text-slate-700 dark:text-slate-300 block"
              >
                Kategori Kelompok Material
              </label>
              <select
                id="select-material-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="input-material-base-unit"
                className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                <span>Satuan Fisik Dasar (Base Unit)</span>
                <span className="text-[10px] text-slate-400 font-normal">Satuan stock take</span>
              </label>
              <input
                id="input-material-base-unit"
                type="text"
                required
                list="common-units-list"
                placeholder="Contoh: Sak, Batang, Pail"
                value={baseUnit}
                onChange={(e) => handleBaseUnitChange(e.target.value)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
              <datalist id="common-units-list">
                {COMMON_BASE_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* SECTION 2: HARGA BELI & BATAS MINIMUM (ADMIN ONLY ACCESS) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span>2. Parameter Biaya &amp; Alert Stok (Akses Admin)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Rahasia / Terproteksi RLS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Harga Beli / HPP (buy_price) */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <label
                htmlFor="input-material-buy-price"
                className="font-bold text-emerald-900 dark:text-emerald-200 block"
              >
                Harga Beli / HPP Modal (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  Rp
                </span>
                <input
                  id="input-material-buy-price"
                  type="number"
                  min="0"
                  step="100"
                  required
                  placeholder="52000"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Kolom rahasia toko: Kasir PWA tidak dapat melihat nilai HPP modal ini.
              </p>
            </div>

            {/* Batas Minimum Alert (min_stock_alert) */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <label
                htmlFor="input-material-min-stock"
                className="font-bold text-amber-900 dark:text-amber-200 block"
              >
                Batas Alert Stok Menipis ({baseUnit || 'Unit'})
              </label>
              <input
                id="input-material-min-stock"
                type="number"
                min="1"
                required
                placeholder="10"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Jika stok display di Toko Utama &lt; batas ini, sistem akan memicu badge merah.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: VARIASI SATUAN PENJUALAN (product_units) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
              <Layers className="h-4 w-4 text-blue-500" />
              <span>3. Satuan Penjualan &amp; Harga Kasir (Multi-Satuan)</span>
            </div>
            <button
              id="btn-add-unit-variation"
              type="button"
              onClick={handleAddUnit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Variasi Satuan</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Contoh: Menjual eceran <strong>Sak</strong> (pengali: 1) dan grosir <strong>Palet</strong> (pengali: 40) atau <strong>Truk</strong>. Kasir dapat memilih satuan saat checkout.
          </p>

          <div className="space-y-3">
            {units.map((unitItem, index) => (
              <div
                key={index}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 grid grid-cols-12 gap-2.5 items-center"
              >
                {/* Nama Satuan */}
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                    {index === 0 ? 'Satuan Utama (Base):' : `Satuan Tambahan #${index + 1}:`}
                  </label>
                  <input
                    id={`unit-name-${index}`}
                    type="text"
                    required
                    placeholder={index === 0 ? baseUnit : 'Contoh: Palet / Truk'}
                    value={unitItem.unit_name}
                    onChange={(e) => handleUnitChange(index, 'unit_name', e.target.value)}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Pengali Konversi */}
                <div className="col-span-6 sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Pengali (x {baseUnit || 'Base'})</span>
                  </label>
                  <input
                    id={`unit-multiplier-${index}`}
                    type="number"
                    min="0.001"
                    step="any"
                    required
                    disabled={index === 0}
                    value={unitItem.conversion_multiplier}
                    onChange={(e) =>
                      handleUnitChange(index, 'conversion_multiplier', e.target.value)
                    }
                    className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:opacity-60"
                  />
                </div>

                {/* Harga Jual ke Pembeli */}
                <div className="col-span-5 sm:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                    Harga Jual Kasir (Rp):
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[11px]">
                      Rp
                    </span>
                    <input
                      id={`unit-price-${index}`}
                      type="number"
                      min="0"
                      step="100"
                      required
                      placeholder="58000"
                      value={unitItem.sell_price}
                      onChange={(e) => handleUnitChange(index, 'sell_price', e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tombol Hapus Satuan Tambahan */}
                <div className="col-span-1 sm:col-span-1 flex justify-center pt-4">
                  {index > 0 ? (
                    <button
                      id={`btn-remove-unit-${index}`}
                      type="button"
                      onClick={() => handleRemoveUnit(index)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                      title="Hapus variasi satuan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">
                      Base
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KONFIRMASI HAPUS MATERIAL (KHUSUS MODE EDIT) */}
        {showDeleteConfirm && isEditMode && (
          <div
            id="delete-confirm-box"
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
                <div className="font-extrabold">
                  Konfirmasi Hapus Material &quot;{materialToEdit?.name}&quot;?
                </div>
                <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                  Tindakan ini akan menghapus katalog material, variasi satuan, serta level stok
                  terkait secara permanen dari Supabase. Data tidak dapat dipulihkan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-white dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-material"
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Tombol Hapus (Kiri) */}
          <div>
            {isEditMode && !showDeleteConfirm && (
              <button
                id="btn-trigger-delete-material"
                type="button"
                disabled={isSubmitting || isDeleting}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Material Ini</span>
              </button>
            )}
          </div>

          {/* Tombol Batal & Simpan (Kanan) */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              id="btn-cancel-material-modal"
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              id="btn-submit-material-form"
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan ke Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>{isEditMode ? 'Simpan Perubahan' : 'Tambah Material'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function MaterialFormModal({
  isOpen,
  onClose,
  materialToEdit,
  onSuccess,
}: MaterialFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="material-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <MaterialFormContent
        key={materialToEdit?.id || 'new-material-entry'}
        materialToEdit={materialToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
