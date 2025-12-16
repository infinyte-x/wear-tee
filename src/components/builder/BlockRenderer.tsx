
import { BlockData } from "./types";
import { cn } from "@/lib/utils";

// Placeholder components for blocks
const HeroBlock = ({ content }: { content: any }) => (
    <div className="py-20 px-8 bg-zinc-900 text-white text-center rounded-lg">
        <h2 className="text-4xl font-bold mb-4">{content.title || "Hero Title"}</h2>
        <p className="text-xl opacity-80">{content.subtitle || "Subtitle goes here"}</p>
    </div>
);

const TextBlock = ({ content }: { content: any }) => (
    <div className="prose max-w-none p-4">
        {content.text ? <div dangerouslySetInnerHTML={{ __html: content.text }} /> : <p>Rich text content...</p>}
    </div>
);

const ImageBlock = ({ content }: { content: any }) => (
    <div className="w-full">
        <img
            src={content.url || "https://placehold.co/800x400"}
            alt={content.alt || "Block image"}
            className="w-full h-auto rounded shadow-sm"
        />
    </div>
);

import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { NewsletterBlock } from "./blocks/NewsletterBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";

export function BlockRenderer({ block }: { block: BlockData }) {
    switch (block.type) {
        case 'hero': return <HeroBlock content={block.content} />;
        case 'text': return <TextBlock content={block.content} />;
        case 'image': return <ImageBlock content={block.content} />;
        case 'features': return <FeaturesBlock content={block.content} />;
        case 'newsletter': return <NewsletterBlock content={block.content} />;
        case 'product-grid': return <ProductGridBlock content={block.content} />;
        default: return <div className="p-4 border border-dashed text-center text-muted-foreground">Unknown block: {block.type}</div>;
    }
}
