import { createFileRoute } from '@tanstack/react-router'
import UsersPermissions from '@/pages/admin/UsersPermissions'

export const Route = createFileRoute('/admin/users-permissions')({
  component: UsersPermissions,
})
