import { createFileRoute } from '@tanstack/react-router'
import SliderSetup from '@/pages/admin/website/Slider'

export const Route = createFileRoute('/admin/website/slider')({
    component: SliderSetup,
})
