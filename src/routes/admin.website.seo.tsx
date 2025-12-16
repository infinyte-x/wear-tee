import { createFileRoute } from '@tanstack/react-router'
import SeoSetup from '@/pages/admin/website/SeoSetup'

export const Route = createFileRoute('/admin/website/seo')({
    component: SeoSetup,
})
