import { createFileRoute } from '@tanstack/react-router'
import ProductAttributesPage from '@/pages/admin/products/ProductAttributesPage'

export const Route = createFileRoute('/admin/products/attributes')({
  component: ProductAttributesPage,
})
