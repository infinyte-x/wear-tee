
import { BlockData } from "./types";
import { cn } from "@/lib/utils";

// Block components
import { HeroBlock } from "./blocks/HeroBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { NewsletterBlock } from "./blocks/NewsletterBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";
import { FAQBlock } from "./blocks/FAQBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { CTABlock } from "./blocks/CTABlock";
import { ColumnsBlock } from "./blocks/ColumnsBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { SpacerBlock } from "./blocks/SpacerBlock";
import { CountdownBlock } from "./blocks/CountdownBlock";
import { CategoryGridBlock } from "./blocks/CategoryGridBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { LogoCarouselBlock } from "./blocks/LogoCarouselBlock";
import { MapBlock } from "./blocks/MapBlock";
import { SocialFeedBlock } from "./blocks/SocialFeedBlock";

// Inline components for simple blocks
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

export function BlockRenderer({ block }: { block: BlockData }) {
    switch (block.type) {
        case 'hero': return <HeroBlock content={block.content} />;
        case 'text': return <TextBlock content={block.content} />;
        case 'image': return <ImageBlock content={block.content} />;
        case 'features': return <FeaturesBlock content={block.content} />;
        case 'newsletter': return <NewsletterBlock content={block.content} />;
        case 'product-grid': return <ProductGridBlock content={block.content} />;
        case 'faq': return <FAQBlock content={block.content} />;
        case 'testimonials': return <TestimonialsBlock content={block.content} />;
        case 'video': return <VideoBlock content={block.content} />;
        case 'cta': return <CTABlock content={block.content} />;
        case 'columns': return <ColumnsBlock content={block.content} />;
        case 'gallery': return <GalleryBlock content={block.content} />;
        case 'spacer': return <SpacerBlock content={block.content} />;
        case 'countdown': return <CountdownBlock content={block.content} />;
        case 'category-grid': return <CategoryGridBlock content={block.content} />;
        case 'stats': return <StatsBlock content={block.content} />;
        case 'logo-carousel': return <LogoCarouselBlock content={block.content} />;
        case 'map': return <MapBlock content={block.content} />;
        case 'social-feed': return <SocialFeedBlock content={block.content} />;
        default: return <div className="p-4 border border-dashed text-center text-muted-foreground">Unknown block: {block.type}</div>;
    }
}

