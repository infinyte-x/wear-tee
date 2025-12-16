
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Image } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

interface SliderItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
}

type SliderContent = SliderItem[];

const SliderSetup = () => {
    const queryClient = useQueryClient();
    const [sliderContent, setSliderContent] = useState<SliderContent>([]);

    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['site-content', 'slider'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*').eq('key', 'slider').maybeSingle();
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            setSliderContent(siteContent.content as unknown as SliderContent);
        }
    }, [siteContent]);

    const updateMutation = useMutation({
        mutationFn: async (content: SliderContent) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({ key: 'slider', content: JSON.parse(JSON.stringify(content)) }, { onConflict: 'key' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content', 'slider'] });
            toast.success('Slider content saved');
        },
        onError: () => toast.error('Failed to save slider'),
    });

    const handleSaveSlider = () => {
        updateMutation.mutate(sliderContent);
    };

    const addSlide = () => {
        setSliderContent([
            ...sliderContent,
            { id: crypto.randomUUID(), title: 'New Slide', subtitle: '', image: '', link: '' }
        ]);
    };

    const updateSlide = (index: number, field: keyof SliderItem, value: string) => {
        const newSlides = [...sliderContent];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSliderContent(newSlides);
    };

    const removeSlide = (index: number) => {
        setSliderContent(sliderContent.filter((_, i) => i !== index));
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
                        <h1 className="text-3xl font-serif text-foreground">Home Slider</h1>
                        <p className="text-muted-foreground mt-1">Manage the image slider on the homepage.</p>
                    </div>
                    <Button onClick={addSlide}>
                        <Plus className="h-4 w-4 mr-2" /> Add Slide
                    </Button>
                </div>

                <div className="grid gap-6">
                    {sliderContent.map((slide, index) => (
                        <div key={slide.id} className="grid md:grid-cols-[200px_1fr] gap-6 p-6 border rounded-lg relative bg-card shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive z-10"
                                onClick={() => removeSlide(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slide Image</label>
                                <ImageUpload
                                    images={slide.image ? [slide.image] : []}
                                    onChange={(images) => updateSlide(index, 'image', images[0] || '')}
                                    maxFiles={1}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Title</label>
                                        <Input
                                            value={slide.title}
                                            onChange={(e) => updateSlide(index, 'title', e.target.value)}
                                            placeholder="Slide Title"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Subtitle</label>
                                        <Input
                                            value={slide.subtitle}
                                            onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                                            placeholder="Optional subtitle"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Link URL</label>
                                    <Input
                                        value={slide.link}
                                        onChange={(e) => updateSlide(index, 'link', e.target.value)}
                                        placeholder="/collections/sale"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {sliderContent.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No slides added yet. Click "Add Slide" to get started.
                    </div>
                )}

                <div className="flex justify-end">
                    <Button onClick={handleSaveSlider} disabled={updateMutation.isPending} size="lg">
                        Save Slider
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SliderSetup;
