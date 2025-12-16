import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Palette, Type, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { FontPicker } from '@/components/admin/FontPicker';

const ThemeCustomization = () => {
    const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();

    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: settings,
    });

    useEffect(() => {
        if (settings) {
            reset(settings);
        }
    }, [settings, reset]);

    const themeColor = watch('theme_color') || '#6366f1';
    const headingFont = watch('heading_font') || 'Syne';
    const bodyFont = watch('body_font') || 'Inter';

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
                <div className="max-w-5xl mx-auto p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Theme</h1>
                            <p className="text-sm text-muted-foreground">Customize colors, typography, and advanced settings</p>
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
                    <Tabs defaultValue="colors" className="space-y-6">
                        <TabsList className="grid grid-cols-3 w-full max-w-md">
                            <TabsTrigger value="colors" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <span>Colors</span>
                            </TabsTrigger>
                            <TabsTrigger value="typography" className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                <span>Typography</span>
                            </TabsTrigger>
                            <TabsTrigger value="advanced" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span>Advanced</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Colors Tab */}
                        <TabsContent value="colors" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-6">Color Scheme</h3>

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
                                <h3 className="text-lg font-medium mb-6">Typography Settings</h3>

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

                                {/* Font Preview */}
                                <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
                                    <p className="text-2xl" style={{ fontFamily: headingFont }}>
                                        Heading Font Preview ({headingFont})
                                    </p>
                                    <p style={{ fontFamily: bodyFont }}>
                                        Body font preview. This is how your body text will appear on the site. ({bodyFont})
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Advanced Tab */}
                        <TabsContent value="advanced" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-6">Advanced Settings</h3>

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
                                            placeholder="Discover amazing products at great prices..."
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
