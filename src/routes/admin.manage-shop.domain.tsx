import { createFileRoute } from '@tanstack/react-router'
import ShopDomain from '@/pages/admin/manage-shop/ShopDomain'

export const Route = createFileRoute('/admin/manage-shop/domain')({
  component: ShopDomain,
})
