# Project Context: POS & Logistik Toko Bangunan (Mekar Jaya)

## Ringkasan Proyek
Aplikasi ini adalah sistem Point of Sale (POS) dan Manajemen Logistik/Inventaris yang dirancang khusus untuk kompleksitas Toko Material/Bangunan.

## User Personas & Layout Constraints
1. **Kasir (Mobile-First / PWA)**
   - Perangkat: Smartphone Android.
   - UI/UX: Touch-friendly, Bottom Navigation Bar.
   - Rute Frontend: `/pos`, `/transactions`.
   - Hak Akses (Database): Sangat terbatas. Dilarang melihat harga modal (`buy_price`).

2. **Admin/Pemilik (Desktop-First)**
   - Perangkat: PC / Laptop.
   - UI/UX: Sidebar Navigation, Data Tables lebar, Kanban Board.
   - Rute Frontend: `/inventory`, `/settings`, `/employees`.
   - Hak Akses (Database): Full Access (CRUD).

## Logika Bisnis Utama (CRITICAL)
1. **Konversi Multi-Satuan:** Barang material memiliki satuan majemuk. Contoh: 1 Sak Semen = 40 Kg. Kasir bisa menjual dalam bentuk Sak atau Kg. Harga menyesuaikan satuan secara dinamis.
2. **Stok Multi-Gudang:** Stok dipisah antara "Toko Utama" (rak kasir) dan "Gudang Logistik" (gudang cadangan).
3. **Pembayaran Tempo (Piutang):** Kontraktor/pelanggan bisa membayar DP (Uang Muka) dan sisanya menjadi piutang dengan Tanggal Jatuh Tempo.
4. **Surat Jalan (Delivery Order):** Barang berat (Pasir/Besi) tidak dibawa langsung oleh pembeli, melainkan dikirim via armada toko dan membutuhkan cetak Surat Jalan.
