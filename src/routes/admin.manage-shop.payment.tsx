import { createFileRoute } from '@tanstack/react-router'
import PaymentGateway from '@/pages/admin/manage-shop/PaymentGateway'

export const Route = createFileRoute('/admin/manage-shop/payment')({
  component: PaymentGateway,
})
