import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
    low_stock_threshold: number;
    images: string[] | null;
    price: number;
}

export interface StockAlert {
    id: string;
    product_id: string;
    product_name: string;
    stock: number;
    threshold: number;
    severity: 'critical' | 'warning' | 'low';
    image: string | null;
}

export function useStockAlerts() {
    // Fetch products with low stock
    const lowStockQuery = useQuery({
        queryKey: ['low-stock-alerts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, stock, low_stock_threshold, images, price')
                .order('stock', { ascending: true });

            if (error) throw error;

            // Filter products where stock <= threshold
            const lowStockProducts = (data || []).filter((product: any) => {
                const threshold = product.low_stock_threshold || 10; // Default threshold
                return product.stock <= threshold;
            });

            // Transform into alerts with severity
            const alerts: StockAlert[] = lowStockProducts.map((product: any) => {
                const threshold = product.low_stock_threshold || 10;
                let severity: 'critical' | 'warning' | 'low' = 'low';

                if (product.stock === 0) {
                    severity = 'critical';
                } else if (product.stock <= threshold / 2) {
                    severity = 'warning';
                }

                return {
                    id: `alert-${product.id}`,
                    product_id: product.id,
                    product_name: product.name,
                    stock: product.stock,
                    threshold,
                    severity,
                    image: product.images?.[0] || null,
                };
            });

            return alerts;
        },
        refetchInterval: 60000, // Refresh every minute
    });

    // Calculate stats
    const alerts = lowStockQuery.data || [];
    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        low: alerts.filter(a => a.severity === 'low').length,
    };

    return {
        alerts,
        stats,
        isLoading: lowStockQuery.isLoading,
        error: lowStockQuery.error,
        refetch: lowStockQuery.refetch,
    };
}
