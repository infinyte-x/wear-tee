
export type BlockType = 'hero' | 'text' | 'image' | 'gallery' | 'product-grid' | 'features' | 'newsletter';

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
