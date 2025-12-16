import { createFileRoute } from '@tanstack/react-router';
import ThemeCustomization from '@/pages/admin/customize/ThemeCustomization';

export const Route = createFileRoute('/admin/customize/theme')({
  component: ThemeCustomization,
});
