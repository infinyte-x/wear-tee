import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Palette, Type, Menu, MessageSquare, Home, Settings, FileText, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FontPicker } from '@/components/admin/FontPicker';
import LogoUploader from '@/components/admin/shop/LogoUploader';
import FaviconUploader from '@/components/admin/shop/FaviconUploader';
import ImageUpload from '@/components/admin/ImageUpload';

interface HeroContent {
    headline: string;
    subheadline: string;
    description: string;
    image: string;
    button_text: string;
    button_link: string;
}

interface PhilosophyContent {
    title: string;
    description: string;
    image: string;
}

interface FeatureItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const ThemeCustomization = () => {
    const queryClient = useQueryClient();
    // Fetch settings
    const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();

    // Form state  
    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: settings,
    });

    // Update form when settings load
    useEffect(() => {
        if (settings) {
            reset(settings);
        }
    }, [settings, reset]);

    // Watch values for live previews
    const themeColor = watch('theme_color') || '#6366f1';
    const headingFont = watch('heading_font') || 'Syne';
    const bodyFont = watch('body_font') || 'Inter';

    // Homepage content state
    const [heroContent, setHeroContent] = useState<HeroContent>({
        headline: '',
        subheadline: '',
        description: '',
        image: '',
        button_text: '',
        button_link: '',
    });

    const [philosophyContent, setPhilosophyContent] = useState<PhilosophyContent>({
        title: '',
        description: '',
        image: '',
    });

    const [featuresContent, setFeaturesContent] = useState<FeatureItem[]>([]);

    // Fetch homepage content
    const { data: siteContent } = useQuery({
        queryKey: ['site-content'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_content').select('*');
            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (siteContent) {
            const hero = siteContent.find((c) => c.key === 'hero');
            const philosophy = siteContent.find((c) => c.key === 'philosophy');
            const features = siteContent.find((c) => c.key === 'features');

            if (hero) setHeroContent(hero.content as unknown as HeroContent);
            if (philosophy) setPhilosophyContent(philosophy.content as unknown as PhilosophyContent);
            if (features) setFeaturesContent(features.content as unknown as FeatureItem[]);
        }
    }, [siteContent]);

    // Update homepage content mutation
    const updateContentMutation = useMutation({
        mutationFn: async ({ key, content }: { key: string; content: any }) => {
            const { error } = await supabase
                .from('site_content')
                .update({ content: JSON.parse(JSON.stringify(content)) })
                .eq('key', key);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-content'] });
            toast.success('Content saved');
        },
        onError: () => toast.error('Failed to save content'),
    });

    const handleSaveHero = () => {
        updateContentMutation.mutate({ key: 'hero', content: heroContent });
    };

    const handleSavePhilosophy = () => {
        updateContentMutation.mutate({ key: 'philosophy', content: philosophyContent });
    };

    const handleSaveFeatures = () => {
        updateContentMutation.mutate({ key: 'features', content: featuresContent });
    };

    const addFeature = () => {
        setFeaturesContent([
            ...featuresContent,
            { id: crypto.randomUUID(), title: 'New Feature', description: 'Feature description', icon: 'Star' }
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

    const onSubmit = (data: any) => {
        updateSettings(data);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="h-full overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Theme Customization</h1>
                            <p className="text-sm text-muted-foreground">Customize your store's complete look and feel</p>
                        </div>
                        <Button onClick={handleSubmit(onSubmit)} disabled={isUpdating}>
                            {isUpdating ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            ) : (
                                <><Save className="h-4 w-4 mr-2" />Save Changes</>
                            )}
                        </Button>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="brand" className="space-y-6">
                        <TabsList className="grid grid-cols-8 w-full">
                            <TabsTrigger value="brand" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                <span className="hidden sm:inline">Brand</span>
                            </TabsTrigger>
                            <TabsTrigger value="colors" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <span className="hidden sm:inline">Colors</span>
                            </TabsTrigger>
                            <TabsTrigger value="typography" className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                <span className="hidden sm:inline">Typography</span>
                            </TabsTrigger>
                            <TabsTrigger value="navigation" className="flex items-center gap-2">
                                <Menu className="h-4 w-4" />
                                <span className="hidden sm:inline">Navigation</span>
                            </TabsTrigger>
                            <TabsTrigger value="footer" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">Footer</span>
                            </TabsTrigger>
                            <TabsTrigger value="announcement" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">Banner</span>
                            </TabsTrigger>
                            <TabsTrigger value="homepage" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Homepage</span>
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Advanced</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Brand Tab */}
                        <TabsContent value="brand" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Brand Identity</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo */}
                                    <div className="space-y-2">
                                        <Label>Store Logo</Label>
                                        <LogoUploader />
                                        <p className="text-xs text-muted-foreground">
                                            Recommended: 200x60px, PNG with transparent background
                                        </p>
                                    </div>

                                    {/* Favicon */}
                                    <div className="space-y-2">
                                        <Label>Favicon</Label>
                                        <FaviconUploader />
                                        <p className="text-xs text-muted-foreground">
                                            Recommended: 32x32px or 64x64px, PNG or ICO
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="store_name">Store Name</Label>
                                        <Input
                                            id="store_name"
                                            {...register('store_name')}
                                            placeholder="My Awesome Store"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="site_title">Site Title (for browser tab)</Label>
                                        <Input
                                            id="site_title"
                                            {...register('site_title')}
                                            placeholder="Welcome to My Store"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Colors Tab */}
                        <TabsContent value="colors" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Color Scheme</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="theme_color">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="theme_color"
                                                type="color"
                                                {...register('theme_color')}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                {...register('theme_color')}
                                                placeholder="#6366f1"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="accent_color">Accent Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="accent_color"
                                                type="color"
                                                {...register('accent_color')}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                {...register('accent_color')}
                                                placeholder="#f59e0b"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="background_color">Background Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="background_color"
                                                type="color"
                                                {...register('background_color')}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                {...register('background_color')}
                                                placeholder="#ffffff"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="foreground_color">Text Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="foreground_color"
                                                type="color"
                                                {...register('foreground_color')}
                                                className="w-20 h-10"
                                            />
                                            <Input
                                                type="text"
                                                {...register('foreground_color')}
                                                placeholder="#000000"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: themeColor }}>
                                    <p className="text-white text-center font-medium">
                                        Preview of Primary Color
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Typography Tab */}
                        <TabsContent value="typography" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Typography Settings</h3>

                                <div className="space-y-6">
                                    <FontPicker
                                        label="Heading Font"
                                        value={headingFont}
                                        onChange={(value) => setValue('heading_font', value)}
                                    />

                                    <FontPicker
                                        label="Body Font"
                                        value={bodyFont}
                                        onChange={(value) => setValue('body_font', value)}
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="font_size_base">Base Font Size</Label>
                                        <Input
                                            id="font_size_base"
                                            {...register('font_size_base')}
                                            placeholder="16px"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Default: 16px
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Navigation Tab */}
                        <TabsContent value="navigation" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Navigation Settings</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Show Search Icon</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Display search button in navigation
                                            </p>
                                        </div>
                                        <Switch
                                            checked={watch('show_search')}
                                            onCheckedChange={(checked) => setValue('show_search', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Show Cart Count</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Display item count badge on cart icon
                                            </p>
                                        </div>
                                        <Switch
                                            checked={watch('show_cart_count')}
                                            onCheckedChange={(checked) => setValue('show_cart_count', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        💡 Menu items can be customized through the Advanced tab using navigation_items JSON
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Footer Tab */}
                        <TabsContent value="footer" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Footer Content</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="footer_newsletter_title">Newsletter Title</Label>
                                        <Input
                                            id="footer_newsletter_title"
                                            {...register('footer_newsletter_title')}
                                            placeholder="Stay Updated"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="footer_newsletter_text">Newsletter Description</Label>
                                        <Textarea
                                            id="footer_newsletter_text"
                                            {...register('footer_newsletter_text')}
                                            placeholder="Subscribe to get special offers..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="footer_copyright_text">Copyright Text</Label>
                                        <Input
                                            id="footer_copyright_text"
                                            {...register('footer_copyright_text')}
                                            placeholder="© 2024 Your Store. All rights reserved."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="facebook_url">Facebook URL</Label>
                                            <Input
                                                id="facebook_url"
                                                {...register('facebook_url')}
                                                placeholder="https://facebook.com/yourstore"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="instagram_url">Instagram URL</Label>
                                            <Input
                                                id="instagram_url"
                                                {...register('instagram_url')}
                                                placeholder="https://instagram.com/yourstore"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Announcement Bar Tab */}
                        <TabsContent value="announcement" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Announcement Banner</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Enable Announcement Bar</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Show a banner at the top of your site
                                            </p>
                                        </div>
                                        <Switch
                                            checked={watch('announcement_enabled')}
                                            onCheckedChange={(checked) => setValue('announcement_enabled', checked)}
                                        />
                                    </div>

                                    {watch('announcement_enabled') && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="announcement_text">Announcement Text</Label>
                                                <Input
                                                    id="announcement_text"
                                                    {...register('announcement_text')}
                                                    placeholder="🎉 Free shipping on orders over $50!"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="announcement_link">Link (optional)</Label>
                                                <Input
                                                    id="announcement_link"
                                                    {...register('announcement_link')}
                                                    placeholder="/products"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="announcement_bg_color">Background Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="announcement_bg_color"
                                                            type="color"
                                                            {...register('announcement_bg_color')}
                                                            className="w-20 h-10"
                                                        />
                                                        <Input
                                                            type="text"
                                                            {...register('announcement_bg_color')}
                                                            placeholder="#000000"
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="announcement_text_color">Text Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="announcement_text_color"
                                                            type="color"
                                                            {...register('announcement_text_color')}
                                                            className="w-20 h-10"
                                                        />
                                                        <Input
                                                            type="text"
                                                            {...register('announcement_text_color')}
                                                            placeholder="#ffffff"
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Preview */}
                                            <div className="mt-4">
                                                <Label>Preview</Label>
                                                <div
                                                    className="mt-2 p-3 rounded-lg text-center text-sm font-medium"
                                                    style={{
                                                        backgroundColor: watch('announcement_bg_color') || '#000000',
                                                        color: watch('announcement_text_color') || '#ffffff',
                                                    }}
                                                >
                                                    {watch('announcement_text') || 'Your announcement appears here'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Homepage Content Tab */}
                        <TabsContent value="homepage" className="space-y-6">
                            {/* Hero Section */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Hero Section</h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Headline</Label>
                                            <Input
                                                value={heroContent.headline}
                                                onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                                                placeholder="Main headline"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Subheadline</Label>
                                            <Input
                                                value={heroContent.subheadline}
                                                onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                                                placeholder="Subheadline text"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={heroContent.description}
                                            onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                                            placeholder="Hero description"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Button Text</Label>
                                            <Input
                                                value={heroContent.button_text}
                                                onChange={(e) => setHeroContent({ ...heroContent, button_text: e.target.value })}
                                                placeholder="Shop Collection"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Button Link</Label>
                                            <Input
                                                value={heroContent.button_link}
                                                onChange={(e) => setHeroContent({ ...heroContent, button_link: e.target.value })}
                                                placeholder="/products"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Background Image</Label>
                                        <ImageUpload
                                            images={heroContent.image ? [heroContent.image] : []}
                                            onChange={(images) => setHeroContent({ ...heroContent, image: images[0] || '' })}
                                            maxFiles={1}
                                        />
                                    </div>

                                    <Button onClick={handleSaveHero} disabled={updateContentMutation.isPending}>
                                        Save Hero Section
                                    </Button>
                                </div>
                            </div>

                            {/* Philosophy Section */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Philosophy Section</h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={philosophyContent.title}
                                            onChange={(e) => setPhilosophyContent({ ...philosophyContent, title: e.target.value })}
                                            placeholder="Section title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={philosophyContent.description}
                                            onChange={(e) => setPhilosophyContent({ ...philosophyContent, description: e.target.value })}
                                            placeholder="Philosophy description"
                                            rows={5}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Image</Label>
                                        <ImageUpload
                                            images={philosophyContent.image ? [philosophyContent.image] : []}
                                            onChange={(images) => setPhilosophyContent({ ...philosophyContent, image: images[0] || '' })}
                                            maxFiles={1}
                                        />
                                    </div>

                                    <Button onClick={handleSavePhilosophy} disabled={updateContentMutation.isPending}>
                                        Save Philosophy Section
                                    </Button>
                                </div>
                            </div>

                            {/* Features Section */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Features Section</h3>
                                    <Button variant="outline" size="sm" onClick={addFeature}>
                                        + Add Feature
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {featuresContent.map((feature, index) => (
                                        <div key={feature.id} className="grid gap-4 p-4 border rounded-lg relative bg-background/50">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-destructive hover:text-destructive"
                                                onClick={() => removeFeature(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={feature.title}
                                                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Icon Name (Lucide)</Label>
                                                    <Input
                                                        value={feature.icon}
                                                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                                        placeholder="e.g. Truck, Shield, Heart"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={feature.description}
                                                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {featuresContent.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No features added yet. Click "Add Feature" to start.
                                        </div>
                                    )}
                                </div>

                                <Button onClick={handleSaveFeatures} disabled={updateContentMutation.isPending} className="mt-4">
                                    Save Features
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Advanced Tab */}
                        <TabsContent value="advanced" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="custom_css">Custom CSS</Label>
                                        <Textarea
                                            id="custom_css"
                                            {...register('custom_css')}
                                            placeholder="/* Your custom CSS */&#10;.my-class {&#10;  color: red;&#10;}"
                                            rows={8}
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Add custom CSS to override default styles
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="custom_js">Custom JavaScript</Label>
                                        <Textarea
                                            id="custom_js"
                                            {...register('custom_js')}
                                            placeholder="// Your custom JavaScript&#10;console.log('Hello');"
                                            rows={8}
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Add custom JavaScript (use with caution)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="analytics_id">Analytics Tracking ID</Label>
                                        <Input
                                            id="analytics_id"
                                            {...register('analytics_id')}
                                            placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Google Analytics tracking ID
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default_meta_title">Default SEO Title</Label>
                                        <Input
                                            id="default_meta_title"
                                            {...register('default_meta_title')}
                                            placeholder="My Store - Best Products Online"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="default_meta_description">Default SEO Description</Label>
                                        <Textarea
                                            id="default_meta_description"
                                            {...register('default_meta_description')}
                                            placeholder="Shop the best products at amazing prices..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ThemeCustomization;
