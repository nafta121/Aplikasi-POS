import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Transaction, Shift } from '@/types';
import { MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_ACTIVE_SHIFT } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('xyzcompany')
);

// Inisialisasi Supabase Client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Service Helper Realtime & Sync Data
 * Berjalan dengan Supabase jika env terisi, atau fallback ke mock data lokal.
 */
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch {
      console.warn('Supabase fetch failed, falling back to local mock data');
    }
  }
  return MOCK_PRODUCTS;
}

export async function getTransactions(): Promise<Transaction[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, items:transaction_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Transaction[];
      }
    } catch {
      console.warn('Supabase fetch failed, falling back to local mock data');
    }
  }
  return MOCK_TRANSACTIONS;
}

export async function getActiveShift(): Promise<Shift> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .single();

      if (!error && data) {
        return data as Shift;
      }
    } catch {
      console.warn('Supabase fetch failed, falling back to local active shift');
    }
  }
  return MOCK_ACTIVE_SHIFT;
}

/**
 * Realtime Subscription for Products & Inventory Changes
 */
export function subscribeToInventory(onUpdate: (product: Product) => void) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel('realtime_inventory')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Product);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
