import { Link } from '@tanstack/react-router';
import { AlertTriangle, Package, Loader2 } from 'lucide-react';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { cn } from '@/lib/utils';

export function LowStockAlerts() {
    const { alerts, stats, isLoading } = useStockAlerts();

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Stock Alerts</h2>
                </div>
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Package className="h-12 w-12 opacity-30 mb-2" />
                    <p className="text-sm">All products are well-stocked!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-medium">Stock Alerts</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        {stats.total}
                    </span>
                </div>
                <Link to="/admin/inventory" className="text-sm text-accent hover:underline">
                    View all →
                </Link>
            </div>

            {/* Alert summary */}
            <div className="flex gap-4 mb-4">
                {stats.critical > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-600">{stats.critical} out of stock</span>
                    </div>
                )}
                {stats.warning > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-amber-600">{stats.warning} low stock</span>
                    </div>
                )}
            </div>

            {/* Alert list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                    <Link
                        key={alert.id}
                        to="/admin/inventory"
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
                            alert.severity === 'critical' && "bg-red-500/5 border border-red-200",
                            alert.severity === 'warning' && "bg-amber-500/5 border border-amber-200",
                            alert.severity === 'low' && "bg-muted/30"
                        )}
                    >
                        {/* Product image */}
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {alert.image ? (
                                <img
                                    src={alert.image}
                                    alt={alert.product_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{alert.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                                Threshold: {alert.threshold} units
                            </p>
                        </div>

                        {/* Stock count */}
                        <div className={cn(
                            "text-sm font-semibold px-2 py-1 rounded",
                            alert.severity === 'critical' && "bg-red-100 text-red-700",
                            alert.severity === 'warning' && "bg-amber-100 text-amber-700",
                            alert.severity === 'low' && "bg-gray-100 text-gray-700"
                        )}>
                            {alert.stock === 0 ? 'Out of stock' : `${alert.stock} left`}
                        </div>
                    </Link>
                ))}
            </div>

            {alerts.length > 5 && (
                <div className="mt-3 pt-3 border-t border-border text-center">
                    <Link
                        to="/admin/inventory"
                        className="text-sm text-accent hover:underline"
                    >
                        View {alerts.length - 5} more alerts
                    </Link>
                </div>
            )}
        </div>
    );
}
