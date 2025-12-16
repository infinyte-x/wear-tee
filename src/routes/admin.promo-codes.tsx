import { createFileRoute } from '@tanstack/react-router'
import PromoCodes from '@/pages/admin/PromoCodes'

export const Route = createFileRoute('/admin/promo-codes')({
  component: PromoCodes,
})
