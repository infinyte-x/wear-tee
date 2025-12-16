import { createFileRoute } from '@tanstack/react-router'
import SubscriptionBanner from '@/pages/admin/website/SubscriptionBanner'

export const Route = createFileRoute('/admin/website/subscription')({
    component: SubscriptionBanner,
})
