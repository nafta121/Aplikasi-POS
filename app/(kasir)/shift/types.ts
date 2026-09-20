export interface ShiftTransactionItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  paymentMethod: 'tunai' | 'qris' | 'tempo' | string;
  totalAmount: number;
  createdAt: string;
}

export interface ShiftSummaryData {
  cashierId: string;
  cashierName: string;
  cashierRole: string;
  shiftDate: string;
  shiftStartTime: string;
  startingCash: number;
  cashSales: number;
  qrisSales: number;
  tempoSales: number;
  totalSales: number;
  transactionCount: number;
  expectedCash: number;
  recentTransactions: ShiftTransactionItem[];
  isFromSupabase: boolean;
}
