import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/landing-pages')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/landing-pages"!</div>
}
