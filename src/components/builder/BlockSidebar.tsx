
import { DraggableBlockItem } from "./DraggableBlockItem";
import { Type, Image, LayoutGrid, Layers, ShoppingBag } from "lucide-react";
import { BlockDefinition } from "./types";

const AVAILABLE_BLOCKS: BlockDefinition[] = [
    { type: 'hero', label: 'Hero Section', icon: Layers, defaultContent: {} },
    { type: 'text', label: 'Rich Text', icon: Type, defaultContent: {} },
    { type: 'image', label: 'Image / Gallery', icon: Image, defaultContent: {} },
    { type: 'product-grid', label: 'Product Grid', icon: ShoppingBag, defaultContent: {} },
    { type: 'features', label: 'Features List', icon: LayoutGrid, defaultContent: {} },
    { type: 'newsletter', label: 'Newsletter', icon: Type, defaultContent: {} },
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
