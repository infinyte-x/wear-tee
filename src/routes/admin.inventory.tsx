import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/inventory')({
    component: lazyRouteComponent(() => import('@/pages/admin/Inventory')),
})
