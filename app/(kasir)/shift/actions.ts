'use server';

import { createClient } from '@/utils/supabase/server';
import type { ShiftSummaryData, ShiftTransactionItem } from './types';

export async function fetchActiveShiftSummary(): Promise<ShiftSummaryData> {
  const supabase = await createClient();

  let cashierName = 'Siti Rahma (Kasir)';
  let cashierId = 'emp-01';
  let cashierRole = 'cashier';

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      cashierId = authData.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', cashierId)
        .single();

      if (profile?.full_name) {
        cashierName = profile.full_name;
        cashierRole = profile.role || 'cashier';
      } else if (authData.user.email) {
        cashierName = authData.user.email.split('@')[0];
      }
    }
  } catch {
    // Guest / development session fallback
  }

  // Tentukan batas waktu awal hari ini (00:00:00)
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const startOfDayIso = startOfDay.toISOString();

  let isFromSupabase = false;
  let rawTransactions: any[] = [];

  try {
    // 1. Ambil transaksi hari ini
    const { data: todayTx, error: todayErr } = await supabase
      .from('transactions')
      .select('id, invoice_number, customer_name, payment_method, total_amount, created_at, cashier_id')
      .gte('created_at', startOfDayIso)
      .order('created_at', { ascending: false });

    if (!todayErr && todayTx) {
      isFromSupabase = true;
      rawTransactions = todayTx;
    }

    // 2. Jika hari ini belum ada transaksi, cek transaksi terbaru di tabel transactions
    if (rawTransactions.length === 0) {
      const { data: anyTx, error: anyErr } = await supabase
        .from('transactions')
        .select('id, invoice_number, customer_name, payment_method, total_amount, created_at, cashier_id')
        .order('created_at', { ascending: false })
        .limit(25);

      if (!anyErr && anyTx && anyTx.length > 0) {
        isFromSupabase = true;
        rawTransactions = anyTx;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca transaksi Supabase untuk shift:', err);
  }

  let cashSales = 0;
  let qrisSales = 0;
  let tempoSales = 0;

  const recentTransactions: ShiftTransactionItem[] = rawTransactions.map((tx) => {
    const amount = Number(tx.total_amount) || 0;
    const pm = String(tx.payment_method || '').toLowerCase();

    if (pm === 'tunai' || pm === 'cash') {
      cashSales += amount;
    } else if (pm === 'qris' || pm === 'transfer') {
      qrisSales += amount;
    } else if (pm === 'tempo' || pm === 'piutang') {
      tempoSales += amount;
    } else {
      cashSales += amount;
    }

    return {
      id: String(tx.id),
      invoiceNumber: tx.invoice_number || `INV-${String(tx.id).slice(-4)}`,
      customerName: tx.customer_name || 'Pembeli Umum',
      paymentMethod: pm || 'tunai',
      totalAmount: amount,
      createdAt: tx.created_at || new Date().toISOString(),
    };
  });

  const totalSales = cashSales + qrisSales + tempoSales;
  const startingCash = 500000; // Modal awal kas laci
  const expectedCash = startingCash + cashSales;

  return {
    cashierId,
    cashierName,
    cashierRole,
    shiftDate: today.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    shiftStartTime: '07:30 WIB',
    startingCash,
    cashSales,
    qrisSales,
    tempoSales,
    totalSales,
    transactionCount: recentTransactions.length,
    expectedCash,
    recentTransactions,
    isFromSupabase,
  };
}
