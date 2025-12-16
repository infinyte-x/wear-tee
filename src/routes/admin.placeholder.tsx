import { createFileRoute } from '@tanstack/react-router'
import AdminPlaceholder from '@/pages/admin/Placeholder'

export const Route = createFileRoute('/admin/placeholder')({
    component: AdminPlaceholder,
})
