import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders')({
    component: lazyRouteComponent(() => import('@/pages/admin/Orders')),
})
