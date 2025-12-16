import { createFileRoute } from '@tanstack/react-router'
import MobileAppRequest from '@/pages/admin/MobileAppRequest'

export const Route = createFileRoute('/admin/mobile-app')({
  component: MobileAppRequest,
})
