import React, { useCallback, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme } from '../lib/theme';

export function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = useCallback(() => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore */
    }
    setDark(next === 'dark');
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 ${className}`}
      title={dark ? 'Açık tema' : 'Koyu tema'}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
