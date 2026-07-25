import { useState, useEffect, useCallback } from 'react';

export function useDarkMode(initialState?: boolean) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('isDarkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Use initialState or default to true
    return initialState ?? true;
  });

  // Update DOM and localStorage when isDarkMode changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (isDarkMode) {
      htmlElement.classList.add('dark-mode');
      bodyElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
      bodyElement.classList.remove('dark-mode');
    }

    localStorage.setItem('isDarkMode', String(isDarkMode));
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
