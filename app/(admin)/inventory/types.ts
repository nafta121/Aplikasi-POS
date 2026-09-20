export interface ProductUnitInput {
  id?: string;
  unit_name: string;
  conversion_multiplier: number;
  sell_price: number;
}

export interface InventoryMaterialItem {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  category: string;
  base_unit: string;
  buy_price: number;
  min_stock_alert: number;
  stockToko: number;
  stockGudang01: number;
  rackLocationToko?: string;
  rackLocationGudang?: string;
  units: ProductUnitInput[];
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fallback Material Items jika Supabase belum diisi atau sedang offline
 */
export const FALLBACK_INVENTORY: InventoryMaterialItem[] = [
  {
    id: 'inv-1',
    sku: 'SMN-GR-50',
    barcode: '899100100001',
    name: 'Semen Gresik Portland Composite 50 Kg',
    category: 'Material Dasar',
    base_unit: 'Sak',
    buy_price: 52000,
    min_stock_alert: 15,
    stockToko: 6,
    stockGudang01: 240,
    rackLocationToko: 'Area Depan Toko - Palet A1',
    rackLocationGudang: 'Gudang Barat - Blok Semen 01',
    units: [
      { unit_name: 'Sak', conversion_multiplier: 1, sell_price: 58000 },
      { unit_name: 'Palet (40 Sak)', conversion_multiplier: 40, sell_price: 2280000 },
    ],
  },
  {
    id: 'inv-2',
    sku: 'SMN-TR-50',
    barcode: '899100100002',
    name: 'Semen Tiga Roda Portland 50 Kg',
    category: 'Material Dasar',
    base_unit: 'Sak',
    buy_price: 53000,
    min_stock_alert: 15,
    stockToko: 4,
    stockGudang01: 180,
    rackLocationToko: 'Area Depan Toko - Palet A2',
    rackLocationGudang: 'Gudang Barat - Blok Semen 02',
    units: [
      { unit_name: 'Sak', conversion_multiplier: 1, sell_price: 59500 },
    ],
  },
  {
    id: 'inv-3',
    sku: 'BSI-ULR-10',
    barcode: '899100100003',
    name: 'Besi Beton Ulir 10mm SNI (12 Meter)',
    category: 'Besi & Baja',
    base_unit: 'Batang',
    buy_price: 74000,
    min_stock_alert: 20,
    stockToko: 8,
    stockGudang01: 450,
    rackLocationToko: 'Rak Pipa & Besi Depan',
    rackLocationGudang: 'Gudang Terbuka C1 - Rak Besi Panjang',
    units: [
      { unit_name: 'Batang', conversion_multiplier: 1, sell_price: 84000 },
      { unit_name: 'Ikat (50 Btg)', conversion_multiplier: 50, sell_price: 4100000 },
    ],
  },
  {
    id: 'inv-4',
    sku: 'BSI-PLS-08',
    barcode: '899100100004',
    name: 'Besi Beton Polos 8mm SNI (12 Meter)',
    category: 'Besi & Baja',
    base_unit: 'Batang',
    buy_price: 48000,
    min_stock_alert: 20,
    stockToko: 25,
    stockGudang01: 320,
    rackLocationToko: 'Rak Pipa & Besi Depan',
    rackLocationGudang: 'Gudang Terbuka C1 - Rak Besi Panjang',
    units: [
      { unit_name: 'Batang', conversion_multiplier: 1, sell_price: 56000 },
    ],
  },
  {
    id: 'inv-5',
    sku: 'PPA-RUC-D3',
    barcode: '899100100005',
    name: 'Pipa PVC Paralon Rucika D 3" (4 Meter)',
    category: 'Pipa & Sanitari',
    base_unit: 'Batang',
    buy_price: 76000,
    min_stock_alert: 10,
    stockToko: 18,
    stockGudang01: 150,
    rackLocationToko: 'Lorong B Rak Pipa Vertikal',
    rackLocationGudang: 'Gudang Utama - Rak D1',
    units: [
      { unit_name: 'Batang', conversion_multiplier: 1, sell_price: 88000 },
    ],
  },
  {
    id: 'inv-6',
    sku: 'PPA-RUC-AW05',
    barcode: '899100100006',
    name: 'Pipa PVC Paralon AW 1/2" Air Bersih',
    category: 'Pipa & Sanitari',
    base_unit: 'Batang',
    buy_price: 24000,
    min_stock_alert: 15,
    stockToko: 7,
    stockGudang01: 120,
    rackLocationToko: 'Lorong B Rak Pipa Vertikal',
    rackLocationGudang: 'Gudang Utama - Rak D2',
    units: [
      { unit_name: 'Batang', conversion_multiplier: 1, sell_price: 31000 },
    ],
  },
  {
    id: 'inv-7',
    sku: 'MAT-PSR-LMJ',
    barcode: '899100100007',
    name: 'Pasir Pasang Cor Hitam Super Lumajang',
    category: 'Material Dasar',
    base_unit: 'Truk',
    buy_price: 1350000,
    min_stock_alert: 5,
    stockToko: 2,
    stockGudang01: 45,
    rackLocationToko: 'Halaman Display Samping',
    rackLocationGudang: 'Depo Pasir & Agregat Belakang',
    units: [
      { unit_name: 'Truk', conversion_multiplier: 1, sell_price: 1650000 },
      { unit_name: 'Pick-up', conversion_multiplier: 0.33, sell_price: 600000 },
    ],
  },
  {
    id: 'inv-8',
    sku: 'CAT-DUL-WHT',
    barcode: '899100100008',
    name: 'Cat Tembok Dulux Catylac Interior Putih 25 Kg',
    category: 'Cat & Kimia',
    base_unit: 'Pail',
    buy_price: 490000,
    min_stock_alert: 8,
    stockToko: 14,
    stockGudang01: 65,
    rackLocationToko: 'Display Cat Utama Rak C2',
    rackLocationGudang: 'Gudang Timur - Rak Kimia',
    units: [
      { unit_name: 'Pail', conversion_multiplier: 1, sell_price: 575000 },
      { unit_name: 'Galon (5 Kg)', conversion_multiplier: 0.2, sell_price: 135000 },
    ],
  },
  {
    id: 'inv-9',
    sku: 'PKU-KYU-MIX',
    barcode: '899100100009',
    name: 'Paku Kayu Baja Super SNI Campur (10cm)',
    category: 'Perkakas & Alat',
    base_unit: 'Dus',
    buy_price: 140000,
    min_stock_alert: 10,
    stockToko: 32,
    stockGudang01: 85,
    rackLocationToko: 'Rak Baut & Fastener D1',
    rackLocationGudang: 'Gudang Utama Rak F3',
    units: [
      { unit_name: 'Dus', conversion_multiplier: 1, sell_price: 175000 },
      { unit_name: 'Kg', conversion_multiplier: 0.1, sell_price: 20000 },
    ],
  },
  {
    id: 'inv-10',
    sku: 'KRM-ROM-40',
    barcode: '899100100010',
    name: 'Keramik Lantai Roman 40x40 Putih Glossy',
    category: 'Keramik & Lantai',
    base_unit: 'Dus',
    buy_price: 58000,
    min_stock_alert: 12,
    stockToko: 5,
    stockGudang01: 210,
    rackLocationToko: 'Showroom Lantai 1 Display',
    rackLocationGudang: 'Gudang Keramik & Sanitary',
    units: [
      { unit_name: 'Dus', conversion_multiplier: 1, sell_price: 69000 },
    ],
  },
];
