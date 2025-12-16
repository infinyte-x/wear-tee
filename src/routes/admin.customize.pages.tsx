import { createFileRoute } from '@tanstack/react-router';
import AdminPages from '@/pages/admin/Pages';

export const Route = createFileRoute('/admin/customize/pages')({
  component: AdminPages,
});
