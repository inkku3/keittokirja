import { Outlet } from 'react-router-dom';
import { usePageTracking } from '../hooks/usePageTracking';

export function RootLayout() {
    usePageTracking();
    return <Outlet />;
}
