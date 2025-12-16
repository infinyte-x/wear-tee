
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AnnouncementSettings {
    enabled: boolean;
    text: string;
    link: string;
}

const AnnouncementSetup = () => {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<AnnouncementSettings>({ enabled: false, text: '', link: '' });

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'announcement'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'announcement').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setSettings(siteContent.content as unknown as AnnouncementSettings);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: AnnouncementSettings) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'announcement', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'announcement'] });
            toast.success('Announcement saved');
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
                    <h1 className="text-3xl font-serif text-foreground">Announcement Bar</h1>
                    <p className="text-muted-foreground mt-1">Top bar notification for sales and news.</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-lg max-w-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enable" className="text-base">Show Announcement Bar</Label>
                        <Switch
                            id="enable"
                            checked={settings.enabled}
                            onCheckedChange={(c) => setSettings({ ...settings, enabled: c })}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Announcement Text</Label>
                            <Input
                                value={settings.text}
                                onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                                placeholder="e.g. Free shipping on all orders over $100!"
                            />
                        </div>
                        <div>
                            <Label>Link URL (Optional)</Label>
                            <Input
                                value={settings.link}
                                onChange={(e) => setSettings({ ...settings, link: e.target.value })}
                                placeholder="/collections/sale"
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

export default AnnouncementSetup;
