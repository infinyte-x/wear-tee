import { createFileRoute } from '@tanstack/react-router'
import AnnouncementSetup from '@/pages/admin/website/Announcement'

export const Route = createFileRoute('/admin/website/announcement')({
    component: AnnouncementSetup,
})
