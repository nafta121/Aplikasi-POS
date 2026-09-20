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
// KERANGKA ASYNC: INSERT TRANSAKSI & ITEMS KE SUPABASE
// =========================================================================
/**
 * Kerangka fungsi asynchronous untuk mengeksekusi INSERT ke tabel `transactions`
 * dan `transaction_items` di Supabase.
 */
export async function processCheckout(
  cart: POSCartItem[],
  paymentMethod: 'cash' | 'qris' | 'tempo',
  customerData: CheckoutCustomerData
) {
  const supabase = createClient();
  const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const invoiceNumber = `INV-TB-${Date.now().toString().slice(-6)}`;

  // 1. Ambil session user aktif kasir (fallback dummy UUID jika session belum login)
  let cashierId = '00000000-0000-0000-0000-000000000000';
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      cashierId = data.user.id;
    }
  } catch {
    // Abaikan error auth jika masih dalam mode development/mock
  }

  const remainingBalance =
    paymentMethod === 'tempo'
      ? Math.max(0, totalAmount - (customerData.dpAmount || 0))
      : 0;

  // 2. INSERT ke tabel `transactions`
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      invoice_number: invoiceNumber,
      cashier_id: cashierId,
      customer_name: customerData.customerName || 'Pembeli Umum',
      customer_phone: customerData.customerPhone || null,
      total_amount: totalAmount,
      payment_method:
        paymentMethod === 'cash'
          ? 'tunai'
          : paymentMethod === 'qris'
          ? 'qris'
          : 'tempo',
      cash_paid:
        paymentMethod === 'cash' ? customerData.cashPaid || totalAmount : 0,
      change_amount:
        paymentMethod === 'cash'
          ? Math.max(0, (customerData.cashPaid || 0) - totalAmount)
          : 0,
      dp_amount: customerData.dpAmount || 0,
      remaining_balance: remainingBalance,
      due_date: paymentMethod === 'tempo' ? customerData.dueDate : null,
      status:
        paymentMethod === 'tempo' && remainingBalance > 0
          ? 'piutang_berjalan'
          : 'lunas',
      notes: customerData.notes || null,
    })
    .select()
    .single();

  if (txError) {
    console.warn('Peringatan: Gagal insert ke tabel transactions di Supabase:', txError);
    return { success: false, error: txError, invoiceNumber };
  }

  // 3. Persiapkan array data rincian item belanja untuk `transaction_items`
  const itemsToInsert = cart.map((item) => ({
    transaction_id: transaction.id,
    product_id: item.product.id,
    unit_name: item.selectedUnit.name,
    conversion_multiplier: item.selectedUnit.multiplier,
    quantity: item.quantity,
    unit_price: item.selectedUnit.price,
    subtotal_price: item.subtotal,
  }));

  // 4. INSERT ke tabel `transaction_items`
  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.warn('Peringatan: Gagal insert ke tabel transaction_items di Supabase:', itemsError);
    return { success: false, error: itemsError, transaction, invoiceNumber };
  }

  return { success: true, transaction, invoiceNumber };
}
