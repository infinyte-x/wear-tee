import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export interface AnalyticsData {
    // Totals
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;

    // Trends (compared to previous period)
    revenueTrend: number;
    ordersTrend: number;
    customersTrend: number;

    // Daily data for charts (last 7 days)
    dailyRevenue: { date: string; revenue: number; orders: number }[];

    // Top products by order count
    topProducts: { id: string; name: string; image: string | null; orders: number; revenue: number }[];

    // Order status breakdown
    ordersByStatus: { status: string; count: number }[];
}

export function useAnalytics() {
    return useQuery({
        queryKey: ['admin-analytics'],
        queryFn: async (): Promise<AnalyticsData> => {
            const today = startOfDay(new Date());
            const sevenDaysAgo = subDays(today, 7);
            const fourteenDaysAgo = subDays(today, 14);

            // Fetch all orders
            const { data: allOrders } = await supabase
                .from('orders')
                .select('id, total, status, created_at')
                .order('created_at', { ascending: false });

            // Fetch all customers
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, created_at');

            // Fetch products count
            const { count: productCount } = await supabase
                .from('products')
                .select('id', { count: 'exact', head: true });

            // Fetch order items with product info for top products
            const { data: orderItems } = await supabase
                .from('order_items')
                .select('product_id, product_name, product_price, quantity');

            const orders = allOrders || [];
            const customers = profiles || [];
            const items = orderItems || [];

            // Calculate totals
            const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
            const totalOrders = orders.length;
            const totalCustomers = customers.length;
            const totalProducts = productCount || 0;

            // Calculate trends (last 7 days vs previous 7 days)
            const recentOrders = orders.filter(o => new Date(o.created_at) >= sevenDaysAgo);
            const previousOrders = orders.filter(o => {
                const date = new Date(o.created_at);
                return date >= fourteenDaysAgo && date < sevenDaysAgo;
            });

            const recentRevenue = recentOrders.reduce((sum, o) => sum + Number(o.total), 0);
            const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total), 0);

            const revenueTrend = previousRevenue > 0
                ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
                : recentRevenue > 0 ? 100 : 0;

            const ordersTrend = previousOrders.length > 0
                ? Math.round(((recentOrders.length - previousOrders.length) / previousOrders.length) * 100)
                : recentOrders.length > 0 ? 100 : 0;

            const recentCustomers = customers.filter(c => new Date(c.created_at) >= sevenDaysAgo);
            const previousCustomers = customers.filter(c => {
                const date = new Date(c.created_at);
                return date >= fourteenDaysAgo && date < sevenDaysAgo;
            });

            const customersTrend = previousCustomers.length > 0
                ? Math.round(((recentCustomers.length - previousCustomers.length) / previousCustomers.length) * 100)
                : recentCustomers.length > 0 ? 100 : 0;

            // Daily revenue for last 7 days
            const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
            for (let i = 6; i >= 0; i--) {
                const date = subDays(today, i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayOrders = orders.filter(o =>
                    format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr
                );
                dailyRevenue.push({
                    date: format(date, 'MMM d'),
                    revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
                    orders: dayOrders.length,
                });
            }

            // Top products by order count
            const productStats: Record<string, { name: string; orders: number; revenue: number }> = {};
            items.forEach((item: any) => {
                if (!item.product_id) return;
                if (!productStats[item.product_id]) {
                    productStats[item.product_id] = {
                        name: item.product_name,
                        orders: 0,
                        revenue: 0,
                    };
                }
                productStats[item.product_id].orders += item.quantity;
                productStats[item.product_id].revenue += Number(item.product_price) * item.quantity;
            });

            const topProducts = Object.entries(productStats)
                .map(([id, data]) => ({ id, ...data, image: null }))
                .sort((a, b) => b.orders - a.orders)
                .slice(0, 5);

            // Order status breakdown
            const statusCounts: Record<string, number> = {};
            orders.forEach(o => {
                statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
            });

            const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
                status,
                count,
            }));

            return {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                revenueTrend,
                ordersTrend,
                customersTrend,
                dailyRevenue,
                topProducts,
                ordersByStatus,
            };
        },
        refetchInterval: 60000, // Refresh every minute
    });
}
