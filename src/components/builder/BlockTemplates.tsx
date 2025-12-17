import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlockData, BlockType } from './types';
import { LayoutTemplate, Sparkles, ShoppingBag, MessageSquare, Users, Megaphone } from 'lucide-react';

interface BlockTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    category: 'hero' | 'content' | 'ecommerce' | 'social' | 'marketing';
    blocks: Array<{ type: BlockType; content: any }>;
}

const BLOCK_TEMPLATES: BlockTemplate[] = [
    {
        id: 'hero-with-features',
        name: 'Hero + Features',
        description: 'Full-width hero section followed by a features grid',
        icon: Sparkles,
        category: 'hero',
        blocks: [
            {
                type: 'hero',
                content: {
                    slides: [{
                        title: 'Welcome to Our Store',
                        subtitle: 'Discover amazing products crafted with care',
                        buttonText: 'Shop Now',
                        buttonLink: '/products',
                        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600'
                    }],
                    autoPlay: true
                }
            },
            {
                type: 'features',
                content: {
                    title: 'Why Choose Us',
                    subtitle: 'We stand out from the crowd',
                    features: [
                        { icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' },
                        { icon: 'shield', title: 'Secure Payment', description: '100% protected transactions' },
                        { icon: 'refresh', title: 'Easy Returns', description: '30-day return policy' },
                        { icon: 'headphones', title: '24/7 Support', description: 'Always here to help' }
                    ]
                }
            }
        ]
    },
    {
        id: 'product-showcase',
        name: 'Product Showcase',
        description: 'Featured products with a call-to-action banner',
        icon: ShoppingBag,
        category: 'ecommerce',
        blocks: [
            {
                type: 'product-grid',
                content: {
                    title: 'Featured Products',
                    subtitle: 'Hand-picked just for you',
                    featuredOnly: true,
                    limit: 4
                }
            },
            {
                type: 'cta',
                content: {
                    title: 'Ready to Shop?',
                    description: 'Explore our full collection and find your perfect item',
                    buttonText: 'View All Products',
                    buttonLink: '/products',
                    variant: 'gradient'
                }
            }
        ]
    },
    {
        id: 'testimonials-section',
        name: 'Social Proof',
        description: 'Customer testimonials with stats counter',
        icon: MessageSquare,
        category: 'social',
        blocks: [
            {
                type: 'stats',
                content: {
                    title: 'Trusted by Thousands',
                    items: [
                        { value: 10000, suffix: '+', label: 'Happy Customers' },
                        { value: 500, suffix: '+', label: 'Products Sold' },
                        { value: 99, suffix: '%', label: 'Satisfaction Rate' },
                        { value: 24, suffix: '/7', label: 'Support' }
                    ],
                    variant: 'cards',
                    animateNumbers: true
                }
            },
            {
                type: 'testimonials',
                content: {
                    title: 'What Our Customers Say',
                    testimonials: [
                        { name: 'Sarah J.', role: 'Verified Buyer', quote: 'Amazing quality and fast shipping! Highly recommend.' },
                        { name: 'Mike R.', role: 'Regular Customer', quote: 'Best online shopping experience I\'ve had.' },
                        { name: 'Emily T.', role: 'First-time Buyer', quote: 'The product exceeded my expectations. Will buy again!' }
                    ]
                }
            }
        ]
    },
    {
        id: 'newsletter-cta',
        name: 'Newsletter Signup',
        description: 'Newsletter form with countdown timer for urgency',
        icon: Megaphone,
        category: 'marketing',
        blocks: [
            {
                type: 'countdown',
                content: {
                    title: 'Limited Time Offer Ends In',
                    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    variant: 'default',
                    showDays: true,
                    showHours: true,
                    showMinutes: true,
                    showSeconds: true
                }
            },
            {
                type: 'newsletter',
                content: {
                    title: 'Subscribe & Save 20%',
                    description: 'Join our newsletter and get exclusive discounts',
                    buttonText: 'Subscribe Now',
                    placeholder: 'Enter your email'
                }
            }
        ]
    },
    {
        id: 'about-section',
        name: 'About Us',
        description: 'Text content with logo carousel of partners',
        icon: Users,
        category: 'content',
        blocks: [
            {
                type: 'text',
                content: {
                    text: '<h2 style="text-align: center;">About Our Brand</h2><p style="text-align: center;">We believe in quality, sustainability, and making a difference. Every product is crafted with care, using ethically sourced materials.</p>'
                }
            },
            {
                type: 'logo-carousel',
                content: {
                    title: 'As Featured In',
                    speed: 'normal',
                    grayscale: true,
                    logos: [
                        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+1', alt: 'Brand 1' },
                        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+2', alt: 'Brand 2' },
                        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+3', alt: 'Brand 3' },
                        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+4', alt: 'Brand 4' }
                    ]
                }
            }
        ]
    },
    {
        id: 'contact-section',
        name: 'Contact & Location',
        description: 'Map with FAQ accordion',
        icon: LayoutTemplate,
        category: 'content',
        blocks: [
            {
                type: 'map',
                content: {
                    title: 'Visit Our Store',
                    address: '123 Main Street, New York, NY 10001',
                    showAddressCard: true,
                    buttonText: 'Get Directions'
                }
            },
            {
                type: 'faq',
                content: {
                    title: 'Frequently Asked Questions',
                    subtitle: 'Got questions? We have answers',
                    items: [
                        { question: 'What are your store hours?', answer: 'We are open Monday-Saturday, 9am-8pm.' },
                        { question: 'Do you offer international shipping?', answer: 'Yes! We ship to over 50 countries worldwide.' },
                        { question: 'What is your return policy?', answer: 'We offer hassle-free 30-day returns on all items.' }
                    ]
                }
            }
        ]
    }
];

interface BlockTemplatesProps {
    onInsertTemplate: (blocks: BlockData[]) => void;
}

export function BlockTemplates({ onInsertTemplate }: BlockTemplatesProps) {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleInsert = (template: BlockTemplate) => {
        const blocksToInsert: BlockData[] = template.blocks.map(block => ({
            id: crypto.randomUUID(),
            type: block.type,
            content: JSON.parse(JSON.stringify(block.content))
        }));
        onInsertTemplate(blocksToInsert);
        setOpen(false);
    };

    const filteredTemplates = selectedCategory
        ? BLOCK_TEMPLATES.filter(t => t.category === selectedCategory)
        : BLOCK_TEMPLATES;

    const categories = [
        { id: 'hero', label: 'Hero' },
        { id: 'content', label: 'Content' },
        { id: 'ecommerce', label: 'E-commerce' },
        { id: 'social', label: 'Social Proof' },
        { id: 'marketing', label: 'Marketing' },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <LayoutTemplate className="h-4 w-4" />
                    Templates
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Block Templates</DialogTitle>
                    <DialogDescription>
                        Insert pre-built sections to quickly build your page
                    </DialogDescription>
                </DialogHeader>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 pb-2 border-b">
                    <Button
                        variant={selectedCategory === null ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-4">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                                onClick={() => handleInsert(template)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <template.icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {template.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.blocks.map((block, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs bg-muted px-2 py-0.5 rounded capitalize"
                                                >
                                                    {block.type.replace('-', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Insert
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
