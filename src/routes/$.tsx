import { createFileRoute } from '@tanstack/react-router'
import Page from '@/pages/Page'

export const Route = createFileRoute('/$')({
    component: Page,
})
