import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders/incomplete')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/orders/incomplete"!</div>
}
