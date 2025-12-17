
import { DraggableBlockItem } from "./DraggableBlockItem";
import {
    Type,
    Image,
    LayoutGrid,
    Layers,
    ShoppingBag,
    HelpCircle,
    MessageSquareQuote,
    PlayCircle,
    MousePointerClick,
    Columns,
    Images,
    Mail,
    Minus,
    Timer,
    Grid3X3,
    TrendingUp,
    CircleDot,
    MapPin,
    Instagram
} from "lucide-react";
import { BlockDefinition } from "./types";

const AVAILABLE_BLOCKS: BlockDefinition[] = [
    // Layout & Structure
    { type: 'hero', label: 'Hero Section', icon: Layers, defaultContent: {} },
    { type: 'columns', label: 'Columns', icon: Columns, defaultContent: { columns: 2 } },
    { type: 'spacer', label: 'Spacer/Divider', icon: Minus, defaultContent: { height: 'medium' } },

    // Content
    { type: 'text', label: 'Rich Text', icon: Type, defaultContent: {} },
    { type: 'image', label: 'Image', icon: Image, defaultContent: {} },
    { type: 'gallery', label: 'Image Gallery', icon: Images, defaultContent: {} },
    { type: 'video', label: 'Video Embed', icon: PlayCircle, defaultContent: {} },

    // E-commerce
    { type: 'product-grid', label: 'Product Grid', icon: ShoppingBag, defaultContent: {} },
    { type: 'category-grid', label: 'Category Grid', icon: Grid3X3, defaultContent: {} },

    // Social Proof
    { type: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, defaultContent: {} },
    { type: 'stats', label: 'Stats Counter', icon: TrendingUp, defaultContent: {} },
    { type: 'logo-carousel', label: 'Logo Carousel', icon: CircleDot, defaultContent: {} },

    // Engagement
    { type: 'features', label: 'Features List', icon: LayoutGrid, defaultContent: {} },
    { type: 'faq', label: 'FAQ Accordion', icon: HelpCircle, defaultContent: {} },
    { type: 'cta', label: 'Call to Action', icon: MousePointerClick, defaultContent: {} },
    { type: 'newsletter', label: 'Newsletter', icon: Mail, defaultContent: {} },
    { type: 'countdown', label: 'Countdown Timer', icon: Timer, defaultContent: {} },

    // Location & Social
    { type: 'map', label: 'Map/Location', icon: MapPin, defaultContent: {} },
    { type: 'social-feed', label: 'Social Feed', icon: Instagram, defaultContent: {} },
];

export function BlockSidebar() {
    return (
        <div className="w-64 border-r bg-muted/30 overflow-y-auto p-4 shrink-0">
            <h3 className="font-medium mb-4 text-sm text-muted-foreground">Components</h3>
            <div className="space-y-1">
                {AVAILABLE_BLOCKS.map((block) => (
                    <DraggableBlockItem
                        key={block.type}
                        type={block.type}
                        label={block.label}
                        icon={block.icon}
                    />
                ))}
            </div>
        </div>
    );
}
