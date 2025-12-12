import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Store, Phone, Globe } from 'lucide-react';

interface StoreSettings {
  store_name: string;
  store_phone: string;
  whatsapp_number: string;
  store_address: string;
  facebook_url: string;
  instagram_url: string;
  business_hours: string;
  currency_symbol: string;
}

const defaultSettings: StoreSettings = {
  store_name: 'ATELIER',
  store_phone: '',
  whatsapp_number: '',
  store_address: '',
  facebook_url: '',
  instagram_url: '',
  business_hours: 'Sat-Thu: 10AM-8PM',
  currency_symbol: '৳',
};

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['site-content', 'store_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('key', 'store_settings')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existingSettings?.content) {
      const content = existingSettings.content as Record<string, unknown>;
      setSettings({ ...defaultSettings, ...content } as StoreSettings);
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (newSettings: StoreSettings) => {
      const contentData = JSON.parse(JSON.stringify(newSettings));
      if (existingSettings) {
        const { error } = await supabase
          .from('site_content')
          .update({ content: contentData })
          .eq('key', 'store_settings');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_content')
          .insert([{ key: 'store_settings', content: contentData }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-wide">Store Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your store for Bangladesh market</p>
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>Basic store details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="store_address">Store Address</Label>
                <Textarea
                  id="store_address"
                  value={settings.store_address}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  placeholder="Enter your store address"
                />
              </div>
              <div>
                <Label htmlFor="business_hours">Business Hours</Label>
                <Input
                  id="business_hours"
                  value={settings.business_hours}
                  onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                  placeholder="e.g., Sat-Thu: 10AM-8PM"
                />
              </div>
              <div>
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Input
                  id="currency_symbol"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  placeholder="৳"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Phone and WhatsApp for customer contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="store_phone">Phone Number</Label>
                <Input
                  id="store_phone"
                  value={settings.store_phone}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="8801XXXXXXXXX (with country code)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (880) for WhatsApp integration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="facebook_url">Facebook Page URL</Label>
                <Input
                  id="facebook_url"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <Label htmlFor="instagram_url">Instagram URL</Label>
                <Input
                  id="instagram_url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
