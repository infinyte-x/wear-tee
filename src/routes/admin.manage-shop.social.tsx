import { createFileRoute } from '@tanstack/react-router'
import SocialLinks from '@/pages/admin/manage-shop/SocialLinks'

export const Route = createFileRoute('/admin/manage-shop/social')({
  component: SocialLinks,
})
