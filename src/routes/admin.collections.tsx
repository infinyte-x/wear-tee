import { createFileRoute } from '@tanstack/react-router';
import Collections from '@/pages/admin/Collections';

export const Route = createFileRoute('/admin/collections')({
    component: Collections,
});
