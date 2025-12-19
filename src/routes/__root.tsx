import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AnnouncementBar } from '@/components/AnnouncementBar'

function RootLayout() {
    return (
        <>
            <AnnouncementBar />
            <Outlet />
            <TanStackRouterDevtools />
        </>
    );
}

export const Route = createRootRoute({
    component: RootLayout,
})

