import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, ArrowRight } from 'lucide-react';

const InvoicesList = () => {
    const navigate = useNavigate();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders-invoices'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as any;
        },
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Invoices</h1>
                    <p className="text-muted-foreground mt-1">View and print order invoices</p>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : orders && orders.length > 0 ? (
                                orders.map((order: any) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">INV-{order.id.slice(0, 8).toUpperCase()}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">Guest Order</p>
                                                <p className="text-xs text-muted-foreground">{order.phone || 'No phone'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize 
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/admin/orders/invoice/$orderId', params: { orderId: order.id } })}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Invoice
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default InvoicesList;
