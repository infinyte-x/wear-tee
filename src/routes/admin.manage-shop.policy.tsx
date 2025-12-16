import { createFileRoute } from '@tanstack/react-router'
import ShopPolicy from '@/pages/admin/manage-shop/ShopPolicy'

export const Route = createFileRoute('/admin/manage-shop/policy')({
  component: ShopPolicy,
})
