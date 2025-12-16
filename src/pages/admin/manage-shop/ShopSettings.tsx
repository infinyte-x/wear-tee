import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ArrowLeft, ChevronUp, Download, Upload, Palette, Store, Image, Phone, Globe, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { LogoUploader } from '@/components/admin/shop/LogoUploader';
import { FaviconUploader } from '@/components/admin/shop/FaviconUploader';

const ShopSettings = () => {
    const [storeInfoOpen, setStoreInfoOpen] = useState(true);
    const [contactInfoOpen, setContactInfoOpen] = useState(true);
    const [socialLinksOpen, setSocialLinksOpen] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(true);

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

    // Watch theme color for live preview
    const themeColor = watch('theme_color') || '#6366f1';

    // Form submit handler
    const onSubmit = (data: any) => {
        updateSettings(data);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/manage-shop"
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Shop Settings</h1>
                            <p className="text-muted-foreground text-sm">Configure your store for Bangladesh market</p>
                        </div>
                    </div>
                    <Button onClick={handleSubmit(onSubmit)} disabled={isUpdating}>
                        {isUpdating ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                        ) : (
                            <><Save className="h-4 w-4 mr-2" />Save Settings</>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Store Identity */}
                        <Collapsible open={storeInfoOpen} onOpenChange={setStoreInfoOpen}>
                            <div className="bg-card border border-border rounded-xl">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
                                    <div className="flex items-center gap-3">
                                        <Store className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h2 className="text-lg font-medium">Store Identity</h2>
                                            <p className="text-sm text-muted-foreground">Basic store branding and details</p>
                                        </div>
                                    </div>
                                    <ChevronUp className={`h-5 w-5 transition-transform ${storeInfoOpen ? '' : 'rotate-180'}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="px-5 pb-5 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="storeName">Store Name</Label>
                                                <Input id="storeName" placeholder="Wear & Tee" {...register('store_name')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="siteTitle">Site Title (SEO)</Label>
                                                <Input id="siteTitle" placeholder="Wear & Tee - Premium Fashion" {...register('site_title')} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="storeAddress">Store Address</Label>
                                            <Textarea id="storeAddress" placeholder="Shinepukur Road, Mirpur 1" rows={2} {...register('store_address')} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="businessHours">Business Hours</Label>
                                                <Input id="businessHours" placeholder="Sat-Thu: 10AM-8PM" {...register('business_hours')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="currency">Currency Symbol</Label>
                                                <Input id="currency" placeholder="৳" className="max-w-24" {...register('currency_symbol')} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="seoDetails">Shop Details (SEO & Data Feed)</Label>
                                            <Textarea id="seoDetails" placeholder="Enter shop description for SEO" rows={3} {...register('seo_description')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="announcement">Topbar Announcement Message</Label>
                                            <Textarea id="announcement" placeholder="e.g., Free shipping on orders over ৳1000!" rows={2} {...register('announcement_message')} />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>

                        {/* Contact Information */}
                        <Collapsible open={contactInfoOpen} onOpenChange={setContactInfoOpen}>
                            <div className="bg-card border border-border rounded-xl">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h2 className="text-lg font-medium">Contact Information</h2>
                                            <p className="text-sm text-muted-foreground">Phone and WhatsApp for customer contact</p>
                                        </div>
                                    </div>
                                    <ChevronUp className={`h-5 w-5 transition-transform ${contactInfoOpen ? '' : 'rotate-180'}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="px-5 pb-5 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="shopEmail">Shop Email</Label>
                                                <Input id="shopEmail" type="email" placeholder="shop@example.com" {...register('shop_email')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input id="phone" placeholder="01621225454" {...register('phone_number')} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                                            <Input id="whatsapp" placeholder="8801621225454" {...register('whatsapp_number')} />
                                            <p className="text-xs text-muted-foreground">Include country code (880) for WhatsApp integration</p>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>

                        {/* Social Media Links */}
                        <Collapsible open={socialLinksOpen} onOpenChange={setSocialLinksOpen}>
                            <div className="bg-card border border-border rounded-xl">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h2 className="text-lg font-medium">Social Media Links</h2>
                                            <p className="text-sm text-muted-foreground">Connect your social media accounts</p>
                                        </div>
                                    </div>
                                    <ChevronUp className={`h-5 w-5 transition-transform ${socialLinksOpen ? '' : 'rotate-180'}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="px-5 pb-5 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="facebook">Facebook Page URL</Label>
                                                <Input id="facebook" placeholder="https://facebook.com/yourpage" {...register('facebook_url')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="instagram">Instagram URL</Label>
                                                <Input id="instagram" placeholder="https://instagram.com/yourpage" {...register('instagram_url')} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="youtube">YouTube URL</Label>
                                                <Input id="youtube" placeholder="https://youtube.com/@yourchannel" {...register('youtube_url')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tiktok">TikTok URL</Label>
                                                <Input id="tiktok" placeholder="https://tiktok.com/@yourpage" {...register('tiktok_url')} />
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>

                        {/* Shop Settings */}
                        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                            <div className="bg-card border border-border rounded-xl">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-5 text-left">
                                    <h2 className="text-lg font-medium">Shop Settings</h2>
                                    <ChevronUp className={`h-5 w-5 transition-transform ${settingsOpen ? '' : 'rotate-180'}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="px-5 pb-5 space-y-5">
                                        {/* Default Language */}
                                        <div className="flex items-center justify-between">
                                            <Label>Default Language</Label>
                                            <div className="flex gap-2">
                                                <Button variant="default" size="sm" className="gap-2">
                                                    🇺🇸 English
                                                </Button>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    🇧🇩 Bangla
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Toggle Settings */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-2 border-b border-border">
                                                <div>
                                                    <Label className="text-base">Maintain Stock Quantity</Label>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Products with zero stock will be marked as "Out of Stock"
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={watch('maintain_stock')}
                                                    onCheckedChange={(checked) => setValue('maintain_stock', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-border">
                                                <div>
                                                    <Label className="text-base">Show Product Sold Count</Label>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Display how many times a product has been sold
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={watch('show_sold_count')}
                                                    onCheckedChange={(checked) => setValue('show_sold_count', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-border">
                                                <div>
                                                    <Label className="text-base">Allow Product Image Downloads</Label>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Individual products can control their own settings
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">[YES]</span>
                                                    <Switch
                                                        checked={watch('allow_image_downloads')}
                                                        onCheckedChange={(checked) => setValue('allow_image_downloads', checked)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-border">
                                                <div>
                                                    <Label className="text-base">Show Email Field for Place Order</Label>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        When disabled, email field will be hidden from checkout
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">[NO]</span>
                                                    <Switch
                                                        checked={watch('show_email_field')}
                                                        onCheckedChange={(checked) => setValue('show_email_field', checked)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between py-2 border-b border-border">
                                                <div>
                                                    <Label className="text-base">Enable Promo Code for Place Order</Label>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Customers can apply promo codes during checkout
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">[YES]</span>
                                                    <Switch
                                                        checked={watch('enable_promo_codes')}
                                                        onCheckedChange={(checked) => setValue('enable_promo_codes', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* VAT / Tax */}
                                        <div className="space-y-2 pt-2">
                                            <Label htmlFor="vat">VAT / Tax Percentage</Label>
                                            <Input id="vat" type="number" className="max-w-32" {...register('vat_percentage')} />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    </div>

                    {/* Right Column - Sidebar Cards */}
                    <div className="space-y-6">

                        {/* Shop QR */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-medium mb-4">Shop QR</h3>
                            <div className="bg-white p-4 rounded-lg flex items-center justify-center mb-3">
                                <div className="w-32 h-32 bg-[repeating-conic-gradient(#000_0_25%,#fff_0_50%)] bg-[length:8px_8px] rounded" />
                            </div>
                            <p className="text-sm text-muted-foreground text-center mb-2">
                                Scan the QR code to visit your shop
                            </p>
                            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-3">
                                <span className="text-sm text-muted-foreground truncate flex-1">
                                    https://yourshop.com/...
                                </span>
                                <button className="text-muted-foreground hover:text-foreground">
                                    📋
                                </button>
                            </div>
                            <Button className="w-full bg-accent hover:bg-accent/90">
                                <Download className="h-4 w-4 mr-2" />
                                Save QR Code
                            </Button>
                        </div>

                        {/* Shop Logo Upload */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-medium mb-4">Shop Logo</h3>
                            <LogoUploader
                                currentUrl={watch('logo_url')}
                                onUploadComplete={(url) => setValue('logo_url', url)}
                            />
                        </div>

                        {/* Shop Favicon Upload */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-medium mb-4">Shop Favicon</h3>
                            <FaviconUploader
                                currentUrl={watch('favicon_url')}
                                onUploadComplete={(url) => setValue('favicon_url', url)}
                            />
                        </div>

                        {/* Shop Theme */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-medium mb-4">Shop Theme</h3>
                            <div
                                className="aspect-video rounded-lg mb-3 relative overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}88 100%)` }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <input
                                    type="range"
                                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: 'linear-gradient(to right, red, yellow, lime, aqua, blue, magenta, red)'
                                    }}
                                    min="0"
                                    max="360"
                                    onChange={(e) => setValue('theme_color', `hsl(${e.target.value}, 70%, 60%)`)}
                                />
                            </div>
                            <Button className="w-full bg-accent hover:bg-accent/90 mb-2">
                                Save Theme Color
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Palette className="h-4 w-4 mr-2" />
                                Customize Shop Theme
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ShopSettings;
