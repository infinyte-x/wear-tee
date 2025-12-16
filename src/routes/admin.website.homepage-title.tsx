import { createFileRoute } from '@tanstack/react-router'
import HomepageTitle from '@/pages/admin/website/HomepageSections'

export const Route = createFileRoute('/admin/website/homepage-title')({
    component: HomepageTitle,
})
