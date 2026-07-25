import { ReactNode, useEffect } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

interface DarkModeProviderProps {
  children: ReactNode;
  initialDarkMode?: boolean;
}

export function DarkModeProvider({
  children,
  initialDarkMode = true,
}: DarkModeProviderProps) {
  const { isDarkMode } = useDarkMode(initialDarkMode);

  useEffect(() => {
    // Apply dark mode to document on mount and updates
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (isDarkMode) {
      htmlElement.classList.add('dark-mode');
      bodyElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
      bodyElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
