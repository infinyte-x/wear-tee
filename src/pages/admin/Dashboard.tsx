import AdminLayout from '@/components/admin/AdminLayout';
import { StatisticCard } from '@/components/admin/StatisticCard';
import { Link } from '@tanstack/react-router';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, CheckCircle, Circle, Store, Truck, CreditCard, Image, Settings, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LowStockAlerts } from '@/components/admin/LowStockAlerts';

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

  const { data: analytics, isLoading } = useAnalytics();

  const statCards = [
    {
      label: 'Products',
      value: analytics?.totalProducts || 0,
      icon: Package,
      gradient: 'from-orange-500/10 to-amber-500/5',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      trend: 0, // Products don't have trend
    },
    {
      label: 'Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500/10 to-indigo-500/5',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      trend: analytics?.ordersTrend || 0,
    },
    {
      label: 'Customers',
      value: analytics?.totalCustomers || 0,
      icon: Users,
      gradient: 'from-purple-500/10 to-pink-500/5',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      trend: analytics?.customersTrend || 0,
    },
    {
      label: 'Revenue',
      value: `৳${(analytics?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-green-500/5',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      trend: analytics?.revenueTrend || 0,
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600';
      case 'processing':
        return 'bg-amber-500/10 text-amber-600';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600';
      case 'pending':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...(analytics?.dailyRevenue?.map(d => d.revenue) || [1]));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
          </div>
          {analytics && analytics.revenueTrend > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-emerald-500/10 px-4 py-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600">Revenue up {analytics.revenueTrend}% this week</span>
            </div>
          )}
        </div>

        {/* Setup Guide */}
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
          {statCards.map((stat) => (
            <StatisticCard
              key={stat.label}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend !== 0 ? {
                value: Math.abs(stat.trend),
                isPositive: stat.trend > 0,
              } : undefined}
              gradient={stat.gradient}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Charts and Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium">Revenue Overview</h2>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simple bar chart */}
                <div className="flex items-end justify-between h-40 gap-2">
                  {analytics?.dailyRevenue?.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs font-medium text-muted-foreground mb-1">
                          {day.orders > 0 && `${day.orders}`}
                        </span>
                        <div
                          className="w-full bg-accent/80 rounded-t-md transition-all duration-500 hover:bg-accent"
                          style={{
                            height: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 4}px`,
                            minHeight: '4px',
                          }}
                          title={`৳${day.revenue.toLocaleString()}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">7-day total</p>
                    <p className="text-xl font-semibold">
                      ৳{analytics?.dailyRevenue?.reduce((sum, d) => sum + d.revenue, 0).toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-xl font-semibold">
                      {analytics?.dailyRevenue?.reduce((sum, d) => sum + d.orders, 0) || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Order Status</h2>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : analytics?.ordersByStatus && analytics.ordersByStatus.length > 0 ? (
              <div className="space-y-3">
                {analytics.ordersByStatus.map((item) => {
                  const percentage = analytics.totalOrders > 0
                    ? Math.round((item.count / analytics.totalOrders) * 100)
                    : 0;
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          getStatusStyles(item.status)
                        )}>
                          {item.status}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            item.status === 'delivered' && "bg-emerald-500",
                            item.status === 'shipped' && "bg-blue-500",
                            item.status === 'processing' && "bg-amber-500",
                            item.status === 'pending' && "bg-gray-400",
                            item.status === 'cancelled' && "bg-red-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 opacity-30 mb-2" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Top Products</h2>
            <Link to="/admin/products" className="text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {analytics.topProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold text-sm">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.orders} sold · ৳{product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Package className="h-12 w-12 opacity-30 mb-2" />
              <p>No product sales yet</p>
            </div>
          )}
        </div>

        {/* Stock Alerts */}
        <LowStockAlerts />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
