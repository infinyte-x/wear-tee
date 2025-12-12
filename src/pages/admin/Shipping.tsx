import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';

interface ShippingZone {
  id: string;
  name: string;
  name_bn: string | null;
  base_rate: number;
  free_shipping_threshold: number | null;
  is_active: boolean;
  display_order: number;
}

const AdminShipping = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    base_rate: '',
    free_shipping_threshold: '',
    is_active: true,
  });

  const { data: zones, isLoading } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as ShippingZone[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; name_bn: string | null; base_rate: number; free_shipping_threshold: number | null; is_active: boolean }) => {
      if (editingZone) {
        const { error } = await supabase
          .from('shipping_zones')
          .update(data)
          .eq('id', editingZone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shipping_zones')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast.success(editingZone ? 'Shipping zone updated' : 'Shipping zone created');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to save shipping zone');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
      toast.success('Shipping zone deleted');
    },
    onError: () => {
      toast.error('Failed to delete shipping zone');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('shipping_zones')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingZone(null);
    setFormData({
      name: '',
      name_bn: '',
      base_rate: '',
      free_shipping_threshold: '',
      is_active: true,
    });
  };

  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      name_bn: zone.name_bn || '',
      base_rate: zone.base_rate.toString(),
      free_shipping_threshold: zone.free_shipping_threshold?.toString() || '',
      is_active: zone.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name: formData.name,
      name_bn: formData.name_bn || null,
      base_rate: parseFloat(formData.base_rate) || 0,
      free_shipping_threshold: formData.free_shipping_threshold 
        ? parseFloat(formData.free_shipping_threshold) 
        : null,
      is_active: formData.is_active,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-wide">Shipping Zones</h1>
            <p className="text-muted-foreground mt-1">Manage shipping rates for different areas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleCloseDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingZone ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Zone Name (English)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Inside Dhaka"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_bn">Zone Name (Bangla)</Label>
                  <Input
                    id="name_bn"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    placeholder="e.g., ঢাকার ভেতরে"
                  />
                </div>
                <div>
                  <Label htmlFor="base_rate">Shipping Rate (৳)</Label>
                  <Input
                    id="base_rate"
                    type="number"
                    value={formData.base_rate}
                    onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
                    placeholder="60"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="free_shipping_threshold">Free Shipping Above (৳)</Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    value={formData.free_shipping_threshold}
                    onChange={(e) => setFormData({ ...formData, free_shipping_threshold: e.target.value })}
                    placeholder="5000 (leave empty for no free shipping)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {editingZone ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Zones
            </CardTitle>
            <CardDescription>
              Configure delivery rates for Inside Dhaka and Outside Dhaka
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Free Shipping Above</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones?.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{zone.name}</p>
                          {zone.name_bn && (
                            <p className="text-sm text-muted-foreground">{zone.name_bn}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>৳{zone.base_rate}</TableCell>
                      <TableCell>
                        {zone.free_shipping_threshold 
                          ? `৳${zone.free_shipping_threshold}` 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={zone.is_active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: zone.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(zone)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(zone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
