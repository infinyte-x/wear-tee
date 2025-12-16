import { createFileRoute } from '@tanstack/react-router'
import ImageContent from '@/pages/admin/website/ImageContent'

export const Route = createFileRoute('/admin/website/image-content')({
    component: ImageContent,
})
