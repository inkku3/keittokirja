import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && !window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
        value: (() => {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => { store[key] = value; },
                removeItem: (key: string) => { delete store[key]; },
                clear: () => { store = {}; },
            };
        })(),
        configurable: true,
    });
}
