import React from 'react';
import { fetchInventory, fetchDeliveryOrders } from './actions';
import InventoryClientView from './InventoryClientView';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const [{ items, isFromSupabase }, deliveryOrders] = await Promise.all([
    fetchInventory(),
    fetchDeliveryOrders(),
  ]);

  return (
    <InventoryClientView
      initialItems={items}
      initialIsFromSupabase={isFromSupabase}
      initialDeliveryOrders={deliveryOrders}
    />
  );
}
