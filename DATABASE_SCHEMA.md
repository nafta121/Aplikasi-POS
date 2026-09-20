# Database Schema & RLS Policies (Supabase PostgreSQL)

## Struktur Tabel
1. `profiles`: id (uuid), full_name, role ('admin', 'cashier').
2. `products`: id, sku, name, category, base_unit, buy_price, min_stock_alert.
3. `product_units`: id, product_id, unit_name, conversion_multiplier, sell_price.
4. `warehouses`: id, name, type ('toko_utama', 'gudang_logistik').
5. `inventory_levels`: product_id, warehouse_id, quantity.
6. `transactions`: id, invoice_number, cashier_id, total_amount, payment_method ('tunai', 'qris', 'tempo'), dp_amount, remaining_balance, due_date, status.
7. `transaction_items`: transaction_id, product_id, unit_name, conversion_multiplier, quantity, unit_price, subtotal_price.
8. `delivery_orders`: transaction_id, status, driver_name, vehicle_plate.

## Row Level Security (RLS) & Access Control
- **Admin:** Memiliki full CRUD access ke semua tabel.
- **Kasir:**
  - BISA INSERT ke `transactions` dan `transaction_items`.
  - TIDAK BISA SELECT kolom `buy_price` dari tabel `products`.

## Database Views (PENTING UNTUK FETCHING DATA KASIR)
- Saat membangun halaman POS Kasir, **JANGAN** fetch langsung dari tabel `products`. Query akan digagalkan oleh RLS karena `buy_price` dilindungi.
- **GUNAKAN VIEW `pos_catalog_view`**. View ini sudah membuang kolom `buy_price` dan aman untuk Kasir.
- Kolom pada `pos_catalog_view`: `id, sku, name, category, base_unit, min_stock_alert, unit_id, unit_name, conversion_multiplier, sell_price, stock_quantity, warehouse_name, warehouse_type`.

## Database Triggers
- Pengurangan stok **TIDAK PERLU** dihitung di kode TypeScript frontend/backend.
- Terdapat trigger `trg_deduct_stock` di Postgres yang berjalan saat ada INSERT di `transaction_items`. Trigger otomatis menghitung `(quantity * conversion_multiplier)` dan memotong stok di `inventory_levels` pada gudang `toko_utama`.
