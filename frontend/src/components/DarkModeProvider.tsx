import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

interface DarkModeContextValue {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue | undefined>(undefined);

export function DarkModeProvider({
    children,
    initialDarkMode = true,
}: {
    children: ReactNode;
    initialDarkMode?: boolean;
}) {
    const { isDarkMode, toggleDarkMode } = useDarkMode(initialDarkMode);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        if (isDarkMode) {
            html.classList.add('dark-mode');
            body.classList.add('dark-mode');
        } else {
            html.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
        {children}
        </DarkModeContext.Provider>
    );
}

// Shared dark-mode state
export function useDarkModeContext() {
    const ctx = useContext(DarkModeContext);
    if (!ctx) {
        throw new Error('useDarkModeContext must be used within a DarkModeProvider');
    }
    return ctx;
}
