import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SeoContent {
    meta_title: string;
    meta_description: string;
}

const SeoSetup = () => {
    const queryClient = useQueryClient();

    const [seoContent, setSeoContent] = useState<SeoContent>({
        meta_title: '',
        meta_description: '',
    });

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'seo').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setSeoContent(siteContent.content as unknown as SeoContent);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: SeoContent) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'seo', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content'] });
            toast.success('SEO settings saved');
        },
        onError: () => toast.error('Failed to save SEO settings'),
    });

    const handleSaveSeo = () => {
        updateMutation.mutate(seoContent);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">SEO Setup</h1>
                    <p className="text-muted-foreground mt-1">Manage global SEO settings for your store.</p>
                </div>

                <div className="bg-card border border-border p-6 space-y-4 max-w-2xl">
                    <div>
                        <label className="text-sm font-medium">Meta Title</label>
                        <Input
                            value={seoContent.meta_title}
                            onChange={(e) => setSeoContent({ ...seoContent, meta_title: e.target.value })}
                            placeholder="Page title (max 60 characters)"
                            maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{seoContent.meta_title?.length || 0}/60 characters</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Meta Description</label>
                        <Textarea
                            value={seoContent.meta_description}
                            onChange={(e) => setSeoContent({ ...seoContent, meta_description: e.target.value })}
                            placeholder="Page description (max 160 characters)"
                            maxLength={160}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{seoContent.meta_description?.length || 0}/160 characters</p>
                    </div>
                    <Button onClick={handleSaveSeo} disabled={updateMutation.isPending}>
                        Save SEO Settings
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SeoSetup;
