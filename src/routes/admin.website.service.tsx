import { createFileRoute } from '@tanstack/react-router'
import ServiceSetup from '@/pages/admin/website/Service'

export const Route = createFileRoute('/admin/website/service')({
    component: ServiceSetup,
})
