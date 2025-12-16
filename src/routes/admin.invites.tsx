import { createFileRoute } from '@tanstack/react-router'
import Invites from '@/pages/admin/Invites'

export const Route = createFileRoute('/admin/invites')({
    component: Invites,
})
