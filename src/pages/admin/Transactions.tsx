import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

const Transactions = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Fetch transactions (orders with payment info)
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions', statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('orders')
                .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('payment_status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });

    // Filter by search
    const filteredTransactions = transactions?.filter((transaction) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.profiles?.email?.toLowerCase().includes(searchLower) ||
            transaction.profiles?.full_name?.toLowerCase().includes(searchLower)
        );
    });

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            paid: 'default',
            pending: 'secondary',
            failed: 'destructive',
            refunded: 'outline',
        };

        return (
            <Badge variant={variants[status] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Transactions</h1>
                    <p className="text-muted-foreground mt-1">View all payment transactions and order history</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order ID, customer email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Transactions Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Order Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Loading transactions...
                                    </TableCell>
                                </TableRow>
                            ) : filteredTransactions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions?.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-mono text-sm">
                                            #{transaction.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {transaction.profiles?.full_name || 'Guest'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {transaction.profiles?.email || transaction.guest_email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${transaction.total.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {getPaymentStatusBadge(transaction.payment_status)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => window.location.href = `/admin/orders/${transaction.id}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Stats */}
                {filteredTransactions && filteredTransactions.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="text-sm text-muted-foreground">Total Transactions</div>
                            <div className="text-2xl font-semibold mt-1">
                                {filteredTransactions.length}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="text-sm text-muted-foreground">Total Revenue</div>
                            <div className="text-2xl font-semibold mt-1">
                                ${filteredTransactions.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="text-sm text-muted-foreground">Paid</div>
                            <div className="text-2xl font-semibold mt-1 text-green-600">
                                {filteredTransactions.filter(t => t.payment_status === 'paid').length}
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="text-sm text-muted-foreground">Pending</div>
                            <div className="text-2xl font-semibold mt-1 text-amber-600">
                                {filteredTransactions.filter(t => t.payment_status === 'pending').length}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Transactions;
