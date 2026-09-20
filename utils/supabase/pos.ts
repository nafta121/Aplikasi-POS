import { createClient } from './client';

// ==========================================
// TYPE DEFINITIONS POS & SUPABASE
// ==========================================
export interface ProductUnit {
  name: string; // e.g. 'Sak', 'Kg', 'Batang', 'Meter', 'Pail', 'Galon'
  price: number; // e.g. 52000
  multiplier: number; // relative to base unit
}

export interface POSProduct {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  stock: number; // in base unit
  minStock: number;
  baseUnit: string;
  location: string;
  units: ProductUnit[];
  badge?: string;
}

export interface POSCartItem {
  id: string; // unique key: `${product.id}-${selectedUnit.name}`
  product: POSProduct;
  selectedUnit: ProductUnit;
  quantity: number;
  subtotal: number;
}

export interface CompletedTransaction {
  invoiceNumber: string;
  createdAt: string;
  items: POSCartItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'qris' | 'tempo';
  cashPaid?: number;
  change?: number;
  contractorName?: string;
  downPayment?: number;
  remainingCredit?: number;
  dueDate?: string;
  savedToDatabase?: boolean;
}

// Flat View Row dari PostgreSQL View `pos_catalog_view`
export interface CatalogViewRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  base_unit?: string;
  min_stock_alert?: number;
  unit_id?: string;
  unit_name: string;
  conversion_multiplier: number | string;
  sell_price: number | string;
  stock_quantity: number | string;
  warehouse_name?: string;
  warehouse_type?: string;
}

export interface GroupedProduct {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  units: {
    unit_name: string;
    sell_price: number;
    conversion_multiplier: number;
  }[];
}

export interface CheckoutCustomerData {
  customerName?: string;
  customerPhone?: string;
  cashPaid?: number;
  dpAmount?: number;
  dueDate?: string;
  notes?: string;
}

// =========================================================================
// HELPER: GROUPING ROW FLAT DARI VIEW `pos_catalog_view`
// =========================================================================
/**
 * Mengelompokkan output baris flat SQL view pos_catalog_view menjadi objek
 * produk bersarang dengan array units: [{ name, price, multiplier }]
 */
export function groupCatalogRows(rows: CatalogViewRow[]): POSProduct[] {
  const map = new Map<string, POSProduct>();

  rows.forEach((row) => {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        sku: row.sku,
        barcode: row.sku,
        name: row.name,
        category: row.category || 'Material Dasar',
        stock: Number(row.stock_quantity) || 0,
        minStock: Number(row.min_stock_alert) || 10,
        baseUnit: row.base_unit || row.unit_name || 'Pcs',
        location: row.warehouse_name || 'Toko Utama',
        badge:
          Number(row.stock_quantity) <= (Number(row.min_stock_alert) || 10)
            ? 'Stok Kritis'
            : undefined,
        units: [],
      });
    }

    const prod = map.get(row.id)!;
    const exists = prod.units.some((u) => u.name === row.unit_name);
    if (!exists && row.unit_name) {
      prod.units.push({
        name: row.unit_name,
        price: Number(row.sell_price) || 0,
        multiplier: Number(row.conversion_multiplier) || 1,
      });
    }
  });

  return Array.from(map.values()).map((p) => {
    if (p.units.length === 0) {
      p.units.push({ name: p.baseUnit, price: 0, multiplier: 1 });
    }
    return p;
  });
}

// =========================================================================
