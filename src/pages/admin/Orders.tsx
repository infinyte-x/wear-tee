import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText, ShoppingCart, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Order type with order_items
interface OrderItem {
  product_name: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

interface Order {
  id: string;
  user_id?: string | null;
  phone?: string | null;
  division?: string | null;
  district?: string | null;
  area?: string | null;
  total: number;
  status: string;
  created_at: string;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_country?: string | null;
  notes?: string | null;
  order_items?: OrderItem[];
}

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(product_name, quantity, size, color)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ['order-items', selectedOrder?.id],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', selectedOrder!.id);
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Order status updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // Helper functions
  const getProductSummary = (items?: OrderItem[]) => {
    if (!items?.length) return 'No items';
    const names = items.map(i => {
      let name = i.product_name;
      const variants = [i.color, i.size].filter(Boolean);
      if (variants.length) name += ` - ${variants.join(' ')}`;
      return name;
    });
    return names.join(', ');
  };

  const getTotalQuantity = (items?: OrderItem[]) => {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getDeliveryArea = (order: Order) => {
    const parts = [order.area, order.district, order.division].filter(Boolean);
    return parts.join(', ') || order.shipping_address || 'N/A';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, '-') + ', ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default: // pending
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'processing':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'confirmed':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer orders
              {orders && <span className="text-foreground font-medium"> · {orders.length} orders</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              + Create Order
            </Button>
          </div>
        </div>

        {/* Status Tabs - Zatiq Style */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All', count: orders?.length || 0 },
            { value: 'pending', label: 'Pending', count: orders?.filter(o => o.status === 'pending').length || 0 },
            { value: 'confirmed', label: 'Confirmed', count: orders?.filter(o => o.status === 'confirmed').length || 0 },
            { value: 'processing', label: 'Processing', count: orders?.filter(o => o.status === 'processing').length || 0 },
            { value: 'shipped', label: 'Shipped', count: orders?.filter(o => o.status === 'shipped').length || 0 },
            { value: 'delivered', label: 'Delivered', count: orders?.filter(o => o.status === 'delivered').length || 0 },
            { value: 'cancelled', label: 'Cancelled', count: orders?.filter(o => o.status === 'cancelled').length || 0 },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                statusFilter === tab.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <span className={cn(
                "ml-2 px-1.5 py-0.5 text-xs rounded-full",
                statusFilter === tab.value
                  ? "bg-white/20"
                  : "bg-background"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                <TableHead className="font-semibold text-primary-foreground w-16">Order ID</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Customer</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Phone</TableHead>
                <TableHead className="font-semibold text-primary-foreground max-w-[200px]">Product</TableHead>
                <TableHead className="font-semibold text-primary-foreground text-center">Quantity</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Delivery Area</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Amount</TableHead>
                <TableHead className="font-semibold text-primary-foreground text-center">Status</TableHead>
                <TableHead className="font-semibold text-primary-foreground">Date</TableHead>
                <TableHead className="font-semibold text-primary-foreground text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading for 10 columns
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 w-12 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-40 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted rounded mx-auto" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-muted rounded mx-auto" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-8 w-28 bg-muted rounded mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : orders && orders.length > 0 ? (
                orders.map((order: Order, index: number) => (
                  <TableRow
                    key={order.id}
                    className="group transition-colors hover:bg-muted/50"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Order ID */}
                    <TableCell className="font-medium text-sm">
                      #{(orders.length - index + 100).toString()}
                    </TableCell>
                    {/* Customer */}
                    <TableCell>
                      <span className="font-medium text-sm text-muted-foreground">
                        Guest Order
                      </span>
                    </TableCell>
                    {/* Phone */}
                    <TableCell>
                      <span className="text-sm font-mono">
                        {order.phone || 'N/A'}
                      </span>
                    </TableCell>
                    {/* Product */}
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate" title={getProductSummary(order.order_items)}>
                        {getProductSummary(order.order_items)}
                      </p>
                    </TableCell>
                    {/* Quantity */}
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">
                        {getTotalQuantity(order.order_items)}
                      </span>
                    </TableCell>
                    {/* Delivery Area */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getDeliveryArea(order)}
                      </span>
                    </TableCell>
                    {/* Amount */}
                    <TableCell>
                      <span className="font-mono font-medium text-red-600">
                        ৳{Number(order.total).toFixed(2)}
                      </span>
                    </TableCell>
                    {/* Status Badge */}
                    <TableCell className="text-center">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 text-xs font-medium rounded-full border capitalize",
                        getStatusBadgeStyles(order.status)
                      )}>
                        {order.status}
                      </span>
                    </TableCell>
                    {/* Date */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </span>
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(order)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          View
                        </Button>
                        <Link
                          to="/admin/orders/invoice/$orderId"
                          params={{ orderId: order.id }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Invoice
                        </Link>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatusMutation.mutate({ orderId: order.id, status: value })}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-28 h-7 text-xs font-medium border capitalize",
                              getStatusStyles(order.status)
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="capitalize text-xs"
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-16">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No orders yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Orders will appear here when customers make purchases
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center justify-between">
                <span>Order Details</span>
                {selectedOrder && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/admin/orders/invoice/$orderId', params: { orderId: selectedOrder.id } })}
                    className="hover:bg-accent/10 hover:text-accent hover:border-accent transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Invoice
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Date</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-medium">Guest Order</p>
                    <p className="text-muted-foreground text-xs">{selectedOrder.phone || 'No phone'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Shipping Address</p>
                    <p>{selectedOrder.shipping_address || 'N/A'}</p>
                    <p className="text-muted-foreground text-xs">
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_country}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="font-medium mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Items
                  </p>
                  {orderItems && orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {orderItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between py-3 px-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-mono font-medium">${Number(item.product_price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No items</p>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-border font-medium text-lg">
                  <span>Total</span>
                  <span className="font-mono">${Number(selectedOrder.total).toFixed(2)}</span>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-amber-600 text-xs uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;

