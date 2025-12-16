import { createFileRoute } from '@tanstack/react-router';
import BrandCustomization from '@/pages/admin/customize/BrandCustomization';

export const Route = createFileRoute('/admin/customize/brand')({
  component: BrandCustomization,
});
