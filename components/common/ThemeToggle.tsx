'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      className={`inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${className}`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 animate-in fade-in" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600 animate-in fade-in" />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </button>
  );
}
