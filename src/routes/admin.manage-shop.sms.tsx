import { createFileRoute } from '@tanstack/react-router'
import SmsSupport from '@/pages/admin/manage-shop/SmsSupport'

export const Route = createFileRoute('/admin/manage-shop/sms')({
  component: SmsSupport,
})
