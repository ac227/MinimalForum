'use client';

import { useTheme, type Theme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const THEMES: Array<{ value: Theme; label: string }> = [
  { value: 'mono', label: 'Mono' },
  { value: 'pastel', label: 'Pastel' },
];

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeControls() {
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div
        role="group"
        aria-label="Color theme"
        className="inline-flex items-center rounded-full border border-border bg-card p-0.5"
      >
        {THEMES.map((option) => {
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(option.value)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {mode === 'dark' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}
