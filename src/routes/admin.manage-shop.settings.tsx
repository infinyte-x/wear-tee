import { createFileRoute } from '@tanstack/react-router'
import ShopSettings from '@/pages/admin/manage-shop/ShopSettings'

export const Route = createFileRoute('/admin/manage-shop/settings')({
  component: ShopSettings,
})
