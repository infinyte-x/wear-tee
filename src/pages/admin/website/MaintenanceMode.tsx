
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MaintenanceMode = () => {
    const queryClient = useQueryClient();
    const [enabled, setEnabled] = useState(false);

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'maintenance_mode'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'maintenance_mode').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setEnabled((siteContent.content as any).enabled || false);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (checked: boolean) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'maintenance_mode', content: { enabled: checked } }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'maintenance_mode'] });
            toast.success('Maintenance mode updated');
        },
        onError: () => toast.error('Failed to update'),
    });

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        updateMutation.mutate(checked);
    };

    if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Maintainance Mode</h1>
                    <p className="text-muted-foreground mt-1">Disable access to the public site.</p>
                </div>

                <div className="bg-card border border-border p-8 rounded-lg flex items-center justify-between max-w-xl">
                    <div className="space-y-1">
                        <Label htmlFor="maintenance-mode" className="text-lg font-medium">Enable Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            When enabled, only administrators can access the site.
                        </p>
                    </div>
                    <Switch
                        id="maintenance-mode"
                        checked={enabled}
                        onCheckedChange={handleToggle}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default MaintenanceMode;
