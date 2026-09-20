'use server';

import { createClient } from '@/utils/supabase/server';
import type { POSCartItem, CheckoutCustomerData } from '@/utils/supabase/pos';

export async function processCheckoutAction(
  cart: POSCartItem[],
  paymentMethod: 'cash' | 'qris' | 'tempo',
  customerData: CheckoutCustomerData
) {
  const supabase = await createClient();
  const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const invoiceNumber = `INV-TB-${Date.now().toString().slice(-6)}`;

  let cashierId = '00000000-0000-0000-0000-000000000000';
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      cashierId = data.user.id;
    }
  } catch {
    // Ignore
  }

  const remainingBalance =
    paymentMethod === 'tempo'
      ? Math.max(0, totalAmount - (customerData.dpAmount || 0))
      : 0;

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
    return { success: false, error: txError.message, invoiceNumber };
  }

  const itemsToInsert = cart.map((item) => ({
    transaction_id: transaction.id,
    product_id: item.product.id,
    unit_name: item.selectedUnit.name,
    conversion_multiplier: item.selectedUnit.multiplier,
    quantity: item.quantity,
    unit_price: item.selectedUnit.price,
    subtotal_price: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.warn('Peringatan: Gagal insert ke tabel transaction_items di Supabase:', itemsError);
    return { success: false, error: itemsError.message, transaction, invoiceNumber };
  }

  return { success: true, transaction, invoiceNumber };
}
