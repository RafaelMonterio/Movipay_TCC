'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_THEME = {
  darkMode: false,
  highContrast: false,
  daltonism: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
  fontSize: 100, // percentage
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('movipay-theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTheme(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to parse theme from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;

    const html = document.documentElement;

    // Apply dark mode
    html.dataset.darkMode = String(theme.darkMode);

    // Apply high contrast
    html.dataset.highContrast = String(theme.highContrast);

    // Apply daltonism filter
    html.dataset.daltonism = theme.daltonism;

    // Apply font size
    if (theme.fontSize !== 100) {
      html.style.fontSize = theme.fontSize + '%';
    } else {
      html.style.fontSize = '';
    }

    // Apply SVG filters for color blindness
    applyDaltonismFilters(html, theme.daltonism);
    applyHighContrastFilter(html, theme.highContrast);

  }, [theme, mounted]);

  // Inject SVG filters for color blindness
  const applyDaltonismFilters = useCallback((html, daltonism) => {
    if (typeof document === 'undefined') return;

    let svg = document.getElementById('a11y-daltonism-filters');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'a11y-daltonism-filters';
      svg.style.cssText = 'position:absolute;width:0;height:0;';
      svg.innerHTML = `
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="
            0.567, 0.433, 0, 0, 0
            0.558, 0.442, 0, 0, 0
            0, 0.242, 0.758, 0, 0
            0, 0, 0, 1, 0
          "/>
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="
            0.625, 0.375, 0, 0, 0
            0.7, 0.3, 0, 0, 0
            0, 0.3, 0.7, 0, 0
            0, 0, 0, 1, 0
          "/>
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="
            0.95, 0.05, 0, 0, 0
            0, 0.433, 0.567, 0, 0
            0, 0.475, 0.525, 0, 0
            0, 0, 0, 1, 0
          "/>
        </filter>
      `;
      document.body.prepend(svg);
    }
  }, []);

  const applyHighContrastFilter = useCallback((html, highContrast) => {
    if (!highContrast) {
      html.style.filter = html.style.filter.replace('contrast(1.8)', '').trim();
      html.style.webkitFilter = html.style.webkitFilter.replace('contrast(1.8)', '').trim();
      return;
    }

    const currentFilter = html.style.filter || '';
    const currentWebkitFilter = html.style.webkitFilter || '';

    if (!currentFilter.includes('contrast(1.8)')) {
      html.style.filter = (currentFilter + ' contrast(1.8)').trim();
      html.style.webkitFilter = (currentWebkitFilter + ' contrast(1.8)').trim();
    }
  }, []);

  // Save to localStorage
  const saveTheme = useCallback((newTheme) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('movipay-theme', JSON.stringify(newTheme));
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setTheme(prev => {
      const newTheme = { ...prev, darkMode: !prev.darkMode };
      saveTheme(newTheme);
      return newTheme;
    });
  }, [saveTheme]);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    setTheme(prev => {
      const newTheme = { ...prev, highContrast: !prev.highContrast };
      saveTheme(newTheme);
      return newTheme;
    });
  }, [saveTheme]);

  // Set daltonism (only one at a time)
  const setDaltonism = useCallback((type) => {
    setTheme(prev => {
      const newTheme = { ...prev, daltonism: prev.daltonism === type ? 'none' : type };
      saveTheme(newTheme);
      return newTheme;
    });
  }, [saveTheme]);

  // Set font size
  const setFontSize = useCallback((size) => {
    setTheme(prev => {
      const newTheme = { ...prev, fontSize: size };
      saveTheme(newTheme);
      return newTheme;
    });
  }, [saveTheme]);

  // Reset all accessibility settings
  const resetAccessibility = useCallback(() => {
    const newTheme = { ...DEFAULT_THEME };
    saveTheme(newTheme);
    setTheme(newTheme);
  }, [saveTheme]);

  const value = {
    ...theme,
    mounted,
    toggleDarkMode,
    toggleHighContrast,
    setDaltonism,
    setFontSize,
    resetAccessibility,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}

// Helper to get theme colors based on dark mode
export function getThemeColors(darkMode) {
  return darkMode
    ? {
        bg: '#121A0F',
        bgAlt: '#0D130B',
        cardBg: 'rgba(26,36,23,0.85)',
        cardBorder: 'rgba(243,239,226,0.09)',
        line: 'rgba(243,239,226,0.13)',
        text: '#F3EFE2',
        textMuted: '#8AA085',
        mono: '#FFB627',
        headerBg: 'rgba(18,26,15,0.94)',
        headerBorder: 'rgba(243,239,226,0.07)',
      }
    : {
        bg: '#FAF6EC',
        bgAlt: '#F1EAD9',
        cardBg: 'rgba(255,255,255,0.92)',
        cardBorder: 'rgba(23,36,26,0.09)',
        line: 'rgba(23,36,26,0.13)',
        text: '#17241A',
        textMuted: '#5B6B57',
        mono: '#8A4A00',
        headerBg: 'rgba(250,246,236,0.92)',
        headerBorder: 'rgba(23,36,26,0.07)',
      };
}