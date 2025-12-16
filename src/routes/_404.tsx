import { createFileRoute } from '@tanstack/react-router'
import NotFound from '@/pages/NotFound'

export const Route = createFileRoute('/_404')({
    component: NotFound,
})
