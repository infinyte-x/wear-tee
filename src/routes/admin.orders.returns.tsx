import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders/returns')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/orders/returns"!</div>
}
