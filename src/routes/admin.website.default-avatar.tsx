import { createFileRoute } from '@tanstack/react-router'
import DefaultAvatar from '@/pages/admin/website/DefaultAvatar'

export const Route = createFileRoute('/admin/website/default-avatar')({
    component: DefaultAvatar,
})
