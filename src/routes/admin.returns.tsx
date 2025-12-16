import { createFileRoute } from '@tanstack/react-router';
import Returns from '@/pages/admin/Returns';

export const Route = createFileRoute('/admin/returns')({
    component: Returns,
});
