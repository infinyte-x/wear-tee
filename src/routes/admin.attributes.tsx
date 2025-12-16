import { createFileRoute } from '@tanstack/react-router';
import Attributes from '@/pages/admin/Attributes';

export const Route = createFileRoute('/admin/attributes')({
    component: Attributes,
});
