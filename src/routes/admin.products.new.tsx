import { createFileRoute } from '@tanstack/react-router'
import ProductEditor from '@/pages/admin/products/ProductEditor'

export const Route = createFileRoute('/admin/products/new')({
    component: ProductEditor,
})
