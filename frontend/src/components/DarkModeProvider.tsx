import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

export function DarkModeProvider({
    children,
    initialDarkMode = true,
}: {
    children: ReactNode;
    initialDarkMode?: boolean;
}) {
    const { isDarkMode } = useDarkMode(initialDarkMode);

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
    }, [isDarkMode]);

    return <>{children}</>;
}
