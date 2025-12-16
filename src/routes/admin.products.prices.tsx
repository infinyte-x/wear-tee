import { createFileRoute } from '@tanstack/react-router'
import ProductPrices from '@/pages/admin/products/ProductPrices'

export const Route = createFileRoute('/admin/products/prices')({
  component: ProductPrices,
  // Force HMR update
})
