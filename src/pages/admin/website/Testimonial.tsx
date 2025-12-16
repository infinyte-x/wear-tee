
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface TestimonialItem {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string;
}

type TestimonialContent = TestimonialItem[];

const TestimonialSetup = () => {
    const queryClient = useQueryClient();
    const [items, setItems] = useState<TestimonialContent>([]);

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'testimonials'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'testimonials').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setItems(siteContent.content as unknown as TestimonialContent);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: TestimonialContent) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'testimonials', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'testimonials'] });
            toast.success('Testimonials saved');
        },
        onError: () => toast.error('Failed to save testimonials'),
    });

    const handleSave = () => {
        updateMutation.mutate(items);
    };

    const addItem = () => {
        setItems([
            ...items,
            { id: crypto.randomUUID(), name: 'Happy Customer', role: 'Verified Buyer', content: 'Great service!', avatar: '' }
        ]);
    };

    const updateItem = (index: number, field: keyof TestimonialItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif text-foreground">Testimonial</h1>
                        <p className="text-muted-foreground mt-1">What your customers are saying.</p>
                    </div>
                    <Button onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {items.map((item, index) => (
                        <div key={item.id} className="grid gap-4 p-6 border rounded-lg relative bg-card shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="flex gap-4">
                                <div className="shrink-0">
                                    <label className="text-xs font-medium mb-1.5 block">Avatar</label>
                                    <ImageUpload
                                        images={item.avatar ? [item.avatar] : []}
                                        onChange={(images) => updateItem(index, 'avatar', images[0] || '')}
                                        maxFiles={1}
                                    />
                                </div>
                                <div className="grow space-y-3">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Customer Name</label>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Role / Title</label>
                                        <Input
                                            value={item.role}
                                            onChange={(e) => updateItem(index, 'role', e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Review Content</label>
                                <Textarea
                                    value={item.content}
                                    onChange={(e) => updateItem(index, 'content', e.target.value)}
                                    rows={3}
                                    placeholder="The review text..."
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No testimonials yet.
                    </div>
                )}

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg">
                        Save Changes
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TestimonialSetup;
