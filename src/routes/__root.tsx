import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AnnouncementBar } from '@/components/AnnouncementBar'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useState, useEffect } from 'react'

function RootLayout() {
    const { settings } = useSiteSettings();
    const location = useLocation();
    const [announcementDismissed, setAnnouncementDismissed] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem('announcement_dismissed');
        setAnnouncementDismissed(dismissed === 'true');
    }, []);

    const showOnPages = (settings as any)?.announcement_show_on || 'all';
    const currentPath = location.pathname;
    const isAdmin = currentPath.startsWith('/admin');

    const showAnnouncement =
        settings?.announcement_enabled &&
        settings?.announcement_text &&
        !isAdmin &&
        !announcementDismissed &&
        (showOnPages === 'all' ||
            (showOnPages === 'home' && currentPath === '/') ||
            (showOnPages === 'products' && (currentPath.startsWith('/products') || currentPath.startsWith('/collections'))));

    // Add spacer height based on what's showing (announcement: ~40px + navbar: ~56px)
    const spacerHeight = isAdmin ? 0 : (showAnnouncement ? 96 : 56);

    return (
        <>
            <AnnouncementBar />
            {/* Spacer for fixed navbar + announcement bar */}
            {!isAdmin && <div style={{ height: spacerHeight }} />}
            <Outlet />
            <TanStackRouterDevtools />
        </>
    );
}

export const Route = createRootRoute({
    component: RootLayout,
})
