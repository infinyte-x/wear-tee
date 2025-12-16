import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Share2, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const socialLinks = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage', color: 'text-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourpage', color: 'text-pink-500' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel', color: 'text-red-500' },
    { id: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourhandle', color: 'text-gray-800' },
    { id: 'tiktok', label: 'TikTok', icon: Share2, placeholder: 'https://tiktok.com/@yourpage', color: 'text-gray-900' },
    { id: 'linkedin', label: 'LinkedIn', icon: Share2, placeholder: 'https://linkedin.com/company/yourcompany', color: 'text-blue-700' },
    { id: 'pinterest', label: 'Pinterest', icon: Share2, placeholder: 'https://pinterest.com/yourpage', color: 'text-red-600' },
];

const ecommerceLinks = [
    { id: 'daraz', label: 'Daraz Store', placeholder: 'https://daraz.com.bd/shop/yourstore' },
    { id: 'evaly', label: 'Evaly Store', placeholder: 'https://evaly.com.bd/shop/yourstore' },
    { id: 'amazon', label: 'Amazon Store', placeholder: 'https://amazon.com/shops/yourstore' },
];

const SocialLinks = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Social Links</h1>
                        <p className="text-muted-foreground text-sm">Add your social media and store links</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Social Media Links */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-accent/10 rounded-lg">
                                <Share2 className="h-5 w-5 text-accent" />
                            </div>
                            <h2 className="text-lg font-medium">Social Media</h2>
                        </div>

                        <div className="space-y-4">
                            {socialLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <div key={link.id} className="space-y-2">
                                        <Label htmlFor={link.id} className="flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${link.color}`} />
                                            {link.label}
                                        </Label>
                                        <Input id={link.id} placeholder={link.placeholder} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* E-commerce Store Links */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-lg font-medium mb-4">E-commerce Marketplaces</h2>

                            <div className="space-y-4">
                                {ecommerceLinks.map((link) => (
                                    <div key={link.id} className="space-y-2">
                                        <Label htmlFor={link.id}>{link.label}</Label>
                                        <Input id={link.id} placeholder={link.placeholder} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Other Links */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-lg font-medium mb-4">Other Links</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input id="website" placeholder="https://yourwebsite.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="blog">Blog</Label>
                                    <Input id="blog" placeholder="https://yourblog.com" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button size="lg">Save All Links</Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SocialLinks;
