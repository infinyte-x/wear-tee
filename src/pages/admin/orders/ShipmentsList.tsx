import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const ShipmentsList = () => {
    const navigate = useNavigate();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['admin-shipments-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['shipped', 'delivered'])
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data as any;
        },
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Shipments</h1>
                    <p className="text-muted-foreground mt-1">Track shipped and delivered orders</p>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Ship Date</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                                        <TableCell>{new Date(order.updated_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">{order.shipping_city}, {order.shipping_country}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className={order.status === 'delivered' ? 'bg-green-600' : 'bg-blue-600'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No shipments found
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

export default ShipmentsList;
