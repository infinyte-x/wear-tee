import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders/invoice/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/orders/invoice/$orderId"!</div>
}
