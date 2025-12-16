import { createFileRoute } from '@tanstack/react-router'
import MaintenanceMode from '@/pages/admin/website/MaintenanceMode'

export const Route = createFileRoute('/admin/website/maintenance')({
    component: MaintenanceMode,
})
