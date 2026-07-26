'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

export type Theme = 'mono' | 'pastel';
export type Mode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mf-theme';
export const MODE_STORAGE_KEY = 'mf-mode';

// The inline script in layout.tsx applies the persisted choice to <html>
// before hydration, so the <html> element itself is the source of truth.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function getThemeSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'pastel' ? 'pastel' : 'mono';
}

function getModeSnapshot(): Mode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

interface ThemeContextValue {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => 'mono' as Theme);
  const mode = useSyncExternalStore(subscribe, getModeSnapshot, () => 'light' as Mode);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    if (next === 'pastel') {
      root.setAttribute('data-theme', 'pastel');
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    emit();
  }, []);

  const setMode = useCallback((next: Mode) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {}
    emit();
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
