import { createFileRoute } from '@tanstack/react-router'
import ChatSupport from '@/pages/admin/manage-shop/ChatSupport'

export const Route = createFileRoute('/admin/manage-shop/chat')({
  component: ChatSupport,
})
