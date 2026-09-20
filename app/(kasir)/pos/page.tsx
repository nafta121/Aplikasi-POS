import React from 'react';
import { createClient } from '@/utils/supabase/server';
import {
  type POSProduct,
  type CatalogViewRow,
  groupCatalogRows,
} from '@/utils/supabase/pos';
import POSClientView from './POSClientView';

export const dynamic = 'force-dynamic';

export default async function KasirPOSPage() {
  let products: POSProduct[] = [];
  let isFromSupabase = false;
  let dbError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pos_catalog_view')
      .select('*');

    if (error) {
      console.warn('Gagal memuat katalog dari view pos_catalog_view:', error.message);
      dbError = error.message;
    } else if (data && data.length > 0) {
      products = groupCatalogRows(data as CatalogViewRow[]);
      isFromSupabase = true;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Koneksi ke Supabase gagal.';
    console.warn('Kesalahan saat fetch pos_catalog_view di Server Component:', message);
    dbError = message;
  }

  return (
    <POSClientView
      initialProducts={products}
      isFromSupabase={isFromSupabase}
      dbError={dbError}
    />
  );
}
