import { createFileRoute } from '@tanstack/react-router'
import DeliverySupport from '@/pages/admin/manage-shop/DeliverySupport'

export const Route = createFileRoute('/admin/manage-shop/delivery')({
  component: DeliverySupport,
})
