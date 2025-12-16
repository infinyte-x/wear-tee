import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Globe, Copy, ExternalLink, CheckCircle } from 'lucide-react';

const ShopDomain = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-semibold text-foreground">Shop Domain</h1>
                </div>

                {/* Free Domain Section */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Globe className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">Free Subdomain</h2>
                            <p className="text-sm text-muted-foreground">Your free shop URL</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subdomain">Your Shop URL</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 flex">
                                    <Input
                                        id="subdomain"
                                        placeholder="yourshop"
                                        className="rounded-r-none"
                                    />
                                    <div className="bg-muted px-4 flex items-center border border-l-0 border-border rounded-r-lg text-sm text-muted-foreground">
                                        .brandlaunch.app
                                    </div>
                                </div>
                                <Button variant="outline" size="icon">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button>Save Subdomain</Button>
                    </div>
                </div>

                {/* Custom Domain Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Globe className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">Custom Domain</h2>
                            <p className="text-sm text-muted-foreground">Connect your own domain</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="customDomain">Custom Domain</Label>
                            <Input id="customDomain" placeholder="www.yourdomain.com" />
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-sm">Setup Instructions (Cloudflare CNAME)</h3>
                            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                <li>Go to your domain's DNS settings</li>
                                <li>Add a CNAME record pointing to: <code className="bg-muted px-2 py-0.5 rounded">shops.brandlaunch.app</code></li>
                                <li>Wait for DNS propagation (up to 24 hours)</li>
                                <li>Click "Verify Domain" below</li>
                            </ol>
                        </div>

                        <div className="flex gap-2">
                            <Button>Verify Domain</Button>
                            <Button variant="outline">Save Domain</Button>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                            <div className="font-medium text-sm">SSL Certificate</div>
                            <div className="text-xs text-muted-foreground">Active & Secure</div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                            <div className="font-medium text-sm">Domain Status</div>
                            <div className="text-xs text-muted-foreground">Connected</div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ShopDomain;
