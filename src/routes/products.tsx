import { createFileRoute } from '@tanstack/react-router'
import Products from '@/pages/Products'
import { z } from 'zod'

export const Route = createFileRoute('/products')({
    component: Products,
    validateSearch: z.object({
        category: z.string().optional(),
    }),
})
