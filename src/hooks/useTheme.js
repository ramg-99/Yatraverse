import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore.js';

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = theme === 'dark' || (theme === 'system' && sysDark);
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
  }, [theme]);
}
