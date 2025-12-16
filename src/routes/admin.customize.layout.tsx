import { createFileRoute } from '@tanstack/react-router';
import LayoutCustomization from '@/pages/admin/customize/LayoutCustomization';

export const Route = createFileRoute('/admin/customize/layout')({
  component: LayoutCustomization,
});
