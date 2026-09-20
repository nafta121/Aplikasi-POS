'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import {
  type ProductUnitInput,
  type InventoryMaterialItem,
  type ActionResult,
  FALLBACK_INVENTORY,
} from './types';

export type { ProductUnitInput, InventoryMaterialItem, ActionResult };

/**
 * Server Action: Mengambil data gabungan dari tabel products, product_units,
 * dan stok dari inventory_levels di Supabase.
 */
export async function fetchInventory(): Promise<{
  items: InventoryMaterialItem[];
  isFromSupabase: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Query gabungan tabel products dengan relasi product_units dan inventory_levels
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        barcode,
        name,
        category,
        base_unit,
        buy_price,
        min_stock_alert,
        product_units (
          id,
          product_id,
          unit_name,
          conversion_multiplier,
          sell_price
        ),
        inventory_levels (
          product_id,
          warehouse_id,
          quantity,
          warehouses (
            id,
            name,
            type
          )
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.warn('[fetchInventory Supabase Query Notice]:', error.message);
      return {
        items: FALLBACK_INVENTORY,
        isFromSupabase: false,
        error: error.message,
      };
    }

    if (!data || data.length === 0) {
      return {
        items: FALLBACK_INVENTORY,
        isFromSupabase: false,
      };
    }

    // Transformasi data relasi PostgreSQL Supabase ke format InventoryMaterialItem
    const formatted: InventoryMaterialItem[] = data.map((p) => {
      let stockToko = 0;
      let stockGudang01 = 0;

      if (Array.isArray(p.inventory_levels) && p.inventory_levels.length > 0) {
        p.inventory_levels.forEach((lvl: any) => {
          const qty = Number(lvl?.quantity) || 0;
          const wh = Array.isArray(lvl?.warehouses) ? lvl.warehouses[0] : lvl?.warehouses;
          const whType = wh?.type || '';
          const whName = (wh?.name || '').toLowerCase();

          if (whType === 'toko_utama' || whName.includes('toko') || whName.includes('display')) {
            stockToko += qty;
          } else {
            stockGudang01 += qty;
          }
        });
      }

      type UnitRow = {
        id?: string;
        unit_name?: string;
        conversion_multiplier?: number | string;
        sell_price?: number | string;
      };

      const rawUnits: UnitRow[] = Array.isArray(p.product_units) ? p.product_units : [];
      const units: ProductUnitInput[] = rawUnits.map((u) => ({
        id: u.id,
        unit_name: u.unit_name || p.base_unit || 'Pcs',
        conversion_multiplier: Number(u.conversion_multiplier) || 1,
        sell_price: Number(u.sell_price) || 0,
      }));

      // Pastikan setidaknya memiliki 1 unit dasar
      if (units.length === 0) {
        units.push({
          unit_name: p.base_unit || 'Pcs',
          conversion_multiplier: 1,
          sell_price: Number(p.buy_price) ? Math.round(Number(p.buy_price) * 1.15) : 0,
        });
      }

      return {
        id: p.id,
        sku: p.sku,
        barcode: p.barcode || p.sku,
        name: p.name,
        category: p.category || 'Material Dasar',
        base_unit: p.base_unit || 'Pcs',
        buy_price: Number(p.buy_price) || 0,
        min_stock_alert: Number(p.min_stock_alert) || 10,
        stockToko,
        stockGudang01,
        rackLocationToko: 'Toko Utama',
        rackLocationGudang: 'Gudang 01',
        units,
      };
    });

    return {
      items: formatted,
      isFromSupabase: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[fetchInventory Exception]:', msg);
    return {
      items: FALLBACK_INVENTORY,
      isFromSupabase: false,
      error: msg,
    };
  }
}

/**
 * Server Action: Melakukan INSERT ke tabel products (termasuk kolom rahasia buy_price),
 * lalu INSERT ke product_units untuk variasi satuannya, dan inisialisasi stok 0 di inventory_levels.
 */
export async function createMaterial(formData: FormData): Promise<ActionResult<InventoryMaterialItem>> {
  try {
    const supabase = await createClient();

    const sku = (formData.get('sku') as string || '').trim().toUpperCase();
    const barcode = (formData.get('barcode') as string || '').trim() || sku;
    const name = (formData.get('name') as string || '').trim();
    const category = (formData.get('category') as string || 'Material Dasar').trim();
    const base_unit = (formData.get('base_unit') as string || 'Pcs').trim();
    const buy_price = parseFloat((formData.get('buy_price') as string) || '0');
    const min_stock_alert = parseInt((formData.get('min_stock_alert') as string) || '10', 10);

    if (!sku || !name) {
      return { success: false, error: 'SKU dan Nama Material wajib diisi.' };
    }

    // 1. Eksekusi INSERT ke tabel products
    const { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert({
        sku,
        barcode,
        name,
        category,
        base_unit,
        buy_price: isNaN(buy_price) ? 0 : buy_price,
        min_stock_alert: isNaN(min_stock_alert) ? 10 : min_stock_alert,
      })
      .select()
      .single();

    if (prodError || !newProduct) {
      console.error('[createMaterial products error]:', prodError);
      return {
        success: false,
        error: prodError?.message || 'Gagal menambahkan material ke tabel products Supabase.',
      };
    }

    // 2. Eksekusi INSERT ke tabel product_units
    let unitsList: ProductUnitInput[] = [];
    const unitsJson = formData.get('units_json') as string;

    if (unitsJson) {
      try {
        unitsList = JSON.parse(unitsJson);
      } catch {
        // Fallback jika parsing JSON gagal
      }
    }

    // Jika tidak ada JSON units atau kosong, buat unit default dari form dasar
    if (unitsList.length === 0) {
      const sell_price = parseFloat((formData.get('sell_price') as string) || '0');
      unitsList.push({
        unit_name: base_unit,
        conversion_multiplier: 1,
        sell_price: isNaN(sell_price) ? 0 : sell_price,
      });
    }

    const unitsToInsert = unitsList.map((u) => ({
      product_id: newProduct.id,
      unit_name: u.unit_name || base_unit,
      conversion_multiplier: Number(u.conversion_multiplier) || 1,
      sell_price: Number(u.sell_price) || 0,
    }));

    const { error: unitsError } = await supabase
      .from('product_units')
      .insert(unitsToInsert);

    if (unitsError) {
      console.warn('[createMaterial product_units error]:', unitsError.message);
    }

    // 3. Inisialisasi stok 0 di inventory_levels
    try {
      const { data: warehouses } = await supabase
        .from('warehouses')
        .select('id, name, type');

      if (warehouses && warehouses.length > 0) {
        const levelsToInsert = warehouses.map((wh) => ({
          product_id: newProduct.id,
          warehouse_id: wh.id,
          quantity: 0,
        }));
        await supabase.from('inventory_levels').insert(levelsToInsert);
      }
    } catch (whErr) {
      console.warn('[createMaterial inventory_levels init notice]:', whErr);
    }

    revalidatePath('/inventory');
    revalidatePath('/pos');

    return {
      success: true,
      data: {
        id: newProduct.id,
        sku: newProduct.sku,
        barcode: newProduct.barcode,
        name: newProduct.name,
        category: newProduct.category,
        base_unit: newProduct.base_unit,
        buy_price: newProduct.buy_price,
        min_stock_alert: newProduct.min_stock_alert,
        stockToko: 0,
        stockGudang01: 0,
        units: unitsList,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[createMaterial Exception]:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Melakukan UPDATE pada products dan product_units berdasarkan ID.
 */
export async function updateMaterial(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const id = (formData.get('id') as string || '').trim();
    const sku = (formData.get('sku') as string || '').trim().toUpperCase();
    const barcode = (formData.get('barcode') as string || '').trim() || sku;
    const name = (formData.get('name') as string || '').trim();
    const category = (formData.get('category') as string || 'Material Dasar').trim();
    const base_unit = (formData.get('base_unit') as string || 'Pcs').trim();
    const buy_price = parseFloat((formData.get('buy_price') as string) || '0');
    const min_stock_alert = parseInt((formData.get('min_stock_alert') as string) || '10', 10);

    if (!id || !sku || !name) {
      return { success: false, error: 'ID, SKU, dan Nama Material wajib diisi.' };
    }

    // 1. UPDATE tabel products
    const { error: prodError } = await supabase
      .from('products')
      .update({
        sku,
        barcode,
        name,
        category,
        base_unit,
        buy_price: isNaN(buy_price) ? 0 : buy_price,
        min_stock_alert: isNaN(min_stock_alert) ? 10 : min_stock_alert,
      })
      .eq('id', id);

    if (prodError) {
      console.error('[updateMaterial products error]:', prodError);
      return { success: false, error: prodError.message };
    }

    // 2. UPDATE tabel product_units
    const unitsJson = formData.get('units_json') as string;
    if (unitsJson) {
      try {
        const unitsList: ProductUnitInput[] = JSON.parse(unitsJson);
        if (Array.isArray(unitsList) && unitsList.length > 0) {
          // Hapus unit lama dan simpan unit terbaru
          await supabase.from('product_units').delete().eq('product_id', id);

          const unitsToInsert = unitsList.map((u) => ({
            product_id: id,
            unit_name: u.unit_name || base_unit,
            conversion_multiplier: Number(u.conversion_multiplier) || 1,
            sell_price: Number(u.sell_price) || 0,
          }));

          const { error: unitsError } = await supabase
            .from('product_units')
            .insert(unitsToInsert);

          if (unitsError) {
            console.warn('[updateMaterial product_units insert warning]:', unitsError.message);
          }
        }
      } catch (jsonErr) {
        console.warn('[updateMaterial units_json parse warning]:', jsonErr);
      }
    }

    revalidatePath('/inventory');
    revalidatePath('/pos');

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[updateMaterial Exception]:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Menghapus data material beserta variasinya.
 */
export async function deleteMaterial(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    if (!id) {
      return { success: false, error: 'ID material tidak valid.' };
    }

    // 1. Hapus relasi product_units
    const { error: puError } = await supabase
      .from('product_units')
      .delete()
      .eq('product_id', id);

    if (puError) {
      console.warn('[deleteMaterial product_units notice]:', puError.message);
    }

    // 2. Hapus relasi inventory_levels
    const { error: ilError } = await supabase
      .from('inventory_levels')
      .delete()
      .eq('product_id', id);

    if (ilError) {
      console.warn('[deleteMaterial inventory_levels notice]:', ilError.message);
    }

    // 3. Hapus data utama di tabel products
    const { error: prodError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (prodError) {
      console.error('[deleteMaterial products error]:', prodError);
      return { success: false, error: prodError.message };
    }

    revalidatePath('/inventory');
    revalidatePath('/pos');

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[deleteMaterial Exception]:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Server Action opsional: Seed material default ke Supabase jika tabel masih kosong
 */
export async function seedInitialMaterialsAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createClient();

    // 1. Periksa apakah gudang sudah ada, jika belum buat default
    let tokoId = '';
    let gudangId = '';

    const { data: whs } = await supabase.from('warehouses').select('id, type');
    if (whs && whs.length > 0) {
      tokoId = whs.find((w) => w.type === 'toko_utama')?.id || whs[0].id;
      gudangId = whs.find((w) => w.type === 'gudang_logistik')?.id || whs[1]?.id || tokoId;
    }

    let insertedCount = 0;

    for (const item of FALLBACK_INVENTORY) {
      const { data: newProd, error: pErr } = await supabase
        .from('products')
        .insert({
          sku: item.sku,
          barcode: item.barcode || item.sku,
          name: item.name,
          category: item.category,
          base_unit: item.base_unit,
          buy_price: item.buy_price,
          min_stock_alert: item.min_stock_alert,
        })
        .select()
        .single();

      if (!pErr && newProd) {
        insertedCount++;

        // Insert units
        if (item.units && item.units.length > 0) {
          const unitsToInsert = item.units.map((u) => ({
            product_id: newProd.id,
            unit_name: u.unit_name,
            conversion_multiplier: u.conversion_multiplier,
            sell_price: u.sell_price,
          }));
          await supabase.from('product_units').insert(unitsToInsert);
        }

        // Insert inventory levels
        if (tokoId) {
          await supabase.from('inventory_levels').insert([
            { product_id: newProd.id, warehouse_id: tokoId, quantity: item.stockToko },
            { product_id: newProd.id, warehouse_id: gudangId, quantity: item.stockGudang01 },
          ]);
        }
      }
    }

    revalidatePath('/inventory');
    revalidatePath('/pos');

    return { success: true, data: { count: insertedCount } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
