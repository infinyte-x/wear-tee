
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface SubscriptionSettings {
    enabled: boolean;
    title: string;
    subtitle: string;
    image: string;
}

const SubscriptionBanner = () => {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<SubscriptionSettings>({ enabled: false, title: '', subtitle: '', image: '' });

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'subscription'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'subscription').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setSettings(siteContent.content as unknown as SubscriptionSettings);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: SubscriptionSettings) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'subscription', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'subscription'] });
            toast.success('Subscription settings saved');
        },
        onError: () => toast.error('Failed to save'),
    });

    const handleSave = () => {
        updateMutation.mutate(settings);
    };

    if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Subscription Banner</h1>
                    <p className="text-muted-foreground mt-1">Newsletter signup section settings.</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-lg max-w-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enable" className="text-base">Show Subscription Banner</Label>
                        <Switch
                            id="enable"
                            checked={settings.enabled}
                            onCheckedChange={(c) => setSettings({ ...settings, enabled: c })}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                placeholder="Join our newsletter"
                            />
                        </div>
                        <div>
                            <Label>Subtitle</Label>
                            <Input
                                value={settings.subtitle}
                                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                                placeholder="Get 10% off your first order"
                            />
                        </div>
                        <div>
                            <Label>Background Image</Label>
                            <ImageUpload
                                images={settings.image ? [settings.image] : []}
                                onChange={(images) => setSettings({ ...settings, image: images[0] || '' })}
                                maxFiles={1}
                            />
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        Save Settings
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SubscriptionBanner;
