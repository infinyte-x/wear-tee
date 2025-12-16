import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import {
    Settings,
    Globe,
    FileText,
    Truck,
    CreditCard,
    Search,
    MessageSquare,
    Share2,
    ArrowRight,
    Smartphone
} from 'lucide-react';

const shopSections = [
    {
        title: 'Shop Settings',
        description: 'Basic info, logo, contact, and store preferences',
        icon: Settings,
        href: '/admin/manage-shop/settings',
        color: 'bg-blue-500/10 text-blue-500'
    },
    {
        title: 'Shop Domain',
        description: 'Free subdomain and custom domain setup',
        icon: Globe,
        href: '/admin/manage-shop/domain',
        color: 'bg-purple-500/10 text-purple-500'
    },
    {
        title: 'Shop Policy',
        description: 'About, privacy, terms, return & refund policies',
        icon: FileText,
        href: '/admin/manage-shop/policy',
        color: 'bg-green-500/10 text-green-500'
    },
    {
        title: 'Delivery Support',
        description: 'Delivery charges and courier integrations',
        icon: Truck,
        href: '/admin/manage-shop/delivery',
        color: 'bg-orange-500/10 text-orange-500'
    },
    {
        title: 'Payment Gateway',
        description: 'Payment methods and gateway configuration',
        icon: CreditCard,
        href: '/admin/manage-shop/payment',
        color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
        title: 'SEO & Marketing',
        description: 'GTM, Facebook Pixel, TikTok Pixel setup',
        icon: Search,
        href: '/admin/manage-shop/seo',
        color: 'bg-pink-500/10 text-pink-500'
    },
    {
        title: 'SMS Support',
        description: 'SMS provider integration and OTP settings',
        icon: Smartphone,
        href: '/admin/manage-shop/sms',
        color: 'bg-yellow-500/10 text-yellow-600'
    },
    {
        title: 'Chat Support',
        description: 'Facebook Messenger & WhatsApp integration',
        icon: MessageSquare,
        href: '/admin/manage-shop/chat',
        color: 'bg-cyan-500/10 text-cyan-500'
    },
    {
        title: 'Social Links',
        description: 'Configure your social media links',
        icon: Share2,
        href: '/admin/manage-shop/social',
        color: 'bg-indigo-500/10 text-indigo-500'
    }
];

const ManageShop = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">Manage Shop</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure your store settings, policies, and integrations
                    </p>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {shopSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <Link
                                key={section.title}
                                to={section.href}
                                className="group bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-lg ${section.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                                <h3 className="font-medium text-foreground mt-4 group-hover:text-accent transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {section.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageShop;
