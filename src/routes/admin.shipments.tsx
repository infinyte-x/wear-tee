import { createFileRoute } from '@tanstack/react-router';
import Shipments from '@/pages/admin/Shipments';

export const Route = createFileRoute('/admin/shipments')({
    component: Shipments,
});
