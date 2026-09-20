import React from 'react';
import { fetchInventory } from './actions';
import InventoryClientView from './InventoryClientView';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const { items, isFromSupabase } = await fetchInventory();

  return (
    <InventoryClientView
      initialItems={items}
      initialIsFromSupabase={isFromSupabase}
    />
  );
}
