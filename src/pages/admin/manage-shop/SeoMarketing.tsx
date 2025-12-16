import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Facebook, BarChart3, ExternalLink, Copy } from 'lucide-react';

const SeoMarketing = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">SEO & Marketing</h1>
                        <p className="text-muted-foreground text-sm">Configure tracking pixels and marketing integrations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sitemaps & Feeds */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Search className="h-5 w-5 text-green-500" />
                            </div>
                            <h2 className="text-lg font-medium">Sitemaps & Data Feeds</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">XML Sitemap</div>
                                    <div className="text-xs text-muted-foreground">For Google Search Console</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                        Copy URL
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <div className="font-medium text-sm">Facebook Data Feed</div>
                                    <div className="text-xs text-muted-foreground">For Facebook Catalog</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                        Copy URL
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Google Tag Manager */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                            </div>
                            <h2 className="text-lg font-medium">Google Tag Manager</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gtmId">GTM Container ID</Label>
                                <Input id="gtmId" placeholder="GTM-XXXXXXX" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enter your Google Tag Manager container ID to enable tracking.
                            </p>
                            <Button>Save GTM Settings</Button>
                        </div>
                    </div>

                    {/* Facebook Pixel */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600/10 rounded-lg">
                                <Facebook className="h-5 w-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-medium">Facebook Pixel</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fbPixel">Pixel ID</Label>
                                <Input id="fbPixel" placeholder="Enter Facebook Pixel ID" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fbToken">Conversions API Token (Optional)</Label>
                                <Input id="fbToken" type="password" placeholder="Enter token for server-side tracking" />
                            </div>
                            <Button>Save Facebook Pixel</Button>
                        </div>
                    </div>

                    {/* TikTok Pixel */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gray-900/10 rounded-lg">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-medium">TikTok Pixel</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tiktokPixel">TikTok Pixel ID</Label>
                                <Input id="tiktokPixel" placeholder="Enter TikTok Pixel ID" />
                            </div>
                            <Button>Save TikTok Pixel</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SeoMarketing;
