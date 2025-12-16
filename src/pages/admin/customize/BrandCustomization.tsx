import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import LogoUploader from '@/components/admin/shop/LogoUploader';
import FaviconUploader from '@/components/admin/shop/FaviconUploader';

const BrandCustomization = () => {
    const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();

    const { register, handleSubmit, reset, watch } = useForm({
        defaultValues: settings,
    });

    useEffect(() => {
        if (settings) {
            reset(settings);
        }
    }, [settings, reset]);

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
                <div className="max-w-4xl mx-auto p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Brand</h1>
                            <p className="text-sm text-muted-foreground">Customize your brand identity - Logo, Favicon, and Store Info</p>
                        </div>
                        <Button onClick={handleSubmit(onSubmit)} disabled={isUpdating}>
                            {isUpdating ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            ) : (
                                <><Save className="h-4 w-4 mr-2" />Save Changes</>
                            )}
                        </Button>
                    </div>

                    <div className="space-y-8">
                        {/* Brand Identity */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-medium mb-6">Brand Identity</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Logo */}
                                <div className="space-y-3">
                                    <Label>Store Logo</Label>
                                    <LogoUploader />
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: 200x60px, PNG with transparent background
                                    </p>
                                </div>

                                {/* Favicon */}
                                <div className="space-y-3">
                                    <Label>Favicon</Label>
                                    <FaviconUploader />
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: 32x32px or 64x64px, PNG or ICO
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Store Information */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-medium mb-6">Store Information</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="store_name">Store Name</Label>
                                    <Input
                                        id="store_name"
                                        {...register('store_name')}
                                        placeholder="My Awesome Store"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This appears in the navigation and footer
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site_title">Site Title (Browser Tab)</Label>
                                    <Input
                                        id="site_title"
                                        {...register('site_title')}
                                        placeholder="Welcome to My Store"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This appears in the browser tab
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Brand Colors Preview */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-medium mb-4">Current Brand Colors</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                To change colors, go to <strong>Theme</strong> settings.
                            </p>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div
                                        className="w-12 h-12 rounded-lg border"
                                        style={{ backgroundColor: watch('theme_color') || '#6366f1' }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Primary</p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="w-12 h-12 rounded-lg border"
                                        style={{ backgroundColor: watch('accent_color') || '#f59e0b' }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Accent</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BrandCustomization;
