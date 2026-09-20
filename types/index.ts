export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string; // Sak, Batang, Pail, Meter, Dus, Pcs, Kg
  costPrice: number; // Harga Modal
  sellingPrice: number; // Harga Jual
  stock: number;
  minStock: number;
  location: string; // Rak A-1, Gudang Besi, dll.
  imageUrl?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  subtotal: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'qris' | 'transfer' | 'tempo';
  status: 'paid' | 'pending' | 'credit';
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  items: TransactionItem[];
  notes?: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number; // Modal Kas Awal
  totalSales: number;
  cashSales: number;
  qrisSales: number;
  tempoSales: number;
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  status: 'active' | 'closed';
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'kasir' | 'gudang' | 'driver';
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
}
