import { createFileRoute } from '@tanstack/react-router';
import Transactions from '@/pages/admin/Transactions';

export const Route = createFileRoute('/admin/transactions')({
    component: Transactions,
});
