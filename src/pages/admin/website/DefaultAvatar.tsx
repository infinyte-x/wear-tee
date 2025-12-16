
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

const DefaultAvatar = () => {
    const queryClient = useQueryClient();
    const [avatar, setAvatar] = useState('');

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'default_avatar'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'default_avatar').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent && siteContent.content) {
            setAvatar((siteContent.content as any).url || '');
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (url: string) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'default_avatar', content: { url } }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'default_avatar'] });
            toast.success('Default avatar saved');
        },
        onError: () => toast.error('Failed to save'),
    });

    if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Default Avatar</h1>
                    <p className="text-muted-foreground mt-1">Set the default profile picture for new users.</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-lg max-w-md">
                    <Label className="mb-4 block">Avatar Image</Label>
                    <ImageUpload
                        images={avatar ? [avatar] : []}
                        onChange={(imgs) => {
                            const url = imgs[0] || '';
                            setAvatar(url);
                            updateMutation.mutate(url);
                        }}
                        maxFiles={1}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default DefaultAvatar;
