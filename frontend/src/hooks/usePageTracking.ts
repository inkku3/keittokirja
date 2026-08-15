import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        if (!window._paq) return;

        window._paq.push([
            "setCustomUrl",
            window.location.pathname + window.location.search,
        ]);
        window._paq.push(["trackPageView"]);
    }, [location.pathname, location.search]);
}
