
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

interface HeroContent {
    headline: string;
    subheadline: string;
    description: string;
    image: string;
    button_text: string;
    button_link: string;
}

const HomepageTitle = () => {
    const queryClient = useQueryClient();

    const [heroContent, setHeroContent] = useState<HeroContent>({
        headline: '',
        subheadline: '',
        description: '',
        image: '',
        button_text: '',
        button_link: '',
    });

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'hero'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'hero').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setHeroContent(siteContent.content as unknown as HeroContent);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: HeroContent) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'hero', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'hero'] });
            toast.success('Homepage section title saved');
        },
        onError: () => toast.error('Failed to save settings'),
    });

    const handleSaveHero = () => {
        updateMutation.mutate(heroContent);
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
                    <h1 className="text-3xl font-serif text-foreground">Homepage Section Title</h1>
                    <p className="text-muted-foreground mt-1">Manage the hero section or main title text.</p>
                </div>

                <div className="bg-card border border-border p-6 space-y-4 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Headline</label>
                            <Input
                                value={heroContent.headline}
                                onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                                placeholder="Main headline"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Subheadline</label>
                            <Input
                                value={heroContent.subheadline}
                                onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                                placeholder="Subheadline text"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={heroContent.description}
                            onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                            placeholder="Hero description"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Button Text</label>
                            <Input
                                value={heroContent.button_text}
                                onChange={(e) => setHeroContent({ ...heroContent, button_text: e.target.value })}
                                placeholder="Shop Collection"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Button Link</label>
                            <Input
                                value={heroContent.button_link}
                                onChange={(e) => setHeroContent({ ...heroContent, button_link: e.target.value })}
                                placeholder="/products"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Background Media (Image or Video URL)</label>
                        <ImageUpload
                            images={heroContent.image ? [heroContent.image] : []}
                            onChange={(images) => setHeroContent({ ...heroContent, image: images[0] || '' })}
                            maxFiles={1}
                        />
                    </div>
                    <Button onClick={handleSaveHero} disabled={updateMutation.isPending}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default HomepageTitle;
