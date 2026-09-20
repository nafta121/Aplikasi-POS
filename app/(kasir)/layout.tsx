import React from 'react';
import KasirLayoutClient from '@/components/kasir/KasirLayoutClient';

export const metadata = {
  title: 'POS Kasir Toko Bangunan',
  description: 'Aplikasi Kasir Mobile PWA Toko Bangunan - Point of Sale cepat dan cek stok real-time',
};

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KasirLayoutClient>{children}</KasirLayoutClient>;
}
