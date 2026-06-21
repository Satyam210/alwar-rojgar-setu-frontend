import { create } from 'zustand';

export type FontScale = 0.875 | 1 | 1.25;

interface A11yState {
  fontScale: FontScale;
  highContrast: boolean;
  setFontScale: (scale: FontScale) => void;
  decreaseFont: () => void;
  resetFont: () => void;
  increaseFont: () => void;
  toggleHighContrast: () => void;
  init: () => void;
}

const FONT_KEY = 'ars.fontScale';
const CONTRAST_KEY = 'ars.highContrast';

const SCALES: FontScale[] = [0.875, 1, 1.25];

function applyToDom(fontScale: number, highContrast: boolean): void {
  const root = document.documentElement;
  root.style.setProperty('--font-scale', String(fontScale));
  root.classList.toggle('high-contrast', highContrast);
}

/**
 * Accessibility toolbar state (HLD §8/§10): font resize (A- / A / A+) and a
 * high-contrast toggle, persisted to localStorage and applied to <html>.
 */
export const useA11yStore = create<A11yState>((set, get) => ({
  fontScale: 1,
  highContrast: false,

  init: () => {
    const storedScale = Number(localStorage.getItem(FONT_KEY)) as FontScale;
    const fontScale = SCALES.includes(storedScale) ? storedScale : 1;
    const highContrast = localStorage.getItem(CONTRAST_KEY) === 'true';
    applyToDom(fontScale, highContrast);
    set({ fontScale, highContrast });
  },

  setFontScale: (fontScale) => {
    localStorage.setItem(FONT_KEY, String(fontScale));
    applyToDom(fontScale, get().highContrast);
    set({ fontScale });
  },

  decreaseFont: () => {
    const idx = SCALES.indexOf(get().fontScale);
    get().setFontScale(SCALES[Math.max(0, idx - 1)]);
  },

  resetFont: () => get().setFontScale(1),

  increaseFont: () => {
    const idx = SCALES.indexOf(get().fontScale);
    get().setFontScale(SCALES[Math.min(SCALES.length - 1, idx + 1)]);
  },

  toggleHighContrast: () => {
    const highContrast = !get().highContrast;
    localStorage.setItem(CONTRAST_KEY, String(highContrast));
    applyToDom(get().fontScale, highContrast);
    set({ highContrast });
  },
}));
