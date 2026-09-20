import React from 'react';
import { createClient } from '@/utils/supabase/server';
import {
  type CatalogViewRow,
  type POSProduct,
  groupCatalogRows,
} from '@/utils/supabase/pos';
import CekStokClientView, {
  type StockMaterialItem,
} from '@/components/kasir/CekStokClientView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cek Stok Material - POS Toko Bangunan',
  description: 'Pencarian cepat sisa stok gudang dan lokasi rak fisik material bangunan.',
};

export default async function CekStokPage() {
  let materials: StockMaterialItem[] = [];
  let isFromSupabase = false;
  let dbError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pos_catalog_view')
      .select('*');

    if (error) {
      console.warn('Gagal memuat pos_catalog_view di Cek Stok:', error.message);
      dbError = error.message;
    } else if (data && data.length > 0) {
      const grouped: POSProduct[] = groupCatalogRows(data as CatalogViewRow[]);
      materials = grouped.map((item) => ({
        id: item.id,
        sku: item.sku,
        barcode: item.barcode,
        name: item.name,
        category: item.category,
        stock: item.stock,
        minStock: item.minStock,
        baseUnit: item.baseUnit,
        location: item.location || 'Toko Utama',
        units: item.units,
      }));
      isFromSupabase = true;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Koneksi ke Supabase gagal.';
    console.warn('Kesalahan saat fetch pos_catalog_view di Cek Stok:', message);
    dbError = message;
  }

  return (
    <CekStokClientView
      initialMaterials={materials}
      isFromSupabase={isFromSupabase}
      dbError={dbError}
    />
  );
}
