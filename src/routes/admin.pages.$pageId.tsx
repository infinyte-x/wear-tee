import { createFileRoute } from '@tanstack/react-router'
import PageBuilder from '@/pages/admin/PageBuilder'

export const Route = createFileRoute('/admin/pages/$pageId')({
    component: PageBuilder,
})
