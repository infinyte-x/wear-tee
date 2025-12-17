
export type BlockType =
    | 'hero'
    | 'text'
    | 'image'
    | 'gallery'
    | 'product-grid'
    | 'features'
    | 'newsletter'
    | 'faq'
    | 'testimonials'
    | 'video'
    | 'cta'
    | 'columns'
    | 'spacer'
    | 'countdown'
    | 'category-grid'
    | 'stats'
    | 'logo-carousel'
    | 'map'
    | 'social-feed';

export interface BlockData {
    id: string;
    type: BlockType;
    content: any; // Flexible content based on type
}

export interface BlockDefinition {
    type: BlockType;
    label: string;
    icon: React.ElementType; // Lucide icon
    defaultContent: any;
}
