import { createFileRoute } from '@tanstack/react-router'
import TestimonialSetup from '@/pages/admin/website/Testimonial'

export const Route = createFileRoute('/admin/website/testimonial')({
  component: TestimonialSetup,
})
