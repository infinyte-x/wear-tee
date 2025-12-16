import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Menu, MessageSquare, Megaphone, GripVertical, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface NavItem {
    id: string;
    label: string;
    href: string;
    order: number;
}

const LayoutCustomization = () => {
    const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();
    const [navItems, setNavItems] = useState<NavItem[]>([]);

    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: settings,
    });

    useEffect(() => {
        if (settings) {
            reset(settings);
            // Initialize navigation items from settings
            const rawItems = settings.navigation_items as any[];
            if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
                // Ensure each item has an id
                const items = rawItems.map((item, index) => ({
                    id: item.id || crypto.randomUUID(),
                    label: item.label || 'Link',
                    href: item.href || '/',
                    order: item.order ?? index,
                }));
                setNavItems(items);
            } else {
                // Default items if none exist
                setNavItems([
                    { id: crypto.randomUUID(), label: 'Shop', href: '/products', order: 0 },
                    { id: crypto.randomUUID(), label: 'Collections', href: '/collections', order: 1 },
                    { id: crypto.randomUUID(), label: 'About', href: '/about', order: 2 },
                ]);
            }
        }
    }, [settings, reset]);

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(navItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order property
        const updatedItems = items.map((item, index) => ({ ...item, order: index }));
        setNavItems(updatedItems);
    };

    const addNavItem = () => {
        const newItem: NavItem = {
            id: crypto.randomUUID(),
            label: 'New Link',
            href: '/',
            order: navItems.length,
        };
        setNavItems([...navItems, newItem]);
    };

    const updateNavItem = (id: string, field: 'label' | 'href', value: string) => {
        setNavItems(navItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeNavItem = (id: string) => {
        setNavItems(navItems.filter(item => item.id !== id));
    };

    const onSubmit = (data: any) => {
        // Format navigation items for database (strip id, keep label, href, order)
        const formattedNavItems = navItems.map((item, index) => ({
            label: item.label,
            href: item.href,
            order: index,
        }));
        console.log('Saving navigation items:', formattedNavItems);
        updateSettings({ ...data, navigation_items: formattedNavItems });
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
                            <h1 className="text-2xl font-semibold text-foreground">Layout</h1>
                            <p className="text-sm text-muted-foreground">Configure Navigation, Footer, and Announcement Banner</p>
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
                    <Tabs defaultValue="navigation" className="space-y-6">
                        <TabsList className="grid grid-cols-3 w-full max-w-md">
                            <TabsTrigger value="navigation" className="flex items-center gap-2">
                                <Menu className="h-4 w-4" />
                                <span>Navigation</span>
                            </TabsTrigger>
                            <TabsTrigger value="footer" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Footer</span>
                            </TabsTrigger>
                            <TabsTrigger value="banner" className="flex items-center gap-2">
                                <Megaphone className="h-4 w-4" />
                                <span>Banner</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Navigation Tab */}
                        <TabsContent value="navigation" className="space-y-6">
                            {/* Navigation Settings */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-6">Navigation Settings</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
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

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
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

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div>
                                            <Label>Show Wishlist Icon</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Display wishlist heart icon in navigation
                                            </p>
                                        </div>
                                        <Switch
                                            checked={watch('show_wishlist')}
                                            onCheckedChange={(checked) => setValue('show_wishlist', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Menu Editor */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-medium">Navigation Menu</h3>
                                        <p className="text-sm text-muted-foreground">Drag to reorder, edit labels and links</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addNavItem}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Link
                                    </Button>
                                </div>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="nav-items">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2"
                                            >
                                                {navItems.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-transparent transition-all ${snapshot.isDragging ? 'border-accent shadow-lg' : 'hover:border-border'
                                                                    }`}
                                                            >
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
                                                                >
                                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                                </div>

                                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                                    <Input
                                                                        value={item.label}
                                                                        onChange={(e) => updateNavItem(item.id, 'label', e.target.value)}
                                                                        placeholder="Label"
                                                                        className="h-9"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Input
                                                                            value={item.href}
                                                                            onChange={(e) => updateNavItem(item.id, 'href', e.target.value)}
                                                                            placeholder="/path or https://..."
                                                                            className="h-9 flex-1"
                                                                        />
                                                                        {item.href.startsWith('http') && (
                                                                            <a
                                                                                href={item.href}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-2 text-muted-foreground hover:text-foreground"
                                                                            >
                                                                                <ExternalLink className="h-4 w-4" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeNavItem(item.id)}
                                                                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>

                                {navItems.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No navigation items. Click "Add Link" to create one.
                                    </div>
                                )}

                                {/* Preview */}
                                <div className="mt-6 pt-6 border-t">
                                    <Label className="mb-3 block">Preview</Label>
                                    <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
                                        {navItems.map((item) => (
                                            <span key={item.id} className="text-sm font-medium text-foreground hover:text-accent cursor-pointer">
                                                {item.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Footer Tab */}
                        <TabsContent value="footer" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-6">Footer Content</h3>

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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                        <div className="space-y-2">
                                            <Label htmlFor="twitter_url">Twitter/X URL</Label>
                                            <Input
                                                id="twitter_url"
                                                {...register('twitter_url')}
                                                placeholder="https://x.com/yourstore"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="youtube_url">YouTube URL</Label>
                                            <Input
                                                id="youtube_url"
                                                {...register('youtube_url')}
                                                placeholder="https://youtube.com/@yourstore"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Banner Tab */}
                        <TabsContent value="banner" className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-medium mb-6">Announcement Banner</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
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

                                            {/* Animation & Page Visibility */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Animation Style</Label>
                                                    <select
                                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                                        value={(watch as any)('announcement_animation') || 'none'}
                                                        onChange={(e) => (setValue as any)('announcement_animation', e.target.value)}
                                                    >
                                                        <option value="none">None</option>
                                                        <option value="marquee">Marquee (scrolling)</option>
                                                        <option value="pulse">Pulse (breathing)</option>
                                                        <option value="bounce">Bounce (subtle)</option>
                                                        <option value="slide">Slide In</option>
                                                    </select>
                                                    <p className="text-xs text-muted-foreground">
                                                        Choose how the text animates
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Show On Pages</Label>
                                                    <select
                                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                                        value={(watch as any)('announcement_show_on') || 'all'}
                                                        onChange={(e) => (setValue as any)('announcement_show_on', e.target.value)}
                                                    >
                                                        <option value="all">All Pages</option>
                                                        <option value="home">Home Page Only</option>
                                                        <option value="products">Products & Collections</option>
                                                    </select>
                                                    <p className="text-xs text-muted-foreground">
                                                        Where the banner appears
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Preview */}
                                            <div className="mt-4">
                                                <Label>Preview</Label>
                                                <div
                                                    className="mt-2 p-3 rounded-lg text-center text-sm font-medium overflow-hidden"
                                                    style={{
                                                        backgroundColor: watch('announcement_bg_color') || '#000000',
                                                        color: watch('announcement_text_color') || '#ffffff',
                                                    }}
                                                >
                                                    <span className={`inline-block ${(watch as any)('announcement_animation') === 'pulse' ? 'animate-pulse' :
                                                        (watch as any)('announcement_animation') === 'bounce' ? 'animate-bounce-subtle' : ''
                                                        }`}>
                                                        {watch('announcement_text') || 'Your announcement appears here'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    💡 Banner does not appear in Admin Panel
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LayoutCustomization;
