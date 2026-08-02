import { useState, useEffect, useCallback } from 'react';

export function useDarkMode(initialState?: boolean) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('isDarkMode');
        if (stored !== null) return stored === 'true';
      }
    } catch (e) {
      // access to localStorage failed (e.g., SSR or blocked), fall through to defaults
    }
    // Use provided initialState or default to true to match legacy
    return initialState ?? true;
  });

  // Update DOM (body.classList) and localStorage when isDarkMode changes
  useEffect(() => {
    const bodyElement = typeof document !== 'undefined' ? document.body : null;

    if (bodyElement) {
      if (isDarkMode) {
        bodyElement.classList.add('dark-mode');
      } else {
        bodyElement.classList.remove('dark-mode');
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('isDarkMode', String(isDarkMode));
      }
    } catch (e) {
      // ignore localStorage write errors
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
  };
}
