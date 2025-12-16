
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SellerConditions = () => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'seller_conditions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'seller_conditions').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setContent(siteContent.content as string || '');
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (newContent: string) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'seller_conditions', content: newContent }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'seller_conditions'] });
            toast.success('Seller conditions saved');
        },
        onError: () => toast.error('Failed to save conditions'),
    });

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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif text-foreground">Seller Conditions</h1>
                        <p className="text-muted-foreground mt-1">Define terms and conditions for sellers (if applicable).</p>
                    </div>
                    <Button onClick={() => updateMutation.mutate(content)} disabled={updateMutation.isPending}>
                        Save Changes
                    </Button>
                </div>

                <div className="bg-card border border-border p-6 rounded-lg">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Enter HTML or plain text content here..."
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default SellerConditions;
