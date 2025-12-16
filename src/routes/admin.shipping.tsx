import { createFileRoute } from '@tanstack/react-router'
import Shipping from '@/pages/admin/Shipping'

export const Route = createFileRoute('/admin/shipping')({
    component: Shipping,
})
