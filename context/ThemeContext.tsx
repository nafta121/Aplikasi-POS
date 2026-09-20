'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function getThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('tb_theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribeTheme(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    mql.removeEventListener('change', callback);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isExternalDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);
  const [localDark, setLocalDark] = useState<boolean | null>(null);

  const isDark = localDark !== null ? localDark : isExternalDark;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setLocalDark(next);
    localStorage.setItem('tb_theme', next ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  const setTheme = (dark: boolean) => {
    setLocalDark(dark);
    localStorage.setItem('tb_theme', dark ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

