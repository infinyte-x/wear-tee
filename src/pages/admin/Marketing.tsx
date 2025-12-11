import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Download, Mail, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const Marketing = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order_amount: 0,
    usage_limit: '',
    expires_at: '',
    is_active: true,
  });

  const { data: discountCodes, isLoading: codesLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DiscountCode[];
    },
  });

  const { data: subscribers, isLoading: subscribersLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('discount_codes').insert({
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        min_order_amount: data.min_order_amount,
        usage_limit: data.usage_limit ? parseInt(data.usage_limit) : null,
        expires_at: data.expires_at || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast.success('Discount code created');
      resetForm();
    },
    onError: () => toast.error('Failed to create discount code'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DiscountCode> }) => {
      const { error } = await supabase.from('discount_codes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast.success('Discount code updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update discount code'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('discount_codes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast.success('Discount code deleted');
    },
    onError: () => toast.error('Failed to delete discount code'),
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      min_order_amount: 0,
      usage_limit: '',
      expires_at: '',
      is_active: true,
    });
    setEditingCode(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      min_order_amount: code.min_order_amount,
      usage_limit: code.usage_limit?.toString() || '',
      expires_at: code.expires_at ? code.expires_at.split('T')[0] : '',
      is_active: code.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCode) {
      updateMutation.mutate({
        id: editingCode.id,
        data: {
          code: formData.code.toUpperCase(),
          type: formData.type,
          value: formData.value,
          min_order_amount: formData.min_order_amount,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          expires_at: formData.expires_at || null,
          is_active: formData.is_active,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const exportSubscribers = () => {
    if (!subscribers) return;
    const csv = 'Email,Subscribed Date,Active\n' +
      subscribers.map((s) => `${s.email},${format(new Date(s.subscribed_at), 'yyyy-MM-dd')},${s.is_active}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Marketing</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes and newsletter subscribers</p>
        </div>

        <Tabs defaultValue="discounts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discounts" className="gap-2">
              <Tag className="h-4 w-4" />
              Discount Codes
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2">
              <Mail className="h-4 w-4" />
              Newsletter Subscribers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discounts" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Discount Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCode ? 'Edit Discount Code' : 'Create Discount Code'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Code</label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER20"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'percentage' | 'fixed' })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Value</label>
                        <Input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                          placeholder={formData.type === 'percentage' ? '20' : '50'}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Min. Order Amount</label>
                        <Input
                          type="number"
                          value={formData.min_order_amount}
                          onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Usage Limit</label>
                        <Input
                          type="number"
                          value={formData.usage_limit}
                          onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expires At</label>
                      <Input
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <label className="text-sm">Active</label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        {editingCode ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card border border-border">
              {codesLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : discountCodes && discountCodes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-medium">{code.code}</TableCell>
                        <TableCell className="capitalize">{code.type}</TableCell>
                        <TableCell>{code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}</TableCell>
                        <TableCell>{code.used_count}{code.usage_limit ? `/${code.usage_limit}` : ''}</TableCell>
                        <TableCell>{code.expires_at ? format(new Date(code.expires_at), 'MMM d, yyyy') : '—'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={code.is_active}
                            onCheckedChange={(checked) => updateMutation.mutate({ id: code.id, data: { is_active: checked } })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(code)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(code.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No discount codes yet. Create your first code to get started.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {subscribers?.length || 0} total subscribers
              </p>
              <Button variant="outline" onClick={exportSubscribers} disabled={!subscribers?.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="bg-card border border-border">
              {subscribersLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : subscribers && subscribers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>{format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 ${subscriber.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                            {subscriber.is_active ? 'Active' : 'Unsubscribed'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No newsletter subscribers yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Marketing;
