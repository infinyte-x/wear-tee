import { createFileRoute } from '@tanstack/react-router'
import SellerConditions from '@/pages/admin/website/SellerConditions'

export const Route = createFileRoute('/admin/website/seller-conditions')({
    component: SellerConditions,
})
