import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminCustomers = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderCounts } = useQuery({
    queryKey: ['customer-order-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id, total');
      if (error) throw error;
      
      const counts: Record<string, { count: number; total: number }> = {};
      data?.forEach((order) => {
        if (!order.user_id) return;
        if (!counts[order.user_id]) {
          counts[order.user_id] = { count: 0, total: 0 };
        }
        counts[order.user_id].count++;
        counts[order.user_id].total += Number(order.total);
      });
      return counts;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">View and manage customer accounts</p>
        </div>

        <div className="bg-card border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : customers && customers.length > 0 ? (
                customers.map((customer: any) => {
                  const stats = orderCounts?.[customer.user_id] || { count: 0, total: 0 };
                  const role = customer.user_roles?.[0]?.role || 'user';
                  
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.full_name || '—'}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        {customer.city || customer.country 
                          ? `${customer.city || ''}${customer.city && customer.country ? ', ' : ''}${customer.country || ''}`
                          : '—'}
                      </TableCell>
                      <TableCell>{stats.count}</TableCell>
                      <TableCell>${stats.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 ${
                          role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
                        }`}>
                          {role}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers yet
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

export default AdminCustomers;
