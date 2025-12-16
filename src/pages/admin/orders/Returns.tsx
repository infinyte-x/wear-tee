import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RotateCw, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Returns = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-orders-returns'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['cancelled', 'refunded'])
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data as any;
        },
    });

    const refundMutation = useMutation({
        mutationFn: async (orderId: string) => {
            // In a real app, this would trigger a payment gateway refund.
            // For now, we just ensure status is 'refunded'
            const { error } = await supabase.from('orders').update({ status: 'refunded' }).eq('id', orderId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders-returns'] });
            toast({ title: 'Order marked as refunded' });
        },
        onError: (error) => {
            toast({ title: 'Error processing refund', description: error.message, variant: 'destructive' });
        }
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Returns & Refunds</h1>
                    <p className="text-muted-foreground mt-1">Manage order returns and refunds</p>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">Guest Order</p>
                                                <p className="text-xs text-muted-foreground">{order.phone || 'No phone'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'refunded' ? 'default' : 'secondary'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {order.status !== 'refunded' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Mark this order as Refunded?')) {
                                                            refundMutation.mutate(order.id);
                                                        }
                                                    }}
                                                >
                                                    <RotateCw className="h-4 w-4 mr-2" />
                                                    Process Refund
                                                </Button>
                                            )}
                                            {order.status === 'refunded' && (
                                                <div className="flex items-center justify-end text-green-600 text-sm">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Refunded
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No returns found
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

export default Returns;
