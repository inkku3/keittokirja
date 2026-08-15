export function trackEvent(category: string, action: string, name?: string) {
    if (!window._paq) return;

    window._paq.push(["trackEvent", category, action, ...(name ? [name] : [])]);
}
