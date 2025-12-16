import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/customers')({
    component: lazyRouteComponent(() => import('@/pages/admin/Customers')),
})
