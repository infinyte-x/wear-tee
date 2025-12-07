import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      return {
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        customers: customersRes.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statCards = [
    { label: 'Products', value: stats?.products || 0, icon: Package, color: 'bg-accent/10 text-accent' },
    { label: 'Orders', value: stats?.orders || 0, icon: ShoppingCart, color: 'bg-primary/10 text-primary' },
    { label: 'Customers', value: stats?.customers || 0, icon: Users, color: 'bg-muted text-muted-foreground' },
    { label: 'Revenue', value: `$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your store performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-serif mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-serif">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{order.profiles?.full_name || order.profiles?.email || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
