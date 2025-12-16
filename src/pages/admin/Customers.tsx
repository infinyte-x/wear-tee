import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, ShoppingBag, DollarSign, Download, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCustomers = customers?.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  // Calculate stats
  const totalCustomers = customers?.length || 0;
  const totalOrders = Object.values(orderCounts || {}).reduce((sum, c) => sum + c.count, 0);
  const totalRevenue = Object.values(orderCounts || {}).reduce((sum, c) => sum + c.total, 0);

  const statCards = [
    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'bg-green-500/10 text-green-500' },
    { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500/10 text-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">View and manage customer accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-lg", stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold text-center">Orders</TableHead>
                <TableHead className="font-semibold">Total Spent</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-10 w-32 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-40 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted rounded mx-auto" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-5 w-12 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: any) => {
                  const stats = orderCounts?.[customer.user_id] || { count: 0, total: 0 };
                  const role = customer.user_roles?.[0]?.role || 'user';

                  return (
                    <TableRow key={customer.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-accent">
                              {(customer.full_name || customer.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{customer.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-sm">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-xs text-muted-foreground">{customer.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.city || customer.country
                          ? `${customer.city || ''}${customer.city && customer.country ? ', ' : ''}${customer.country || ''}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-medium",
                          stats.count > 0 && "text-accent"
                        )}>
                          {stats.count}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">৳{stats.total.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          role === 'admin'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {role}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {searchQuery ? 'No customers match your search' : 'No customers yet'}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      {searchQuery ? 'Try adjusting your search terms' : 'Customers will appear here when they register'}
                    </p>
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
