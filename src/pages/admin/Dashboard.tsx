import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight, CheckCircle, Circle, Store, Truck, CreditCard, Image, Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Setup guide steps
const setupSteps = [
  { id: 'shop', label: 'Setup Shop Info', href: '/admin/manage-shop/settings', icon: Store, completed: true },
  { id: 'products', label: 'Add Products', href: '/admin/products/new', icon: Package, completed: false },
  { id: 'delivery', label: 'Configure Delivery', href: '/admin/manage-shop/delivery', icon: Truck, completed: false },
  { id: 'payment', label: 'Setup Payments', href: '/admin/manage-shop/payment', icon: CreditCard, completed: false },
  { id: 'logo', label: 'Upload Logo', href: '/admin/manage-shop/settings', icon: Image, completed: true },
  { id: 'theme', label: 'Customize Theme', href: '/admin/theme', icon: Settings, completed: false },
];

const Dashboard = () => {
  const completedSteps = setupSteps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedSteps / setupSteps.length) * 100);

  const { data: stats, isLoading: statsLoading } = useQuery({
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

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statCards = [
    {
      label: 'Products',
      value: stats?.products || 0,
      icon: Package,
      gradient: 'from-orange-500/10 to-amber-500/5',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      trend: '+12%'
    },
    {
      label: 'Orders',
      value: stats?.orders || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500/10 to-indigo-500/5',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      trend: '+8%'
    },
    {
      label: 'Customers',
      value: stats?.customers || 0,
      icon: Users,
      gradient: 'from-purple-500/10 to-pink-500/5',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      trend: '+24%'
    },
    {
      label: 'Revenue',
      value: `৳${(stats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-green-500/5',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      trend: '+18%'
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'processing':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>All metrics trending up</span>
          </div>
        </div>

        {/* Setup Guide - Zatiq Style */}
        {progressPercent < 100 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium">Setup Guide</h2>
                <p className="text-sm text-muted-foreground">Complete these steps to get your store ready</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">{progressPercent}% Complete</div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {setupSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.id}
                    to={step.href}
                    className={cn(
                      "group flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300",
                      step.completed
                        ? "border-success/30 bg-success/5"
                        : "border-border hover:border-accent/50 hover:bg-accent/5"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      step.completed ? "bg-success/10" : "bg-muted group-hover:bg-accent/10"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        step.completed ? "text-success" : "text-muted-foreground group-hover:text-accent"
                      )} />
                    </div>
                    <span className="text-xs text-center font-medium">{step.label}</span>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden bg-card border border-border/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-border group",
                statsLoading && "animate-pulse"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background gradient */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-100", stat.gradient)} />

              <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs tracking-widest uppercase text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-serif tracking-tight">{statsLoading ? '—' : stat.value}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", stat.iconBg)}>
                  <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif">Recent Orders</h2>
              <a href="/admin/orders" className="text-sm text-accent hover:underline transition-colors">View all →</a>
            </div>
          </div>
          <div className="p-6">
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-4 w-16 bg-muted rounded ml-auto" />
                      <div className="h-5 w-20 bg-muted rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order: any, index: number) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-4 px-4 -mx-4 rounded-lg transition-all duration-300 hover:bg-muted/50 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium group-hover:text-accent transition-colors">{order.phone || 'Guest Order'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="font-medium font-mono">${Number(order.total).toFixed(2)}</p>
                      <span className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium capitalize",
                        getStatusStyles(order.status)
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Orders will appear here once customers start purchasing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

