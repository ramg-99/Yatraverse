import { create } from 'zustand';

const savedMode = localStorage.getItem('yatra_mode') || 'light';
const savedStyle = localStorage.getItem('yatra_style') || 'modern';

export function applyThemeToDOM(mode, style) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'theme-modern', 'theme-classic');
  root.classList.add(mode);
  root.classList.add(`theme-${style}`);
}

// Initial application
if (typeof window !== 'undefined') {
  applyThemeToDOM(savedMode, savedStyle);
}

export const useThemeStore = create((set) => ({
  mode: savedMode,
  themeStyle: savedStyle,

  toggleMode: () =>
    set((state) => {
      const nextMode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('yatra_mode', nextMode);
      applyThemeToDOM(nextMode, state.themeStyle);
      return { mode: nextMode };
    }),

  setMode: (mode) =>
    set((state) => {
      localStorage.setItem('yatra_mode', mode);
      applyThemeToDOM(mode, state.themeStyle);
      return { mode };
    }),

  setThemeStyle: (style) =>
    set((state) => {
      localStorage.setItem('yatra_style', style);
      applyThemeToDOM(state.mode, style);
      return { themeStyle: style };
    }),
}));
