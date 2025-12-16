import { createFileRoute } from '@tanstack/react-router'
import ThemeCustomization from '@/pages/admin/ThemeCustomization'

export const Route = createFileRoute('/admin/theme')({
  component: ThemeCustomization,
})
