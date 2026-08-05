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

    return <>{children}</>;
}
