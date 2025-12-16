import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/categories')({
    component: lazyRouteComponent(() => import('@/pages/admin/Categories')),
})
