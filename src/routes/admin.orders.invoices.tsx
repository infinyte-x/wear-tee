import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders/invoices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/orders/invoices"!</div>
}
