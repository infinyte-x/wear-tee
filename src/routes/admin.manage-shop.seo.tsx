import { createFileRoute } from '@tanstack/react-router'
import SeoMarketing from '@/pages/admin/manage-shop/SeoMarketing'

export const Route = createFileRoute('/admin/manage-shop/seo')({
  component: SeoMarketing,
})
