import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

type FeaturesContent = FeatureItem[];

const ServiceSetup = () => {
    const queryClient = useQueryClient();
    const [featuresContent, setFeaturesContent] = useState<FeaturesContent>([]);

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'features'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'features').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setFeaturesContent(siteContent.content as unknown as FeaturesContent);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: FeaturesContent) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'features', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'features'] });
            toast.success('Services/Features saved');
        },
        onError: () => toast.error('Failed to save services'),
    });

    const handleSaveFeatures = () => {
        updateMutation.mutate(featuresContent);
    };

    const addFeature = () => {
        setFeaturesContent([
            ...featuresContent,
            { id: crypto.randomUUID(), title: 'New Service', description: 'Service description', icon: 'Star' }
        ]);
    };

    const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
        const newFeatures = [...featuresContent];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFeaturesContent(newFeatures);
    };

    const removeFeature = (index: number) => {
        setFeaturesContent(featuresContent.filter((_, i) => i !== index));
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
                        <h1 className="text-3xl font-serif text-foreground">Service / Features</h1>
                        <p className="text-muted-foreground mt-1">Manage the services or features displayed on your homepage.</p>
                    </div>
                    <Button onClick={addFeature}>
                        <Plus className="h-4 w-4 mr-2" /> Add Service
                    </Button>
                </div>

                <div className="grid gap-6">
                    {featuresContent.map((feature, index) => (
                        <div key={feature.id} className="grid gap-4 p-6 border rounded-lg relative bg-card shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                                onClick={() => removeFeature(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Title</label>
                                    <Input
                                        value={feature.title}
                                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                        placeholder="e.g. Free Shipping"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Icon Name (Lucide)</label>
                                    <div className="flex gap-2">
                                        <div className="p-2 bg-muted rounded">
                                            <Star className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <Input
                                            value={feature.icon}
                                            onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                            placeholder="e.g. Truck, Shield, Heart"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Use Lucide icon names.</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Description</label>
                                <Textarea
                                    value={feature.description}
                                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                    rows={2}
                                    placeholder="Brief description of the service..."
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {featuresContent.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No services added yet. Click "Add Service" to get started.
                    </div>
                )}

                <div className="flex justify-end">
                    <Button onClick={handleSaveFeatures} disabled={updateMutation.isPending} size="lg">
                        Save Changes
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ServiceSetup;
