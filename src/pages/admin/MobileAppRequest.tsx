import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Apple, Monitor, CheckCircle } from 'lucide-react';

const MobileAppRequest = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">Mobile App Request</h1>
                    <p className="text-muted-foreground mt-1">
                        Request a custom mobile app for your store
                    </p>
                </div>

                {/* Platform Selection */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Select Platform</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="relative cursor-pointer">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="flex flex-col items-center p-6 border-2 border-border rounded-xl peer-checked:border-accent peer-checked:bg-accent/5 transition-all">
                                <div className="p-3 bg-green-500/10 rounded-lg mb-3">
                                    <Monitor className="h-8 w-8 text-green-500" />
                                </div>
                                <span className="font-medium">Android</span>
                                <span className="text-sm text-muted-foreground">Play Store</span>
                            </div>
                        </label>
                        <label className="relative cursor-pointer">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="flex flex-col items-center p-6 border-2 border-border rounded-xl peer-checked:border-accent peer-checked:bg-accent/5 transition-all">
                                <div className="p-3 bg-gray-500/10 rounded-lg mb-3">
                                    <Apple className="h-8 w-8 text-gray-700" />
                                </div>
                                <span className="font-medium">iOS</span>
                                <span className="text-sm text-muted-foreground">App Store</span>
                            </div>
                        </label>
                        <label className="relative cursor-pointer">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="flex flex-col items-center p-6 border-2 border-border rounded-xl peer-checked:border-accent peer-checked:bg-accent/5 transition-all">
                                <div className="p-3 bg-purple-500/10 rounded-lg mb-3">
                                    <Smartphone className="h-8 w-8 text-purple-500" />
                                </div>
                                <span className="font-medium">Both</span>
                                <span className="text-sm text-muted-foreground">Android + iOS</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* App Details Form */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">App Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="appName">App Name</Label>
                            <Input id="appName" placeholder="Enter your app name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input id="contactEmail" type="email" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input id="contactPhone" placeholder="+880 1XXX-XXXXXX" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brandColor">Brand Color</Label>
                            <Input id="brandColor" type="color" className="h-10 w-full" defaultValue="#6366f1" />
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Features Included</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            'Product Catalog',
                            'Shopping Cart',
                            'Secure Checkout',
                            'Order Tracking',
                            'Push Notifications',
                            'Customer Accounts',
                            'Wishlist',
                            'Search & Filters'
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button size="lg" className="w-full md:w-auto">
                    Submit App Request
                </Button>
            </div>
        </AdminLayout>
    );
};

export default MobileAppRequest;
