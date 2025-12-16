import { createFileRoute } from '@tanstack/react-router'
import ManageShop from '@/pages/admin/ManageShop'

export const Route = createFileRoute('/admin/manage-shop/')({
  component: ManageShop,
})
