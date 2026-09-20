'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

export default function ServiceWorkerRegister() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-banner"
      className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200"
    >
      <WifiOff className="h-4 w-4" />
      <span>Mode Offline Aktif • Transaksi kasir tersimpan di cache lokal</span>
    </div>
  );
}
