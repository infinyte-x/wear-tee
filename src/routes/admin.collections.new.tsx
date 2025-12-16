import { createFileRoute } from '@tanstack/react-router'
import CollectionEditor from '@/pages/admin/collections/CollectionEditor'

export const Route = createFileRoute('/admin/collections/new')({
  component: CollectionEditor,
})
