import { createFileRoute } from '@tanstack/react-router'
import PageRedirector from '@/pages/admin/pages/PageRedirector'

export const Route = createFileRoute('/admin/pages/edit/$slug')({
  component: PageRedirector,
})
