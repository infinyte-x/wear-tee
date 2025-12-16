import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';

const themes = [
    { id: 'basic', name: 'Basic', description: 'Clean and simple design', isPremium: false },
    { id: 'modern', name: 'Modern', description: 'Contemporary look with smooth animations', isPremium: false },
    { id: 'elegant', name: 'Elegant', description: 'Luxurious and sophisticated', isPremium: true },
    { id: 'minimal', name: 'Minimal', description: 'Focus on content with less distraction', isPremium: false },
    { id: 'bold', name: 'Bold', description: 'Strong colors and typography', isPremium: true },
    { id: 'classic', name: 'Classic', description: 'Timeless and traditional', isPremium: true },
];

const ThemeCustomization = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">Customize Theme</h1>
                    <p className="text-muted-foreground mt-1">
                        Select a theme and customize your store's appearance
                    </p>
                </div>

                {/* Theme Grid */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium mb-4">Select Theme</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {themes.map((theme) => (
                            <label key={theme.id} className="relative cursor-pointer group">
                                <input type="radio" name="theme" className="peer sr-only" defaultChecked={theme.id === 'modern'} />
                                <div className="border-2 border-border rounded-xl p-6 peer-checked:border-accent peer-checked:bg-accent/5 transition-all group-hover:border-accent/50">
                                    {/* Theme Preview Placeholder */}
                                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center text-muted-foreground">
                                        Preview
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium">{theme.name}</h3>
                                            <p className="text-sm text-muted-foreground">{theme.description}</p>
                                        </div>
                                        {theme.isPremium && (
                                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                    {/* Check mark for selected */}
                                    <div className="absolute top-4 right-4 peer-checked:block hidden">
                                        <div className="bg-accent rounded-full p-1">
                                            <Check className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Color Mode */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Color Mode</h2>
                    <div className="flex items-center space-x-4">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <Switch id="dark-mode" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Enable dark mode theme for your store
                    </p>
                </div>

                {/* Feature Toggles */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Feature Toggles</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="buy-now">Show "Buy Now" Button</Label>
                                <p className="text-sm text-muted-foreground">Display quick buy button on products</p>
                            </div>
                            <Switch id="buy-now" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="wishlist">Enable Wishlist</Label>
                                <p className="text-sm text-muted-foreground">Allow customers to save products</p>
                            </div>
                            <Switch id="wishlist" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="reviews">Product Reviews</Label>
                                <p className="text-sm text-muted-foreground">Enable customer reviews on products</p>
                            </div>
                            <Switch id="reviews" />
                        </div>
                    </div>
                </div>

                <Button size="lg">Save Changes</Button>
            </div>
        </AdminLayout>
    );
};

export default ThemeCustomization;
