import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, ShoppingCart, Users, DollarSign, Package } from 'lucide-react';

const Analytics = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
                        <p className="text-muted-foreground mt-1">
                            Order reports and business insights
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            This Month
                        </Button>
                        <Button variant="outline" size="sm">Last Month</Button>
                        <Button variant="outline" size="sm">Custom Range</Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-blue-500" />
                            </div>
                            <span className="text-xs text-success flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +12.5%
                            </span>
                        </div>
                        <div className="text-2xl font-semibold">৳0</div>
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <ShoppingCart className="h-5 w-5 text-green-500" />
                            </div>
                            <span className="text-xs text-success flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +8.2%
                            </span>
                        </div>
                        <div className="text-2xl font-semibold">0</div>
                        <div className="text-sm text-muted-foreground">Total Orders (Confirmed)</div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Package className="h-5 w-5 text-purple-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">—</span>
                        </div>
                        <div className="text-2xl font-semibold">0</div>
                        <div className="text-sm text-muted-foreground">Total Item Sales</div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Users className="h-5 w-5 text-orange-500" />
                            </div>
                            <span className="text-xs text-success flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +5.1%
                            </span>
                        </div>
                        <div className="text-2xl font-semibold">0</div>
                        <div className="text-sm text-muted-foreground">Total Customer Served</div>
                    </div>
                </div>

                {/* Order Report Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-medium mb-4">Order Report</h2>
                    <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                        <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
                            <p>No order data available for this period</p>
                            <p className="text-sm mt-1">Orders will appear here once you start receiving them</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Analytics;
