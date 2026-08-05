import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'darkMode';

function getInitialValue(fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    /* localStorage may be unavailable */
  }
  return fallback;
}

export function useDarkMode(initialDarkMode = true) {
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialValue(initialDarkMode));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isDarkMode));
    } catch {
      /* ignore */
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return { isDarkMode, toggleDarkMode };
}
