import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/products/tags')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/products/tags"!</div>
}
