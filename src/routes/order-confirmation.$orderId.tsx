import { createFileRoute } from '@tanstack/react-router'
import OrderConfirmation from '@/pages/OrderConfirmation'

export const Route = createFileRoute('/order-confirmation/$orderId')({
    component: OrderConfirmation,
})
