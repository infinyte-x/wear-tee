import { createFileRoute } from '@tanstack/react-router'
import SiteContent from '@/pages/admin/SiteContent'

export const Route = createFileRoute('/admin/content')({
    component: SiteContent,
})
